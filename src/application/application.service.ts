import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/s3/s3.service';
import { NotificationService } from '../common/notification/notification.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  AdminApplicationListItemDto,
  AdminApplicationListResponseDto,
  ApplicationResponseDto,
  UpdateApplicationStatusResponseDto,
} from './dto/application-response.dto';
import { UploadableFile } from '../common/s3/s3.service';
import { ApplicationListQueryDto } from './dto/application-list-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    dto: CreateApplicationDto,
    file?: UploadableFile,
  ): Promise<ApplicationResponseDto> {
    if (!dto.privacyAgreed) {
      throw new BadRequestException('개인정보 수집·이용 동의가 필요합니다.');
    }

    const recruit = await this.prisma.recruit.findUnique({
      where: { id: dto.recruitId },
    });
    if (!recruit) {
      throw new NotFoundException('존재하지 않는 공고입니다.');
    }

    let attachment: { url: string; key: string; name: string } | null = null;
    if (file) {
      const { url, key } = await this.s3Service.upload(file, 'applications');
      attachment = { url, key, name: file.originalname };
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          type: 'PARTNER',
        },
      });

      return tx.application.create({
        data: {
          recruitId: dto.recruitId,
          accountId: account.id,
          introduction: dto.introduction,
          privacyAgreedAt: new Date(),
          ...(attachment && {
            attachmentUrl: attachment.url,
            attachmentKey: attachment.key,
            attachmentName: attachment.name,
          }),
        },
      });
    });

    void this.notificationService
      .notify(application.id)
      .catch((err: Error) =>
        this.logger.error(
          `Notification failed for application ${application.id}: ${err.message}`,
        ),
      );

    return {
      id: application.id,
      recruitId: application.recruitId,
      status: application.status,
      createdAt: application.createdAt,
      introduction: application.introduction,
      attachmentUrl: application.attachmentUrl ?? null,
    };
  }

  async findAll(
    query: ApplicationListQueryDto,
  ): Promise<AdminApplicationListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.recruitId ? { recruitId: query.recruitId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        include: {
          account: { select: { name: true, phone: true } },
          recruit: { select: { roleDesc: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: AdminApplicationListItemDto[] = data.map((app) => ({
      id: app.id,
      recruitId: app.recruitId,
      roleDesc: app.recruit.roleDesc,
      companyName: app.recruit.companyName,
      name: app.account.name,
      phone: app.account.phone,
      introduction: app.introduction,
      attachmentUrl: app.attachmentUrl ?? null,
      attachmentName: app.attachmentName ?? null,
      status: app.status,
      createdAt: app.createdAt,
    }));

    return { items, total, page, limit };
  }

  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<UpdateApplicationStatusResponseDto> {
    const existing = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('존재하지 않는 지원서입니다.');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, status: true, updatedAt: true },
    });

    return updated;
  }
}

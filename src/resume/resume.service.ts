import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/s3/s3.service';
import { NotificationService } from '../common/notification/notification.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import {
  AdminResumeListItemDto,
  AdminResumeListResponseDto,
  ResumeResponseDto,
  UpdateResumeStatusResponseDto,
} from './dto/resume-response.dto';
import { UploadableFile } from '../common/s3/s3.service';
import { ResumeListQueryDto } from './dto/resume-list-query.dto';
import { UpdateResumeStatusDto } from './dto/update-resume-status.dto';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    dto: CreateResumeDto,
    file?: UploadableFile,
  ): Promise<ResumeResponseDto> {
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
      const { url, key } = await this.s3Service.upload(file, 'resumes');
      attachment = { url, key, name: file.originalname };
    }

    const resume = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          type: 'PARTNER',
        },
      });

      return tx.resume.create({
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
      .notify(resume.id)
      .catch((err: Error) =>
        this.logger.error(
          `Notification failed for resume ${resume.id}: ${err.message}`,
        ),
      );

    return {
      id: resume.id,
      recruitId: resume.recruitId,
      status: resume.status,
      createdAt: resume.createdAt,
      introduction: resume.introduction,
      attachmentUrl: resume.attachmentUrl ?? null,
    };
  }

  async findAll(
    query: ResumeListQueryDto,
  ): Promise<AdminResumeListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.recruitId ? { recruitId: query.recruitId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.resume.count({ where }),
      this.prisma.resume.findMany({
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

    const items: AdminResumeListItemDto[] = data.map((resume) => ({
      id: resume.id,
      recruitId: resume.recruitId,
      roleDesc: resume.recruit.roleDesc,
      companyName: resume.recruit.companyName,
      name: resume.account.name,
      phone: resume.account.phone,
      introduction: resume.introduction,
      attachmentUrl: resume.attachmentUrl ?? null,
      attachmentName: resume.attachmentName ?? null,
      status: resume.status,
      createdAt: resume.createdAt,
    }));

    return { items, total, page, limit };
  }

  async updateStatus(
    id: string,
    dto: UpdateResumeStatusDto,
  ): Promise<UpdateResumeStatusResponseDto> {
    const existing = await this.prisma.resume.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('존재하지 않는 지원서입니다.');
    }

    const updated = await this.prisma.resume.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, status: true, updatedAt: true },
    });

    return updated;
  }
}

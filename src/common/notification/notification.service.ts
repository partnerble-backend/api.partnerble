import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Account, Recruit, Resume } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type ResumeWithRelations = Resume & {
  account: Account;
  recruit: Recruit & { account: Account };
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;
  private readonly operatorEmail: string;

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.sesClient = new SESClient({
      region: configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.fromEmail = configService.getOrThrow<string>('SES_FROM_EMAIL');
    this.operatorEmail = configService.getOrThrow<string>('OPERATOR_EMAIL');
  }

  async notify(resumeId: string): Promise<void> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        account: true,
        recruit: {
          include: { account: true },
        },
      },
    });

    if (!resume) {
      this.logger.warn(`Resume ${resumeId} not found — skipping notification`);
      return;
    }

    const results = await Promise.allSettled([
      this.sendToOperator(resume),
      this.sendToFounder(resume),
    ]);

    const allSucceeded = results.every((r) => r.status === 'fulfilled');

    if (allSucceeded) {
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: { emailNotifiedAt: new Date() },
      });
    } else {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const target = index === 0 ? 'operator' : 'founder';
          this.logger.error(
            `Email to ${target} failed for resume ${resumeId}: ${(result.reason as Error).message}`,
          );
        }
      });
    }
  }

  private async sendToOperator(resume: ResumeWithRelations): Promise<void> {
    const { account: partner, recruit, introduction, attachmentUrl } = resume;
    const subject = `[파트너블] 새 지원자 — ${recruit.roleDesc}`;
    const body = [
      `공고명: ${recruit.roleDesc}`,
      `지원자 이름: ${partner.name}`,
      `연락처: ${partner.phone}`,
      `자기소개: ${introduction}`,
      `첨부파일 URL: ${attachmentUrl ?? '없음'}`,
    ].join('\n');

    await this.sendEmail(this.operatorEmail, subject, body);
  }

  private async sendToFounder(resume: ResumeWithRelations): Promise<void> {
    const { account: partner, recruit, introduction, attachmentUrl } = resume;
    const founderEmail = recruit.account.email;

    if (!founderEmail) {
      this.logger.warn(
        `Founder has no email for recruit ${recruit.id} — skipping founder notification`,
      );
      return;
    }

    const subject = `[파트너블] ${recruit.roleDesc} 공고에 새 지원자가 있습니다`;
    const body = [
      `안녕하세요, 파트너블입니다.`,
      ``,
      `${recruit.roleDesc} 공고에 새로운 지원자가 있습니다.`,
      ``,
      `지원자 이름: ${partner.name}`,
      `연락처: ${partner.phone}`,
      `자기소개: ${introduction}`,
      `첨부파일 URL: ${attachmentUrl ?? '없음'}`,
      ``,
      `파트너블을 이용해 주셔서 감사합니다.`,
    ].join('\n');

    await this.sendEmail(founderEmail, subject, body);
  }

  async notifyRecruitSubmission(data: {
    recruitId: string;
    companyName: string;
    roleDesc: string;
    name: string;
    email: string;
  }): Promise<void> {
    const subject = `[파트너블] 새 공고 신청 — ${data.companyName}`;
    const body = [
      `회사명: ${data.companyName}`,
      `역할: ${data.roleDesc}`,
      `신청자 이름: ${data.name}`,
      `신청자 이메일: ${data.email}`,
    ].join('\n');

    try {
      await this.sendEmail(this.operatorEmail, subject, body);
    } catch (error) {
      this.logger.error(
        `Recruit notification failed for recruit ${data.recruitId}: ${(error as Error).message}`,
      );
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    await this.sesClient.send(
      new SendEmailCommand({
        Source: this.fromEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: { Text: { Data: body, Charset: 'UTF-8' } },
        },
      }),
    );
  }
}

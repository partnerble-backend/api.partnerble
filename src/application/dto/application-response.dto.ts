import { ApplicationStatus } from '@prisma/client';

export class ApplicationResponseDto {
  id: string;
  recruitId: string;
  status: ApplicationStatus;
  createdAt: Date;
}

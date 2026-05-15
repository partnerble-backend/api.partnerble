import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notify(applicationId: string): Promise<void> {
    this.logger.log(`Notification triggered for application ${applicationId}`);
  }
}

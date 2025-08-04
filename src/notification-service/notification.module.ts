// notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';

@Module({
  providers: [NotificationServiceService],
  exports: [NotificationServiceService] 
})
export class NotificationModule {}

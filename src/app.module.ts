import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import * as Joi from 'joi';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './common/s3/s3.module';
import { ApplicationModule } from './application/application.module';
import { RecruitModule } from './recruit/recruit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        OPERATOR_EMAIL: Joi.string().email().required(),
        SES_FROM_EMAIL: Joi.string().email().required(),
        ADMIN_API_KEY: Joi.string().required(),
      }),
    }),
    PrismaModule,
    S3Module,
    ApplicationModule,
    RecruitModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}

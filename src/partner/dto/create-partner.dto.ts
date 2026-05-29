import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'partner@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '010-1234-5678' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  phone?: string;

  @ApiProperty({ type: [String], example: ['SNS 운영', '영상 편집', '디자인'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  interestTags: string[];

  @ApiProperty({ example: '뷰티/코스메틱' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  industry: string;
}

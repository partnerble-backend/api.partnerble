import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiProperty({ example: 'clx...' })
  @IsString()
  @IsNotEmpty()
  recruitId: string;

  @ApiProperty({ example: '홍길동', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '010-1234-5678', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phone: string;

  @ApiProperty({
    example: '안녕하세요, 마케팅 경력 3년차입니다.',
    maxLength: 400,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  introduction: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  privacyAgreed: boolean;
}

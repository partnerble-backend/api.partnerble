import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFounderDto {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'founder@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phone: string;
}

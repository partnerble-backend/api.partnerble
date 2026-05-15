import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  recruitId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contact: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  introduction: string;

  @IsBoolean()
  privacyAgreed: boolean;
}

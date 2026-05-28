import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: '계정 등록',
    operationId: 'createAccount',
    description: `계정을 등록합니다.
    • type이 PARTNER인 경우 interestTags, industry 필수
    • type이 FOUNDER인 경우 Account만 생성됩니다`,
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: '계정 등록 성공' })
  @ApiResponse({
    status: 400,
    description:
      '유효성 검사 실패 (PARTNER 타입에 interestTags/industry 미전달 포함)',
  })
  create(@Body() dto: CreateAccountDto): Promise<Account> {
    return this.accountService.create(dto);
  }
}

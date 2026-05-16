import { ApiProperty } from '@nestjs/swagger';

export class ListResponseDto<T> {
  items: T[];

  @ApiProperty()
  total: number;
}

export class PaginatedResponseDto<T> {
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

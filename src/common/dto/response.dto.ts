import { ApiProperty } from '@nestjs/swagger';

export class ListResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  total: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

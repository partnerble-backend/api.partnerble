/**
 * 페이지네이션 없는 목록 조회 응답 (GET /resources)
 *
 * 사용: 전체 목록을 한 번에 반환하는 엔드포인트
 * 예) GET /recruits → RecruitListResponseDto extends ListResponseDto<RecruitListItemDto>
 */
export class ListResponseDto<T> {
  items: T[];
  total: number;
}

/**
 * 페이지네이션 목록 조회 응답 (GET /resources?page=1&limit=20)
 *
 * 사용: page/limit 쿼리 파라미터를 받아 분할 반환하는 엔드포인트
 * 예) GET /applications → ApplicationListResponseDto extends PaginatedResponseDto<ApplicationListItemDto>
 */
export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

import { FilteringService } from './filtering.service';
import { PaginationService } from './pagination.service';
import { SearchService } from './search.service';
import { SortingService } from './sorting.service';

describe('Shared query services', () => {
  const rows = [
    { id: 1, name: 'Miami Academy', status: 'active', score: 3 },
    { id: 2, name: 'Eastern Heights College', status: 'active', score: 1 },
    { id: 3, name: 'ABC Manufacturing', status: 'suspended', score: 2 },
  ];

  it('paginates result sets', () => {
    const service = new PaginationService();
    const result = service.paginate(rows, { page: 2, limit: 1 });

    expect(result.items).toEqual([rows[1]]);
    expect(result.meta).toMatchObject({
      page: 2,
      limit: 1,
      total: 3,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
      offset: 1,
    });
  });

  it('filters result sets by field values', () => {
    const service = new FilteringService();
    const result = service.filter(rows, { status: 'active' });

    expect(result).toHaveLength(2);
    expect(result.every((row) => row.status === 'active')).toBe(true);
  });

  it('searches result sets across named fields', () => {
    const service = new SearchService();
    const result = service.search(rows, 'heights', ['name']);

    expect(result).toEqual([rows[1]]);
  });

  it('sorts result sets by field', () => {
    const service = new SortingService();
    const result = service.sort(rows, 'score', 'desc');

    expect(result.map((row) => row.score)).toEqual([3, 2, 1]);
  });
});


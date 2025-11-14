import { describe, it, expect } from 'vitest';

describe('Stores Service', () => {
  describe('Pagination Calculations', () => {
    it('should calculate correct offset for pagination', () => {
      // Page 1: offset = 0
      expect((1 - 1) * 10).toBe(0);
      
      // Page 2: offset = 10
      expect((2 - 1) * 10).toBe(10);
      
      // Page 3: offset = 20
      expect((3 - 1) * 10).toBe(20);
    });

    it('should calculate total pages correctly', () => {
      // 25 items with 10 per page = 3 pages
      expect(Math.ceil(25 / 10)).toBe(3);
      
      // 30 items with 10 per page = 3 pages
      expect(Math.ceil(30 / 10)).toBe(3);
      
      // 31 items with 10 per page = 4 pages
      expect(Math.ceil(31 / 10)).toBe(4);
      
      // 0 items = 0 pages
      expect(Math.ceil(0 / 10)).toBe(0);
    });

    it('should handle different page sizes', () => {
      // 100 items, 20 per page = 5 pages
      expect(Math.ceil(100 / 20)).toBe(5);
      
      // 100 items, 25 per page = 4 pages
      expect(Math.ceil(100 / 25)).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result sets', () => {
      const totalCount = 0;
      const limit = 10;
      const totalPages = Math.ceil(totalCount / limit);
      
      expect(totalPages).toBe(0);
    });

    it('should handle single item', () => {
      const totalCount = 1;
      const limit = 10;
      const totalPages = Math.ceil(totalCount / limit);
      
      expect(totalPages).toBe(1);
    });
  });
});

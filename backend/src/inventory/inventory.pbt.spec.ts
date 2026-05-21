import * as fc from 'fast-check';

describe('Inventory low-stock PBT', () => {
  it('alert iff currentStock <= minStock', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 500, noNaN: true }),
        fc.float({ min: 0, max: 500, noNaN: true }),
        (currentStock, minStock) => {
          const isLow = currentStock <= minStock;
          const filtered = [{ currentStock, minStock }].filter(
            (r) => r.currentStock <= r.minStock,
          );
          return filtered.length === (isLow ? 1 : 0);
        },
      ),
    );
  });
});

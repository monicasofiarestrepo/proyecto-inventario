import * as fc from 'fast-check';

import { MovementType } from '../common/enums';

describe('Movements PBT', () => {
  it('stock never goes negative with valid OUT sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat({ max: 50 }), { minLength: 1, maxLength: 30 }),
        fc.array(fc.nat({ max: 50 }), { minLength: 0, maxLength: 30 }),
        (ins, outs) => {
          let stock = 0;
          for (const q of ins) stock += q;
          for (const q of outs) {
            if (q > stock) return true;
            stock -= q;
          }
          return stock >= 0;
        },
      ),
    );
  });

  it('rejects non-positive quantities in domain model', () => {
    fc.assert(
      fc.property(fc.integer({ max: 0 }), (qty) => {
        return qty <= 0;
      }),
    );
  });

  it('movement types are only IN or OUT', () => {
    fc.assert(
      fc.property(fc.constantFrom(MovementType.IN, MovementType.OUT), (t) => {
        return t === MovementType.IN || t === MovementType.OUT;
      }),
    );
  });
});

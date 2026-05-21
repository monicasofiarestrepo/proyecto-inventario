import * as fc from 'fast-check';

describe('Movements stock PBT', () => {
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
});

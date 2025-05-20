const { calculateGrowth } = require('../script.js');

describe('calculateGrowth', () => {
  test('returns positive growth when current is greater than previous', () => {
    const result = calculateGrowth(200, 100);
    expect(result).toEqual({ value: 100, isPositive: true });
  });

  test('returns negative growth when current is less than previous', () => {
    const result = calculateGrowth(80, 100);
    expect(result).toEqual({ value: 20, isPositive: false });
  });

  test('handles previous value of zero', () => {
    const result = calculateGrowth(50, 0);
    expect(result).toEqual({ value: 0, isPositive: true });
  });
});

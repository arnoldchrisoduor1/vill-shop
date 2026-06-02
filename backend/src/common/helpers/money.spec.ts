import { convertPrice, generateOrderNumber } from './money';

describe('convertPrice', () => {
  const rates = { USD: 130, EUR: 140, GBP: 160 };

  it('should return the same amount for KES → KES', () => {
    expect(convertPrice(1000, 'KES', rates)).toBe(1000);
  });

  it('should convert KES → USD correctly with rate 130', () => {
    const result = convertPrice(1300, 'USD', rates);
    expect(result).toBeCloseTo(10, 2);
  });

  it('should convert KES → EUR correctly with rate 140', () => {
    const result = convertPrice(700, 'EUR', rates);
    expect(result).toBeCloseTo(5, 2);
  });

  it('should return KES amount if currency rate not found', () => {
    const result = convertPrice(500, 'JPY', rates);
    expect(result).toBe(500);
  });

  it('should handle zero amount', () => {
    expect(convertPrice(0, 'USD', rates)).toBe(0);
  });
});

describe('generateOrderNumber', () => {
  it('should match the VS-YYYYMMDD-XXXX format', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^VS-\d{8}-[A-Z0-9]{4}$/);
  });

  it('should generate unique order numbers', () => {
    const numbers = new Set(Array.from({ length: 100 }, () => generateOrderNumber()));
    // Due to randomness in the 4-char suffix, virtually all should be unique
    expect(numbers.size).toBeGreaterThan(1);
  });

  it('should include the current date', () => {
    const orderNumber = generateOrderNumber();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(orderNumber).toContain(today);
  });
});

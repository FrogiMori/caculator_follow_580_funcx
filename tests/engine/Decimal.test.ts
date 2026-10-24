import { describe, it, expect } from 'vitest';
import { Decimal } from '../../src/engine/decimal';
import { MathError } from '../../src/engine/errors';

describe('Decimal (Độ chính xác số thập phân BCD chuẩn Casio fx-580VN X)', () => {
  it('không bị lỗi sai số dấu chấm động của IEEE 754 (0.1 + 0.2 = 0.3)', () => {
    const d1 = Decimal.fromString('0.1');
    const d2 = Decimal.fromString('0.2');
    const sum = d1.add(d2);

    expect(sum.formatDisplay('NORM1')).toBe('0.3');
  });

  it('nhân thập phân chính xác: 0.1 × 0.2 = 0.02', () => {
    const d1 = Decimal.fromString('0.1');
    const d2 = Decimal.fromString('0.2');
    const prod = d1.mul(d2);

    expect(prod.formatDisplay('NORM1')).toBe('0.02');
  });

  it('phép tính 1/3 × 3 đạt giá trị 1 chính xác', () => {
    const one = Decimal.one();
    const three = Decimal.fromNumber(3);
    const third = one.div(three);
    const back = third.mul(three);

    expect(back.formatDisplay('NORM1')).toBe('1');
  });

  it('định dạng Norm 1: chuyển sang ký pháp khoa học khi < 0.01 hoặc >= 10^10', () => {
    // 0.005 < 0.01 -> 5×10^-3
    const d1 = Decimal.fromString('0.005');
    expect(d1.formatDisplay('NORM1')).toBe('5×10^-3');

    // 0.05 >= 0.01 -> giữ dạng thập phân 0.05
    const d2 = Decimal.fromString('0.05');
    expect(d2.formatDisplay('NORM1')).toBe('0.05');

    // 10^10 -> 1×10^10
    const d3 = Decimal.fromString('10000000000');
    expect(d3.formatDisplay('NORM1')).toBe('1×10^10');

    // 1234567890 -> 10 chữ số vẫn giữ nguyên
    const d4 = Decimal.fromString('1234567890');
    expect(d4.formatDisplay('NORM1')).toBe('1234567890');
  });

  it('định dạng Norm 2: chỉ chuyển sang số mũ khi < 10^-9 hoặc >= 10^10', () => {
    const d = Decimal.fromString('0.005');
    expect(d.formatDisplay('NORM2')).toBe('0.005');

    const tiny = Decimal.fromString('0.0000000005'); // 5×10^-10 < 10^-9
    expect(tiny.formatDisplay('NORM2')).toBe('5×10^-10');
  });

  it('định dạng Fix: cố định số chữ số sau dấu phẩy', () => {
    const d = Decimal.fromString('3.14159265');
    expect(d.formatDisplay('FIX', 2)).toBe('3.14');
    expect(d.formatDisplay('FIX', 4)).toBe('3.1416');
    expect(d.formatDisplay('FIX', 0)).toBe('3');
  });

  it('định dạng Sci: ký pháp khoa học với số chữ số có nghĩa chỉ định', () => {
    const d = Decimal.fromString('12345');
    expect(d.formatDisplay('SCI', 3)).toBe('1.23×10^4');
    expect(d.formatDisplay('SCI', 5)).toBe('1.2345×10^4');
  });

  it('báo lỗi Overflow khi kết quả đạt ngưỡng |x| ≥ 10^100', () => {
    expect(() => {
      const large = Decimal.fromString('1×10^99');
      large.mul(Decimal.fromString('10'));
    }).toThrow(MathError);

    try {
      const large = Decimal.fromString('1×10^99');
      large.mul(Decimal.fromString('10'));
    } catch (e) {
      const err = e as MathError;
      expect(err.code).toBe('OVERFLOW');
    }
  });

  it('tự động làm tròn về 0 khi kết quả Underflow (|x| < 10^-99)', () => {
    const small = Decimal.fromString('1×10^-99');
    const smaller = small.div(Decimal.fromString('100'));
    expect(smaller.isZero()).toBe(true);
    expect(smaller.formatDisplay('NORM1')).toBe('0');
  });
});

import { describe, it, expect } from 'vitest';
import { Fraction, gcd } from '../../src/engine/fraction';
import { MathError } from '../../src/engine/errors';

describe('Fraction (Phân số chính xác cao Casio fx-580VN X)', () => {
  it('tính đúng ước chung lớn nhất (GCD)', () => {
    expect(gcd(12n, 18n)).toBe(6n);
    expect(gcd(-15n, 20n)).toBe(5n);
    expect(gcd(0n, 5n)).toBe(5n);
    expect(gcd(7n, 13n)).toBe(1n);
  });

  it('tự động rút gọn phân số khi khởi tạo', () => {
    const f1 = new Fraction(2n, 4n);
    expect(f1.num).toBe(1n);
    expect(f1.den).toBe(2n);

    const f2 = new Fraction(15n, 25n);
    expect(f2.num).toBe(3n);
    expect(f2.den).toBe(5n);

    const f3 = new Fraction(-6n, 8n);
    expect(f3.num).toBe(-3n);
    expect(f3.den).toBe(4n);

    const f4 = new Fraction(6n, -8n);
    expect(f4.num).toBe(-3n);
    expect(f4.den).toBe(4n);
  });

  it('báo lỗi khi mẫu số bằng 0', () => {
    expect(() => new Fraction(5n, 0n)).toThrow(MathError);
    try {
      new Fraction(5n, 0n);
    } catch (e) {
      const err = e as MathError;
      expect(err.code).toBe('DIVISION_BY_ZERO');
    }
  });

  it('chuyển đổi chính xác từ chuỗi số thập phân và ký pháp khoa học', () => {
    const f1 = Fraction.fromNumberString('0.5');
    expect(f1.toString()).toBe('1/2');

    const f2 = Fraction.fromNumberString('0.25');
    expect(f2.toString()).toBe('1/4');

    const f3 = Fraction.fromNumberString('12.5');
    expect(f3.toString()).toBe('25/2');

    const f4 = Fraction.fromNumberString('3×10^2');
    expect(f4.toString()).toBe('300');

    const f5 = Fraction.fromNumberString('2.5×10^-1');
    expect(f5.toString()).toBe('1/4');
  });

  it('thực hiện 4 phép tính phân số chính xác tuyệt đối', () => {
    // 1/2 + 1/3 = 5/6
    const f1 = new Fraction(1n, 2n);
    const f2 = new Fraction(1n, 3n);
    expect(f1.add(f2).toString()).toBe('5/6');

    // 3/4 - 1/2 = 1/4
    const f3 = new Fraction(3n, 4n);
    expect(f3.sub(f1).toString()).toBe('1/4');

    // 2/3 * 3/4 = 1/2
    const f4 = new Fraction(2n, 3n);
    expect(f4.mul(f3).toString()).toBe('1/2');

    // 1/2 / 1/4 = 2
    const f5 = new Fraction(1n, 4n);
    expect(f1.div(f5).toString()).toBe('2');
  });

  it('lũy thừa phân số với số mũ nguyên dương và âm', () => {
    const f = new Fraction(2n, 3n);
    expect(f.pow(3n).toString()).toBe('8/27');
    expect(f.pow(0n).toString()).toBe('1');
    expect(f.pow(-2n).toString()).toBe('9/4');
  });

  it('chuyển đổi sang hỗn số (Mixed Fraction)', () => {
    const f = new Fraction(7n, 2n);
    const mixed = f.toMixedFraction();
    expect(mixed.whole).toBe(3n);
    expect(mixed.num).toBe(1n);
    expect(mixed.den).toBe(2n);
  });

  it('chuyển đổi sang số thập phân làm tròn nửa lên', () => {
    const f1 = new Fraction(1n, 3n);
    expect(f1.toDecimalString(10)).toBe('0.3333333333');

    const f2 = new Fraction(2n, 3n);
    expect(f2.toDecimalString(10)).toBe('0.6666666667');

    const f3 = new Fraction(1n, 8n);
    expect(f3.toDecimalString(10)).toBe('0.125');
  });
});

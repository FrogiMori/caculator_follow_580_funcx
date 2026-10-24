import { describe, it, expect } from 'vitest';
import { ComplexNumber, ComplexResult } from '../../src/engine/complex';
import { Decimal } from '../../src/engine/decimal';
import { MathError } from '../../src/engine/errors';

function makeDecimal(n: number): Decimal {
  if (n === 0) return Decimal.zero();
  return Decimal.fromNumber(n);
}

function makeComplex(re: number, im: number): ComplexNumber {
  return new ComplexNumber(makeDecimal(re), makeDecimal(im));
}

describe('ComplexNumber - Phép cộng', () => {
  it('(1+2i) + (3-i) = 4+i', () => {
    const a = makeComplex(1, 2);
    const b = makeComplex(3, -1);
    const result = a.add(b);
    expect(result.re.toNumber()).toBeCloseTo(4, 10);
    expect(result.im.toNumber()).toBeCloseTo(1, 10);
  });

  it('(0+0i) + (1+i) = 1+i', () => {
    const a = makeComplex(0, 0);
    const b = makeComplex(1, 1);
    const result = a.add(b);
    expect(result.re.toNumber()).toBeCloseTo(1, 10);
    expect(result.im.toNumber()).toBeCloseTo(1, 10);
  });
});

describe('ComplexNumber - Phép trừ', () => {
  it('(3+2i) - (1+i) = 2+i', () => {
    const a = makeComplex(3, 2);
    const b = makeComplex(1, 1);
    const result = a.sub(b);
    expect(result.re.toNumber()).toBeCloseTo(2, 10);
    expect(result.im.toNumber()).toBeCloseTo(1, 10);
  });
});

describe('ComplexNumber - Phép nhân', () => {
  it('(1+2i)(3-i) = 5+5i', () => {
    // (1+2i)(3-i) = 3 - i + 6i - 2i² = 3 + 5i + 2 = 5 + 5i
    const a = makeComplex(1, 2);
    const b = makeComplex(3, -1);
    const result = a.mul(b);
    expect(result.re.toNumber()).toBeCloseTo(5, 10);
    expect(result.im.toNumber()).toBeCloseTo(5, 10);
  });

  it('i × i = -1', () => {
    const a = makeComplex(0, 1);
    const result = a.mul(a);
    expect(result.re.toNumber()).toBeCloseTo(-1, 10);
    expect(result.im.toNumber()).toBe(0);
  });
});

describe('ComplexNumber - Phép chia', () => {
  it('(1+i) / (1-i) = i (0+1i)', () => {
    // (1+i)/(1-i) = (1+i)²/((1-i)(1+i)) = (1+2i-1)/(1+1) = 2i/2 = i
    const a = makeComplex(1, 1);
    const b = makeComplex(1, -1);
    const result = a.div(b);
    expect(result.re.toNumber()).toBeCloseTo(0, 10);
    expect(result.im.toNumber()).toBeCloseTo(1, 10);
  });

  it('(4+2i) / 2 = 2+i', () => {
    const a = makeComplex(4, 2);
    const b = makeComplex(2, 0);
    const result = a.div(b);
    expect(result.re.toNumber()).toBeCloseTo(2, 10);
    expect(result.im.toNumber()).toBeCloseTo(1, 10);
  });

  it('chia cho 0 → Math ERROR', () => {
    const a = makeComplex(1, 1);
    const zero = makeComplex(0, 0);
    expect(() => a.div(zero)).toThrow(MathError);
  });
});

describe('ComplexNumber - Modulus (abs)', () => {
  it('|3+4i| = 5', () => {
    const c = makeComplex(3, 4);
    expect(c.abs().toNumber()).toBeCloseTo(5, 10);
  });

  it('|1+i| = √2', () => {
    const c = makeComplex(1, 1);
    expect(c.abs().toNumber()).toBeCloseTo(Math.SQRT2, 8);
  });

  it('|5+0i| = 5', () => {
    const c = makeComplex(5, 0);
    expect(c.abs().toNumber()).toBeCloseTo(5, 10);
  });
});

describe('ComplexNumber - Argument (arg)', () => {
  it('arg(1+i) = 45° trong mode Degree', () => {
    const c = makeComplex(1, 1);
    expect(c.arg('DEG').toNumber()).toBeCloseTo(45, 8);
  });

  it('arg(1+0i) = 0°', () => {
    const c = makeComplex(1, 0);
    expect(c.arg('DEG').toNumber()).toBeCloseTo(0, 10);
  });

  it('arg(0+1i) = 90°', () => {
    const c = makeComplex(0, 1);
    expect(c.arg('DEG').toNumber()).toBeCloseTo(90, 8);
  });

  it('arg(1+i) trong RAD = π/4', () => {
    const c = makeComplex(1, 1);
    expect(c.arg('RAD').toNumber()).toBeCloseTo(Math.PI / 4, 8);
  });
});

describe('ComplexNumber - Liên hợp (conj)', () => {
  it('conj(3+4i) = 3-4i', () => {
    const c = makeComplex(3, 4);
    const result = c.conj();
    expect(result.re.toNumber()).toBeCloseTo(3, 10);
    expect(result.im.toNumber()).toBeCloseTo(-4, 10);
  });

  it('conj(conj(z)) = z', () => {
    const c = makeComplex(2, -3);
    const result = c.conj().conj();
    expect(result.re.toNumber()).toBeCloseTo(2, 10);
    expect(result.im.toNumber()).toBeCloseTo(-3, 10);
  });
});

describe('ComplexNumber - isReal', () => {
  it('3+0i là số thực', () => {
    const c = makeComplex(3, 0);
    expect(c.isReal()).toBe(true);
  });

  it('1+i không phải số thực', () => {
    const c = makeComplex(1, 1);
    expect(c.isReal()).toBe(false);
  });
});

describe('ComplexNumber - fromReal và fromPolar', () => {
  it('fromReal(5) = 5+0i', () => {
    const c = ComplexNumber.fromReal(makeDecimal(5));
    expect(c.re.toNumber()).toBeCloseTo(5, 10);
    expect(c.im.isZero()).toBe(true);
  });

  it('fromPolar(1, 90°, DEG) = 0+1i', () => {
    const c = ComplexNumber.fromPolar(makeDecimal(1), makeDecimal(90), 'DEG');
    expect(c.re.toNumber()).toBeCloseTo(0, 10);
    expect(c.im.toNumber()).toBeCloseTo(1, 8);
  });

  it('fromPolar(5, 53.13°, DEG) ≈ 3+4i', () => {
    // 5∠53.13° ≈ 3+4i
    const theta = Math.atan2(4, 3) * 180 / Math.PI;
    const c = ComplexNumber.fromPolar(makeDecimal(5), makeDecimal(theta), 'DEG');
    expect(c.re.toNumber()).toBeCloseTo(3, 5);
    expect(c.im.toNumber()).toBeCloseTo(4, 5);
  });
});

describe('ComplexResult', () => {
  it('getDisplayText RECT hiển thị a+bi', () => {
    const c = makeComplex(3, 4);
    const r = new ComplexResult(c);
    const text = r.getDisplayText('DEG');
    expect(text).toContain('3');
    expect(text).toContain('4');
  });

  it('toggleView chuyển sang POLAR', () => {
    const c = makeComplex(3, 4);
    const r = new ComplexResult(c);
    expect(r.currentView).toBe('RECT');
    r.toggleView();
    expect(r.currentView).toBe('POLAR');
  });

  it('getDisplayText POLAR hiển thị r∠θ', () => {
    const c = makeComplex(3, 4);
    const r = new ComplexResult(c, 'POLAR');
    const text = r.getDisplayText('DEG');
    expect(text).toContain('∠');
  });
});

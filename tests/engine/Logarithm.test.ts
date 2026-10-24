import { describe, it, expect } from 'vitest';
import { evalLogarithm } from '../../src/engine/logarithm';
import { CalculationResult } from '../../src/engine/result';
import { Decimal } from '../../src/engine/decimal';
import { MathError } from '../../src/engine/errors';

function makeArg(value: number): CalculationResult {
  if (value === 0) return CalculationResult.zero();
  return CalculationResult.fromDecimal(Decimal.fromNumber(value), true);
}

describe('evalLogarithm - ln', () => {
  it('ln(e) = 1', () => {
    const e = Math.E;
    const result = evalLogarithm('ln', [makeArg(e)]);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('ln(1) = 0', () => {
    const result = evalLogarithm('ln', [makeArg(1)]);
    expect(result.decimal.toNumber()).toBeCloseTo(0, 10);
  });

  it('ln(e²) = 2', () => {
    const result = evalLogarithm('ln', [makeArg(Math.E * Math.E)]);
    expect(result.decimal.toNumber()).toBeCloseTo(2, 8);
  });

  it('ln(0) → Math ERROR', () => {
    expect(() => evalLogarithm('ln', [CalculationResult.zero()])).toThrow(MathError);
  });

  it('ln(-1) → Math ERROR', () => {
    expect(() => evalLogarithm('ln', [makeArg(-1)])).toThrow(MathError);
  });

  it('ln nhận đúng 1 đối số', () => {
    expect(() => evalLogarithm('ln', [])).toThrow(MathError);
    expect(() => evalLogarithm('ln', [makeArg(1), makeArg(2)])).toThrow(MathError);
  });
});

describe('evalLogarithm - log (cơ số 10)', () => {
  it('log(10) = 1', () => {
    const result = evalLogarithm('log', [makeArg(10)]);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('log(100) = 2', () => {
    const result = evalLogarithm('log', [makeArg(100)]);
    expect(result.decimal.toNumber()).toBeCloseTo(2, 10);
  });

  it('log(1000) = 3', () => {
    const result = evalLogarithm('log', [makeArg(1000)]);
    expect(result.decimal.toNumber()).toBeCloseTo(3, 10);
  });

  it('log(1) = 0', () => {
    const result = evalLogarithm('log', [makeArg(1)]);
    expect(result.decimal.toNumber()).toBeCloseTo(0, 10);
  });

  it('log(0) → Math ERROR', () => {
    expect(() => evalLogarithm('log', [CalculationResult.zero()])).toThrow(MathError);
  });

  it('log(-1) → Math ERROR', () => {
    expect(() => evalLogarithm('log', [makeArg(-1)])).toThrow(MathError);
  });
});

describe('evalLogarithm - log(a, b) cơ số tùy chọn', () => {
  it('log(2, 8) = 3', () => {
    const result = evalLogarithm('log', [makeArg(2), makeArg(8)]);
    expect(result.decimal.toNumber()).toBeCloseTo(3, 8);
  });

  it('log(2, 32) = 5', () => {
    const result = evalLogarithm('log', [makeArg(2), makeArg(32)]);
    expect(result.decimal.toNumber()).toBeCloseTo(5, 8);
  });

  it('log(10, 100) = 2', () => {
    const result = evalLogarithm('log', [makeArg(10), makeArg(100)]);
    expect(result.decimal.toNumber()).toBeCloseTo(2, 8);
  });

  it('log(1, 5) → Math ERROR (cơ số 1)', () => {
    expect(() => evalLogarithm('log', [makeArg(1), makeArg(5)])).toThrow(MathError);
  });

  it('log(0, 5) → Math ERROR (cơ số ≤ 0)', () => {
    expect(() => evalLogarithm('log', [CalculationResult.zero(), makeArg(5)])).toThrow(MathError);
  });

  it('log(-2, 8) → Math ERROR (cơ số âm)', () => {
    expect(() => evalLogarithm('log', [makeArg(-2), makeArg(8)])).toThrow(MathError);
  });

  it('log(2, 0) → Math ERROR (đối số = 0)', () => {
    expect(() => evalLogarithm('log', [makeArg(2), CalculationResult.zero()])).toThrow(MathError);
  });

  it('log(2, -8) → Math ERROR (đối số âm)', () => {
    expect(() => evalLogarithm('log', [makeArg(2), makeArg(-8)])).toThrow(MathError);
  });
});

describe('evalLogarithm - e^(x)', () => {
  it('e^(0) = 1', () => {
    const result = evalLogarithm('e^', [CalculationResult.zero()]);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('e^(1) = e', () => {
    const result = evalLogarithm('e^', [makeArg(1)]);
    expect(result.decimal.toNumber()).toBeCloseTo(Math.E, 8);
  });

  it('e^(2) ≈ 7.389', () => {
    const result = evalLogarithm('e^', [makeArg(2)]);
    expect(result.decimal.toNumber()).toBeCloseTo(Math.E * Math.E, 8);
  });

  it('e^ nhận đúng 1 đối số', () => {
    expect(() => evalLogarithm('e^', [])).toThrow(MathError);
  });
});

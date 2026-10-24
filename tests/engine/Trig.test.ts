import { describe, it, expect } from 'vitest';
import { evalTrig, AngleUnit } from '../../src/engine/trig';
import { CalculationResult } from '../../src/engine/result';
import { Decimal } from '../../src/engine/decimal';
import { MathError } from '../../src/engine/errors';

/**
 * Tạo CalculationResult từ số thực để làm đối số hàm lượng giác
 */
function makeArg(value: number): CalculationResult {
  if (value === 0) return CalculationResult.zero();
  return CalculationResult.fromDecimal(Decimal.fromNumber(value), true);
}

describe('evalTrig - Degree mode', () => {
  const DEG: AngleUnit = 'DEG';

  it('sin(0°) = 0', () => {
    const result = evalTrig('sin', [makeArg(0)], DEG);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('sin(30°) = 0.5', () => {
    const result = evalTrig('sin', [makeArg(30)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(0.5, 10);
  });

  it('sin(90°) = 1', () => {
    const result = evalTrig('sin', [makeArg(90)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('sin(180°) = 0 (không phải 1.22e-16)', () => {
    const result = evalTrig('sin', [makeArg(180)], DEG);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('cos(0°) = 1', () => {
    const result = evalTrig('cos', [makeArg(0)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('cos(60°) = 0.5', () => {
    const result = evalTrig('cos', [makeArg(60)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(0.5, 10);
  });

  it('cos(90°) = 0', () => {
    const result = evalTrig('cos', [makeArg(90)], DEG);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('tan(45°) = 1', () => {
    const result = evalTrig('tan', [makeArg(45)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('tan(90°) → Math ERROR', () => {
    expect(() => evalTrig('tan', [makeArg(90)], DEG)).toThrow(MathError);
  });

  it('tan(270°) → Math ERROR', () => {
    expect(() => evalTrig('tan', [makeArg(270)], DEG)).toThrow(MathError);
  });

  it('tan(-90°) → Math ERROR', () => {
    expect(() => evalTrig('tan', [makeArg(-90)], DEG)).toThrow(MathError);
  });
});

describe('evalTrig - Radian mode', () => {
  const RAD: AngleUnit = 'RAD';

  it('sin(0 RAD) = 0', () => {
    const result = evalTrig('sin', [makeArg(0)], RAD);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('sin(π/6 RAD) = 0.5', () => {
    const piOver6 = Math.PI / 6;
    const result = evalTrig('sin', [makeArg(piOver6)], RAD);
    expect(result.decimal.toNumber()).toBeCloseTo(0.5, 10);
  });

  it('sin(π RAD) = 0', () => {
    const result = evalTrig('sin', [makeArg(Math.PI)], RAD);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('cos(π/2 RAD) = 0', () => {
    const result = evalTrig('cos', [makeArg(Math.PI / 2)], RAD);
    expect(result.decimal.toNumber()).toBe(0);
  });
});

describe('evalTrig - Gradian mode', () => {
  const GRA: AngleUnit = 'GRA';

  it('sin(100 GRA) = 1 (100 gradian = 90°)', () => {
    const result = evalTrig('sin', [makeArg(100)], GRA);
    expect(result.decimal.toNumber()).toBeCloseTo(1, 10);
  });

  it('cos(100 GRA) = 0', () => {
    const result = evalTrig('cos', [makeArg(100)], GRA);
    expect(result.decimal.toNumber()).toBe(0);
  });

  it('tan(100 GRA) → Math ERROR', () => {
    expect(() => evalTrig('tan', [makeArg(100)], GRA)).toThrow(MathError);
  });
});

describe('evalTrig - Hàm ngược (Inverse)', () => {
  const DEG: AngleUnit = 'DEG';
  const RAD: AngleUnit = 'RAD';

  it('sin⁻¹(0.5) = 30° trong mode Degree', () => {
    const result = evalTrig('sin⁻¹', [makeArg(0.5)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(30, 8);
  });

  it('arcsin(0.5) = 30° (alias)', () => {
    const result = evalTrig('arcsin', [makeArg(0.5)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(30, 8);
  });

  it('cos⁻¹(0.5) = 60° trong mode Degree', () => {
    const result = evalTrig('cos⁻¹', [makeArg(0.5)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(60, 8);
  });

  it('tan⁻¹(1) = 45° trong mode Degree', () => {
    const result = evalTrig('tan⁻¹', [makeArg(1)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(45, 8);
  });

  it('arctan(1) = 45° (alias)', () => {
    const result = evalTrig('arctan', [makeArg(1)], DEG);
    expect(result.decimal.toNumber()).toBeCloseTo(45, 8);
  });

  it('sin⁻¹(π/6 RAD) ≈ 0.5236 rad', () => {
    // sin⁻¹(0.5) trong mode RAD = π/6 ≈ 0.5236
    const result = evalTrig('sin⁻¹', [makeArg(0.5)], RAD);
    expect(result.decimal.toNumber()).toBeCloseTo(Math.PI / 6, 8);
  });

  it('sin⁻¹(x) với |x| > 1 → Math ERROR', () => {
    expect(() => evalTrig('sin⁻¹', [makeArg(1.5)], DEG)).toThrow(MathError);
  });

  it('cos⁻¹(x) với |x| > 1 → Math ERROR', () => {
    expect(() => evalTrig('cos⁻¹', [makeArg(-2)], DEG)).toThrow(MathError);
  });
});

describe('evalTrig - Kiểm tra số đối số', () => {
  it('sin với 0 đối số → Math ERROR', () => {
    expect(() => evalTrig('sin', [], 'DEG')).toThrow(MathError);
  });

  it('cos với 2 đối số → Math ERROR', () => {
    expect(() => evalTrig('cos', [makeArg(1), makeArg(2)], 'DEG')).toThrow(MathError);
  });
});

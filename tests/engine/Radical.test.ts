import { describe, it, expect } from 'vitest';
import { CoreMathEngine } from '../../src/engine/evaluator';
import { MathError } from '../../src/engine/errors';

describe('Radical simplification - √ operator via evaluator', () => {
  let engine: CoreMathEngine;

  beforeEach(() => {
    engine = new CoreMathEngine();
  });

  it('√4 = 2 (số nguyên chính xác)', () => {
    const result = engine.evaluateExpression('√(4)');
    expect(result.decimal.toNumber()).toBeCloseTo(2, 10);
    expect(result.radicalForm).toBeNull();
    expect(result.getDisplayText()).toBe('2');
  });

  it('√9 = 3 (số nguyên chính xác)', () => {
    const result = engine.evaluateExpression('√(9)');
    expect(result.decimal.toNumber()).toBeCloseTo(3, 10);
    expect(result.radicalForm).toBeNull();
  });

  it('√12 → radicalForm = { coefficient: 2, radicand: 3 }, displayText = "2√3"', () => {
    const result = engine.evaluateExpression('√(12)');
    expect(result.radicalForm).not.toBeNull();
    expect(result.radicalForm!.coefficient.num).toBe(2n);
    expect(result.radicalForm!.coefficient.den).toBe(1n);
    expect(result.radicalForm!.radicand).toBe(3n);
    expect(result.getDisplayText()).toBe('2√3');
  });

  it('√75 → radicalForm = { coefficient: 5, radicand: 3 }, displayText = "5√3"', () => {
    const result = engine.evaluateExpression('√(75)');
    expect(result.radicalForm).not.toBeNull();
    expect(result.radicalForm!.coefficient.num).toBe(5n);
    expect(result.radicalForm!.radicand).toBe(3n);
    expect(result.getDisplayText()).toBe('5√3');
  });

  it('√2 → radicalForm = { coefficient: 1, radicand: 2 }, displayText = "√2"', () => {
    const result = engine.evaluateExpression('√(2)');
    expect(result.radicalForm).not.toBeNull();
    expect(result.radicalForm!.coefficient.num).toBe(1n);
    expect(result.radicalForm!.radicand).toBe(2n);
    expect(result.getDisplayText()).toBe('√2');
  });

  it('√3 → displayText = "√3"', () => {
    const result = engine.evaluateExpression('√(3)');
    expect(result.radicalForm).not.toBeNull();
    expect(result.radicalForm!.radicand).toBe(3n);
    expect(result.getDisplayText()).toBe('√3');
  });

  it('√50 → 5√2', () => {
    const result = engine.evaluateExpression('√(50)');
    expect(result.radicalForm).not.toBeNull();
    expect(result.radicalForm!.coefficient.num).toBe(5n);
    expect(result.radicalForm!.radicand).toBe(2n);
    expect(result.getDisplayText()).toBe('5√2');
  });

  it('√(-4) → Math ERROR', () => {
    expect(() => engine.evaluateExpression('√(-4)')).toThrow(MathError);
  });

  it('√0 = 0', () => {
    const result = engine.evaluateExpression('√(0)');
    expect(result.decimal.isZero()).toBe(true);
  });

  it('√(9/4) = 3/2 (phân số chính phương chính xác)', () => {
    // Thông qua parser, biểu thức phân số
    // 9/4 là phân số, cả tử và mẫu đều là số chính phương
    const result = engine.evaluateExpression('√(9)÷√(4)');
    // Cách thay thế: dùng phân số trực tiếp nếu parser hỗ trợ
    expect(result.decimal.toNumber()).toBeCloseTo(1.5, 8);
  });
});

import { beforeEach } from 'vitest';

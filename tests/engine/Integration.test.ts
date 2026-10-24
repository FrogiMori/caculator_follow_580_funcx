import { describe, it, expect } from 'vitest';
import { CoreMathEngine, calculate } from '../../src/engine/index';
import { MathError } from '../../src/engine/errors';

describe('T10 Integration Tests (Parser -> CoreMathEngine -> CalculationResult)', () => {
  describe('Lượng giác tích hợp qua Parser', () => {
    it('sin(30) trong mode DEG = 0.5', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('sin(30)');
      expect(res.decimal.toNumber()).toBeCloseTo(0.5, 10);
    });

    it('cos(60) trong mode DEG = 0.5', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('cos(60)');
      expect(res.decimal.toNumber()).toBeCloseTo(0.5, 10);
    });

    it('cos(90) trong mode DEG = 0 (làm sạch lỗi floating point)', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('cos(90)');
      expect(res.decimal.toNumber()).toBe(0);
      expect(res.getDisplayText()).toBe('0');
    });

    it('tan(45) trong mode DEG = 1', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('tan(45)');
      expect(res.decimal.toNumber()).toBeCloseTo(1, 10);
      expect(res.getDisplayText()).toBe('1');
    });

    it('tan(90) trong mode DEG ném Math ERROR', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      expect(() => engine.evaluateExpression('tan(90)')).toThrow(MathError);
    });

    it('sin(π / 2) trong mode RAD = 1', () => {
      const engine = new CoreMathEngine({ angleUnit: 'RAD' });
      const res = engine.evaluateExpression('sin(π ÷ 2)');
      expect(res.decimal.toNumber()).toBeCloseTo(1, 10);
    });

    it('sin(100) trong mode GRA = 1 (100 gradian = 90 độ)', () => {
      const engine = new CoreMathEngine({ angleUnit: 'GRA' });
      const res = engine.evaluateExpression('sin(100)');
      expect(res.decimal.toNumber()).toBeCloseTo(1, 10);
    });

    it('sin⁻¹(0.5) trong mode DEG = 30°', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('sin⁻¹(0.5)');
      expect(res.decimal.toNumber()).toBeCloseTo(30, 10);
    });

    it('sin⁻¹(2) ngoài miền [-1, 1] ném Math ERROR', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      expect(() => engine.evaluateExpression('sin⁻¹(2)')).toThrow(MathError);
    });

    it('biểu thức lượng giác kết hợp: sin(30) + cos(60) × 2 = 1.5', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      const res = engine.evaluateExpression('sin(30) + cos(60) × 2');
      expect(res.decimal.toNumber()).toBeCloseTo(1.5, 10);
    });
  });

  describe('Logarit và hàm mũ tự nhiên tích hợp qua Parser', () => {
    it('log(100) = 2', () => {
      const res = calculate('log(100)');
      expect(res.getDisplayText()).toBe('2');
    });

    it('log(2, 8) = 3 (cơ số 2 của 8)', () => {
      const res = calculate('log(2, 8)');
      expect(res.getDisplayText()).toBe('3');
    });

    it('log(2, 32) = 5', () => {
      const res = calculate('log(2, 32)');
      expect(res.getDisplayText()).toBe('5');
    });

    it('ln(e) = 1', () => {
      const res = calculate('ln(e)');
      expect(res.getDisplayText()).toBe('1');
    });

    it('ln(1) = 0', () => {
      const res = calculate('ln(1)');
      expect(res.getDisplayText()).toBe('0');
    });

    it('log(-1) ném Math ERROR', () => {
      expect(() => calculate('log(-1)')).toThrow(MathError);
    });

    it('log(0) ném Math ERROR', () => {
      expect(() => calculate('log(0)')).toThrow(MathError);
    });

    it('log(1, 5) ném Math ERROR (cơ số 1)', () => {
      expect(() => calculate('log(1, 5)')).toThrow(MathError);
    });

    it('ln(0) ném Math ERROR', () => {
      expect(() => calculate('ln(0)')).toThrow(MathError);
    });
  });

  describe('Căn thức và rút gọn đại số tích hợp qua Parser (FEAT-MTH-03)', () => {
    it('√(12) rút gọn thành 2√3', () => {
      const res = calculate('√(12)');
      expect(res.getDisplayText()).toBe('2√3');
      expect(res.radicalForm).not.toBeNull();
      expect(res.radicalForm!.coefficient.num).toBe(2n);
      expect(res.radicalForm!.radicand).toBe(3n);
    });

    it('√(75) rút gọn thành 5√3', () => {
      const res = calculate('√(75)');
      expect(res.getDisplayText()).toBe('5√3');
      expect(res.radicalForm!.coefficient.num).toBe(5n);
      expect(res.radicalForm!.radicand).toBe(3n);
    });

    it('√(4) là số chính phương = 2', () => {
      const res = calculate('√(4)');
      expect(res.getDisplayText()).toBe('2');
      expect(res.radicalForm).toBeNull();
    });

    it('root(3, 27) = 3', () => {
      const res = calculate('root(3, 27)');
      expect(res.getDisplayText()).toBe('3');
    });
  });

  describe('Phân số và chuyển đổi S<=>D', () => {
    it('1/2 + 1/3 = 5/6, chuyển đổi S<=>D sang 0.8333333333', () => {
      const res = calculate('1/2 + 1/3');
      expect(res.currentView).toBe('EXACT');
      expect(res.getDisplayText()).toBe('5/6');

      res.toggleView();
      expect(res.currentView).toBe('DECIMAL');
      expect(res.getDisplayText()).toBe('0.8333333333');

      res.toggleView();
      expect(res.currentView).toBe('EXACT');
      expect(res.getDisplayText()).toBe('5/6');
    });
  });
});

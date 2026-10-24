import { describe, it, expect } from 'vitest';
import { solvePolynomial } from '../../src/modes/equation/polynomial';
import { MathError } from '../../src/engine/errors';

describe('PolynomialSolver (Mode A - Polynomial Equations)', () => {
  describe('Degree 2 (Quadratic: ax² + bx + c = 0)', () => {
    it('solves quadratic with 2 distinct real roots and minimum point', () => {
      // x² - 5x + 6 = 0 => (x - 3)(x - 2) = 0
      // a = 1 > 0 => Minimum vertex at x = -b/(2a) = 2.5, y = 2.5² - 12.5 + 6 = -0.25
      const res = solvePolynomial(2, [1, -5, 6]);
      expect(res.degree).toBe(2);
      expect(res.roots).toHaveLength(2);

      const r1 = res.roots[0];
      const r2 = res.roots[1];
      expect(r1.isReal).toBe(true);
      expect(r2.isReal).toBe(true);

      const rootVals = [r1.real.toNumber(), r2.real.toNumber()].sort((a, b) => b - a);
      expect(rootVals[0]).toBeCloseTo(3, 8);
      expect(rootVals[1]).toBeCloseTo(2, 8);

      expect(res.extrema).toBeDefined();
      expect(res.extrema).toHaveLength(1);
      const ext = res.extrema![0];
      expect(ext.type).toBe('MINIMUM');
      expect(ext.x.toNumber()).toBeCloseTo(2.5, 8);
      expect(ext.y.toNumber()).toBeCloseTo(-0.25, 8);
      expect(ext.label).toBe('Min of y');
    });

    it('solves quadratic with double real root', () => {
      // x² - 4x + 4 = 0 => (x - 2)² = 0
      const res = solvePolynomial(2, [1, -4, 4]);
      expect(res.roots).toHaveLength(2);
      expect(res.roots[0].real.toNumber()).toBeCloseTo(2, 8);
      expect(res.roots[1].real.toNumber()).toBeCloseTo(2, 8);
    });

    it('solves quadratic with maximum point when a < 0', () => {
      // -x² + 4x - 3 = 0 => roots x = 1, x = 3
      // vertex x = -4/(-2) = 2, y = -(4) + 8 - 3 = 1
      const res = solvePolynomial(2, [-1, 4, -3]);
      expect(res.extrema).toHaveLength(1);
      const ext = res.extrema![0];
      expect(ext.type).toBe('MAXIMUM');
      expect(ext.x.toNumber()).toBeCloseTo(2, 8);
      expect(ext.y.toNumber()).toBeCloseTo(1, 8);
      expect(ext.label).toBe('Max of y');
    });

    it('solves quadratic with complex conjugate roots', () => {
      // x² + 2x + 5 = 0 => roots: -1 ± 2i
      const res = solvePolynomial(2, [1, 2, 5]);
      expect(res.roots).toHaveLength(2);
      const [r1, r2] = res.roots;
      expect(r1.isReal).toBe(false);
      expect(r2.isReal).toBe(false);

      expect(r1.real.toNumber()).toBeCloseTo(-1, 8);
      expect(Math.abs(r1.imag!.toNumber())).toBeCloseTo(2, 8);
      expect(r2.real.toNumber()).toBeCloseTo(-1, 8);
      expect(Math.abs(r2.imag!.toNumber())).toBeCloseTo(2, 8);
    });

    it('solves quadratic with pure imaginary roots', () => {
      // x² + 9 = 0 => roots: ± 3i
      const res = solvePolynomial(2, [1, 0, 9]);
      const [r1, r2] = res.roots;
      expect(r1.real.toNumber()).toBeCloseTo(0, 8);
      expect(Math.abs(r1.imag!.toNumber())).toBeCloseTo(3, 8);
      expect(r2.real.toNumber()).toBeCloseTo(0, 8);
      expect(Math.abs(r2.imag!.toNumber())).toBeCloseTo(3, 8);
    });

    it('throws MathError if leading coefficient a is 0', () => {
      expect(() => solvePolynomial(2, [0, 2, 3])).toThrow(MathError);
    });
  });

  describe('Degree 3 (Cubic: ax³ + bx² + cx + d = 0)', () => {
    it('solves cubic with 3 real roots and local extrema', () => {
      // (x - 1)(x - 2)(x - 3) = x³ - 6x² + 11x - 6 = 0
      const res = solvePolynomial(3, [1, -6, 11, -6]);
      expect(res.roots).toHaveLength(3);
      expect(res.roots.every((r) => r.isReal)).toBe(true);

      const rootVals = res.roots.map((r) => r.real.toNumber()).sort((a, b) => b - a);
      expect(rootVals[0]).toBeCloseTo(3, 8);
      expect(rootVals[1]).toBeCloseTo(2, 8);
      expect(rootVals[2]).toBeCloseTo(1, 8);

      // Extrema: y' = 3x² - 12x + 11 = 0
      // x = (12 ± √(144 - 132))/6 = (12 ± √12)/6 = 2 ± √3/3 ≈ 2.577 and 1.423
      expect(res.extrema).toBeDefined();
      expect(res.extrema!.length).toBe(2);
      const maxExt = res.extrema!.find((e) => e.type === 'MAXIMUM');
      const minExt = res.extrema!.find((e) => e.type === 'MINIMUM');
      expect(maxExt).toBeDefined();
      expect(minExt).toBeDefined();
      expect(maxExt!.x.toNumber()).toBeCloseTo(2 - Math.sqrt(3) / 3, 4);
      expect(minExt!.x.toNumber()).toBeCloseTo(2 + Math.sqrt(3) / 3, 4);
    });

    it('solves cubic with 1 real root and 2 complex conjugate roots', () => {
      // x³ - 1 = 0 => (x - 1)(x² + x + 1) = 0
      // Real root: 1
      // Complex roots: -1/2 ± i*√3/2 ≈ -0.5 ± 0.866025i
      const res = solvePolynomial(3, [1, 0, 0, -1]);
      expect(res.roots).toHaveLength(3);

      const realRoots = res.roots.filter((r) => r.isReal);
      const complexRoots = res.roots.filter((r) => !r.isReal);
      expect(realRoots).toHaveLength(1);
      expect(complexRoots).toHaveLength(2);

      expect(realRoots[0].real.toNumber()).toBeCloseTo(1, 8);
      expect(complexRoots[0].real.toNumber()).toBeCloseTo(-0.5, 8);
      expect(Math.abs(complexRoots[0].imag!.toNumber())).toBeCloseTo(Math.sqrt(3) / 2, 8);
    });

    it('solves cubic with triple real root', () => {
      // (x - 2)³ = x³ - 6x² + 12x - 8 = 0
      const res = solvePolynomial(3, [1, -6, 12, -8]);
      expect(res.roots).toHaveLength(3);
      for (const r of res.roots) {
        expect(r.isReal).toBe(true);
        expect(r.real.toNumber()).toBeCloseTo(2, 6);
      }
    });
  });

  describe('Degree 4 (Quartic: ax⁴ + bx³ + cx² + dx + e = 0)', () => {
    it('solves biquadratic with 4 real roots', () => {
      // (x² - 1)(x² - 4) = x⁴ - 5x² + 4 = 0
      // Roots: ±2, ±1
      const res = solvePolynomial(4, [1, 0, -5, 0, 4]);
      expect(res.roots).toHaveLength(4);
      expect(res.roots.every((r) => r.isReal)).toBe(true);

      const sorted = res.roots.map((r) => r.real.toNumber()).sort((a, b) => b - a);
      expect(sorted[0]).toBeCloseTo(2, 6);
      expect(sorted[1]).toBeCloseTo(1, 6);
      expect(sorted[2]).toBeCloseTo(-1, 6);
      expect(sorted[3]).toBeCloseTo(-2, 6);
    });

    it('solves quartic with 4 complex roots', () => {
      // x⁴ + 1 = 0 => (x² + √2 x + 1)(x² - √2 x + 1) = 0
      // Roots: ±√2/2 ± i*√2/2
      const res = solvePolynomial(4, [1, 0, 0, 0, 1]);
      expect(res.roots).toHaveLength(4);
      expect(res.roots.every((r) => !r.isReal)).toBe(true);

      const expectedVal = Math.SQRT2 / 2;
      for (const r of res.roots) {
        expect(Math.abs(r.real.toNumber())).toBeCloseTo(expectedVal, 6);
        expect(Math.abs(r.imag!.toNumber())).toBeCloseTo(expectedVal, 6);
      }
    });

    it('solves general quartic with distinct roots', () => {
      // (x - 1)(x - 2)(x - 3)(x - 4) = x⁴ - 10x³ + 35x² - 50x + 24 = 0
      const res = solvePolynomial(4, [1, -10, 35, -50, 24]);
      expect(res.roots).toHaveLength(4);
      expect(res.roots.every((r) => r.isReal)).toBe(true);

      const sorted = res.roots.map((r) => r.real.toNumber()).sort((a, b) => b - a);
      expect(sorted[0]).toBeCloseTo(4, 5);
      expect(sorted[1]).toBeCloseTo(3, 5);
      expect(sorted[2]).toBeCloseTo(2, 5);
      expect(sorted[3]).toBeCloseTo(1, 5);
    });

    it('throws MathError if leading coefficient of quartic is 0', () => {
      expect(() => solvePolynomial(4, [0, 1, 2, 3, 4])).toThrow(MathError);
    });
  });

  describe('Validation & Degree Limits', () => {
    it('throws error for unsupported degrees (<2 or >4)', () => {
      expect(() => solvePolynomial(1 as any, [1, 2])).toThrow();
      expect(() => solvePolynomial(5 as any, [1, 0, 0, 0, 0, 1])).toThrow();
    });

    it('throws error for invalid coefficients length', () => {
      expect(() => solvePolynomial(2, [1, 2])).toThrow();
    });
  });
});

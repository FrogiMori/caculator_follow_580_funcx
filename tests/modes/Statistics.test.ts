import { describe, it, expect } from 'vitest';
import { computeStat1Var } from '../../src/modes/statistics/Stat1Var';
import { computeStat2Var } from '../../src/modes/statistics/Stat2Var';
import { StatisticsMode } from '../../src/modes/statistics/StatisticsMode';
import { MathError } from '../../src/engine/errors';

describe('StatisticsMode & Algorithms (Mode 6: STATISTICS)', () => {
  describe('1-Variable Statistics (1-Var)', () => {
    it('computes complete 1-Var summary statistics for standard dataset', () => {
      // Data: 1, 2, 3, 4, 5 with freq = 1
      const data = [
        { x: 1, freq: 1 },
        { x: 2, freq: 1 },
        { x: 3, freq: 1 },
        { x: 4, freq: 1 },
        { x: 5, freq: 1 }
      ];
      const res = computeStat1Var(data);

      expect(res.n).toBe(5);
      expect(res.sumX).toBe(15);
      expect(res.sumX2).toBe(55); // 1 + 4 + 9 + 16 + 25 = 55
      expect(res.meanX).toBe(3);

      // Population variance: (55 - 5 * 9) / 5 = 10 / 5 = 2
      expect(res.sigmaX2).toBeCloseTo(2, 8);
      expect(res.sigmaX).toBeCloseTo(Math.sqrt(2), 8);

      // Sample variance: 10 / 4 = 2.5
      expect(res.sX2).toBeCloseTo(2.5, 8);
      expect(res.sX).toBeCloseTo(Math.sqrt(2.5), 8);

      // Five-number summary / Quartiles
      expect(res.minX).toBe(1);
      expect(res.q1).toBe(1.5);
      expect(res.med).toBe(3);
      expect(res.q3).toBe(4.5);
      expect(res.maxX).toBe(5);
    });

    it('computes 1-Var statistics with frequency column (Freq)', () => {
      // x: [10, 20, 30] with freq: [2, 3, 1]
      // Expanded: 10, 10, 20, 20, 20, 30
      // n = 6
      // sumX = 20 + 60 + 30 = 110
      // sumX2 = 2*100 + 3*400 + 1*900 = 200 + 1200 + 900 = 2300
      const data = [
        { x: 10, freq: 2 },
        { x: 20, freq: 3 },
        { x: 30, freq: 1 }
      ];
      const res = computeStat1Var(data);

      expect(res.n).toBe(6);
      expect(res.sumX).toBe(110);
      expect(res.sumX2).toBe(2300);
      expect(res.meanX).toBeCloseTo(110 / 6, 8);

      // Median of [10, 10, 20, 20, 20, 30]: (20 + 20) / 2 = 20
      expect(res.med).toBe(20);
      // Lower half: [10, 10, 20] -> Q1 = 10
      expect(res.q1).toBe(10);
      // Upper half: [20, 20, 30] -> Q3 = 20
      expect(res.q3).toBe(20);
      expect(res.minX).toBe(10);
      expect(res.maxX).toBe(30);
    });

    it('sets sample standard deviation sX to null when n = 1', () => {
      const data = [{ x: 42, freq: 1 }];
      const res = computeStat1Var(data);

      expect(res.n).toBe(1);
      expect(res.meanX).toBe(42);
      expect(res.sigmaX).toBe(0);
      expect(res.sX).toBeNull();
      expect(res.sX2).toBeNull();
    });

    it('throws MathError when data table is empty', () => {
      expect(() => computeStat1Var([])).toThrow(MathError);
      expect(() => computeStat1Var([{ x: 5, freq: 0 }])).toThrow(MathError);
    });
  });

  describe('2-Variable Statistics & Linear Regression (y = a + bx)', () => {
    it('computes linear regression and correlation for known dataset', () => {
      // (1, 2), (2, 4), (3, 5), (4, 4), (5, 5)
      // x: [1, 2, 3, 4, 5], meanX = 3, Sxx = 10
      // y: [2, 4, 5, 4, 5], meanY = 4, Syy = (4 + 0 + 1 + 0 + 1) = 6
      // xy: [2, 8, 15, 16, 25], sumXY = 66
      // Sxy = 66 - 5 * 3 * 4 = 66 - 60 = 6
      // b = Sxy / Sxx = 6 / 10 = 0.6
      // a = meanY - b * meanX = 4 - 0.6 * 3 = 2.2
      // r = Sxy / sqrt(Sxx * Syy) = 6 / sqrt(60) ≈ 0.7745966692
      const data = [
        { x: 1, y: 2, freq: 1 },
        { x: 2, y: 4, freq: 1 },
        { x: 3, y: 5, freq: 1 },
        { x: 4, y: 4, freq: 1 },
        { x: 5, y: 5, freq: 1 }
      ];
      const res = computeStat2Var(data);

      expect(res.n).toBe(5);
      expect(res.meanX).toBe(3);
      expect(res.meanY).toBe(4);
      expect(res.b).toBeCloseTo(0.6, 8);
      expect(res.a).toBeCloseTo(2.2, 8);
      expect(res.r).toBeCloseTo(6 / Math.sqrt(60), 8);
      expect(res.minX).toBe(1);
      expect(res.maxX).toBe(5);
      expect(res.minY).toBe(2);
      expect(res.maxY).toBe(5);
    });

    it('computes r = 1 for perfectly collinear points with positive slope', () => {
      // y = 2x: (1, 2), (2, 4), (3, 6)
      const data = [
        { x: 1, y: 2, freq: 1 },
        { x: 2, y: 4, freq: 1 },
        { x: 3, y: 6, freq: 1 }
      ];
      const res = computeStat2Var(data);

      expect(res.b).toBeCloseTo(2, 8);
      expect(res.a).toBeCloseTo(0, 8);
      expect(res.r).toBeCloseTo(1, 8);
    });

    it('computes r = -1 for perfectly collinear points with negative slope', () => {
      // y = -3x + 10: (1, 7), (2, 4), (3, 1)
      const data = [
        { x: 1, y: 7, freq: 1 },
        { x: 2, y: 4, freq: 1 },
        { x: 3, y: 1, freq: 1 }
      ];
      const res = computeStat2Var(data);

      expect(res.b).toBeCloseTo(-3, 8);
      expect(res.a).toBeCloseTo(10, 8);
      expect(res.r).toBeCloseTo(-1, 8);
    });

    it('throws MathError when all x are equal (vertical line Sxx = 0)', () => {
      const data = [
        { x: 2, y: 1, freq: 1 },
        { x: 2, y: 3, freq: 1 },
        { x: 2, y: 5, freq: 1 }
      ];
      expect(() => computeStat2Var(data)).toThrow(MathError);
    });
  });

  describe('StatisticsMode Controller & Estimation', () => {
    it('manages 1-Var data and calculation through controller', () => {
      const mode = new StatisticsMode();
      mode.setSubMode('1-VAR');
      mode.addDataPoint1Var(10, 2);
      mode.addDataPoint1Var(20, 3);

      const res = mode.calculate1Var();
      expect(res.n).toBe(5);
      expect(res.meanX).toBe(16); // (20 + 60) / 5 = 16
    });

    it('manages 2-Var data and estimates y and x via regression line', () => {
      const mode = new StatisticsMode();
      mode.setSubMode('2-VAR');
      // y = 2x + 1
      mode.addDataPoint2Var(1, 3);
      mode.addDataPoint2Var(2, 5);
      mode.addDataPoint2Var(3, 7);

      const res = mode.calculate2Var();
      expect(res.a).toBeCloseTo(1, 8);
      expect(res.b).toBeCloseTo(2, 8);

      // Estimate y for x = 4: 2(4) + 1 = 9
      expect(mode.estimateY(4)).toBeCloseTo(9, 8);

      // Estimate x for y = 11: (11 - 1) / 2 = 5
      expect(mode.estimateX(11)).toBeCloseTo(5, 8);
    });
  });
});

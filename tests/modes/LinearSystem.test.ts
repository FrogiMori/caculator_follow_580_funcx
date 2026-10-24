import { describe, it, expect } from 'vitest';
import { solveLinearSystem } from '../../src/modes/equation/linearSystem';
import { DimensionError } from '../../src/engine/errors';

describe('LinearSystemSolver (Mode A - Simultaneous Equations)', () => {
  describe('2 Unknowns (Simultaneous Equation 2)', () => {
    it('solves a 2x2 system with unique integer solution', () => {
      // 2x + 3y = 8
      // x - y = -1
      // Expected: x = 1, y = 2
      const matrix = [
        [2, 3],
        [1, -1]
      ];
      const constants = [8, -1];
      const result = solveLinearSystem(2, matrix, constants);

      expect(result.status).toBe('UNIQUE');
      expect(result.solutions).toHaveLength(2);
      expect(result.solutions[0].variable).toBe('x');
      expect(result.solutions[0].value.toFractionString()).toBe('1');
      expect(result.solutions[1].variable).toBe('y');
      expect(result.solutions[1].value.toFractionString()).toBe('2');
    });

    it('solves a 2x2 system with fractional solution', () => {
      // 3x + 2y = 7
      // x + 4y = 9
      // From 2nd eq: x = 9 - 4y => 3(9 - 4y) + 2y = 7 => 27 - 10y = 7 => 10y = 20 => y = 2, x = 1
      // Let's do: 2x + 4y = 5, 3x - y = 1 => 6x + 12y = 15, 6x - 2y = 2 => 14y = 13 => y = 13/14, x = 9/14
      const matrix = [
        [2, 4],
        [3, -1]
      ];
      const constants = [5, 1];
      const result = solveLinearSystem(2, matrix, constants);

      expect(result.status).toBe('UNIQUE');
      expect(result.solutions[0].value.toFractionString()).toBe('9/14');
      expect(result.solutions[1].value.toFractionString()).toBe('13/14');
    });

    it('identifies inconsistent system (No Solution)', () => {
      // x + y = 2
      // 2x + 2y = 5
      const matrix = [
        [1, 1],
        [2, 2]
      ];
      const constants = [2, 5];
      const result = solveLinearSystem(2, matrix, constants);

      expect(result.status).toBe('NO_SOLUTION');
      expect(result.solutions).toHaveLength(0);
    });

    it('identifies dependent system (Infinite Solutions)', () => {
      // x + y = 2
      // 2x + 2y = 4
      const matrix = [
        [1, 1],
        [2, 2]
      ];
      const constants = [2, 4];
      const result = solveLinearSystem(2, matrix, constants);

      expect(result.status).toBe('INFINITE');
      expect(result.solutions).toHaveLength(0);
    });
  });

  describe('3 Unknowns (Simultaneous Equation 3)', () => {
    it('solves a 3x3 system with unique solution', () => {
      // x + 2y + z = 9
      // 2x - y + 3z = 12
      // 3x + y - z = 1
      // Solution: x = 1, y = 2, z = 4
      const matrix = [
        [1, 2, 1],
        [2, -1, 3],
        [3, 1, -1]
      ];
      const constants = [9, 12, 1];
      const result = solveLinearSystem(3, matrix, constants);

      expect(result.status).toBe('UNIQUE');
      expect(result.solutions).toHaveLength(3);
      expect(result.solutions[0].variable).toBe('x');
      expect(result.solutions[0].value.toFractionString()).toBe('1');
      expect(result.solutions[1].variable).toBe('y');
      expect(result.solutions[1].value.toFractionString()).toBe('2');
      expect(result.solutions[2].variable).toBe('z');
      expect(result.solutions[2].value.toFractionString()).toBe('4');
    });

    it('detects no solution in 3x3 system', () => {
      // x + y + z = 1
      // x + y + z = 2
      // 2x + 2y + 2z = 3
      const matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [2, 2, 2]
      ];
      const constants = [1, 2, 3];
      const result = solveLinearSystem(3, matrix, constants);

      expect(result.status).toBe('NO_SOLUTION');
    });

    it('detects infinite solutions in 3x3 system', () => {
      // x + y + z = 1
      // 2x + 2y + 2z = 2
      // 3x + 3y + 3z = 3
      const matrix = [
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3]
      ];
      const constants = [1, 2, 3];
      const result = solveLinearSystem(3, matrix, constants);

      expect(result.status).toBe('INFINITE');
    });
  });

  describe('4 Unknowns (Simultaneous Equation 4)', () => {
    it('solves a 4x4 system with unique solution', () => {
      // x + y + z + w = 10
      // x - y + z - w = 0
      // 2x + y - z + w = 7
      // 3x - 2y + 2z - w = 5
      // Sum eq 1 & 2: 2x + 2z = 10 => x + z = 5
      // y + w = 5
      const matrix = [
        [1, 1, 1, 1],
        [1, -1, 1, -1],
        [2, 1, -1, 1],
        [3, -2, 2, -1]
      ];
      const constants = [10, 0, 7, 5];
      const result = solveLinearSystem(4, matrix, constants);

      expect(result.status).toBe('UNIQUE');
      expect(result.solutions).toHaveLength(4);
      expect(result.solutions[0].variable).toBe('x');
      expect(result.solutions[1].variable).toBe('y');
      expect(result.solutions[2].variable).toBe('z');
      expect(result.solutions[3].variable).toBe('w');

      // Verify Ax = b for computed solutions
      const solVals = result.solutions.map((s) => s.value.toDecimal().toNumber());
      for (let i = 0; i < 4; i++) {
        let sum = 0;
        for (let j = 0; j < 4; j++) {
          sum += matrix[i][j] * solVals[j];
        }
        expect(sum).toBeCloseTo(constants[i], 8);
      }
    });
  });

  describe('Validation & Dimension Errors', () => {
    it('throws error for unsupported unknowns count (<2 or >4)', () => {
      expect(() => solveLinearSystem(1 as any, [[1]], [1])).toThrow();
      expect(() => solveLinearSystem(5 as any, [], [])).toThrow();
    });

    it('throws DimensionError if matrix row count does not match unknown count', () => {
      expect(() => solveLinearSystem(3, [[1, 2, 3]], [1, 2, 3])).toThrow(DimensionError);
    });

    it('throws DimensionError if constants count does not match unknown count', () => {
      expect(() => solveLinearSystem(2, [[1, 2], [3, 4]], [1])).toThrow(DimensionError);
    });
  });
});

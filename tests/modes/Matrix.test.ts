import { describe, it, expect } from 'vitest';
import { Matrix } from '../../src/modes/matrix/Matrix';
import { MatrixMode } from '../../src/modes/matrix/MatrixMode';
import { DimensionError, MathError } from '../../src/engine/errors';

describe('Matrix & MatrixMode (Mode 4)', () => {
  describe('Matrix Construction and Dimensions', () => {
    it('creates 1x1 to 4x4 matrix correctly', () => {
      const m1 = Matrix.fromArray([[5]]);
      expect(m1.rows).toBe(1);
      expect(m1.cols).toBe(1);

      const m4 = Matrix.identity(4);
      expect(m4.rows).toBe(4);
      expect(m4.cols).toBe(4);
      expect(m4.isSquare()).toBe(true);
    });

    it('throws DimensionError if dimensions are out of bounds (rows/cols < 1 or > 4)', () => {
      expect(() => new Matrix(0, 2)).toThrow(DimensionError);
      expect(() => new Matrix(5, 2)).toThrow(DimensionError);
      expect(() => new Matrix(2, 5)).toThrow(DimensionError);
    });

    it('throws DimensionError if raw array dimensions mismatch', () => {
      expect(() => Matrix.fromArray([[1, 2], [3]])).toThrow(DimensionError);
    });
  });

  describe('Matrix Addition and Subtraction', () => {
    it('adds two matrices of same dimensions', () => {
      const a = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]);
      const b = Matrix.fromArray([
        [5, 6],
        [7, 8]
      ]);
      const c = a.add(b);
      expect(c.toArray()).toEqual([
        [6, 8],
        [10, 12]
      ]);
    });

    it('subtracts two matrices of same dimensions', () => {
      const a = Matrix.fromArray([
        [5, 6],
        [7, 8]
      ]);
      const b = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]);
      const c = a.sub(b);
      expect(c.toArray()).toEqual([
        [4, 4],
        [4, 4]
      ]);
    });

    it('throws DimensionError when adding matrices with mismatched dimensions', () => {
      const a = Matrix.fromArray([
        [1, 2, 3],
        [4, 5, 6]
      ]); // 2x3
      const b = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]); // 2x2
      expect(() => a.add(b)).toThrow(DimensionError);
      expect(() => a.sub(b)).toThrow(DimensionError);
    });
  });

  describe('Scalar and Matrix Multiplication', () => {
    it('multiplies matrix by a scalar', () => {
      const a = Matrix.fromArray([
        [1, -2],
        [3, 0]
      ]);
      const res = a.mulScalar(3);
      expect(res.toArray()).toEqual([
        [3, -6],
        [9, 0]
      ]);
    });

    it('multiplies two compatible matrices (2x3 * 3x2 -> 2x2)', () => {
      const a = Matrix.fromArray([
        [1, 2, 3],
        [4, 5, 6]
      ]); // 2x3
      const b = Matrix.fromArray([
        [7, 8],
        [9, 1],
        [2, 3]
      ]); // 3x2
      const c = a.mul(b);
      expect(c.rows).toBe(2);
      expect(c.cols).toBe(2);
      expect(c.toArray()).toEqual([
        [31, 19],
        [85, 55]
      ]);
    });

    it('throws DimensionError on incompatible multiplication dimensions', () => {
      const a = Matrix.fromArray([
        [1, 2, 3],
        [4, 5, 6]
      ]); // 2x3
      const b = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]); // 2x2
      expect(() => a.mul(b)).toThrow(DimensionError);
    });
  });

  describe('Matrix Powers (A², A³)', () => {
    it('computes A² and A³ for square matrix', () => {
      const a = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]);
      const a2 = a.pow(2);
      expect(a2.toArray()).toEqual([
        [7, 10],
        [15, 22]
      ]);

      const a3 = a.pow(3);
      // a² * a = [[7,10],[15,22]] * [[1,2],[3,4]] = [[37, 54], [81, 118]]
      expect(a3.toArray()).toEqual([
        [37, 54],
        [81, 118]
      ]);
    });

    it('throws DimensionError when computing power of non-square matrix', () => {
      const a = Matrix.fromArray([[1, 2, 3]]);
      expect(() => a.pow(2)).toThrow(DimensionError);
    });

    it('throws error for power exponent not in 2..3', () => {
      const a = Matrix.identity(2);
      expect(() => a.pow(4)).toThrow();
    });
  });

  describe('Matrix Transpose', () => {
    it('transposes a 2x3 matrix to 3x2', () => {
      const a = Matrix.fromArray([
        [1, 2, 3],
        [4, 5, 6]
      ]);
      const at = a.transpose();
      expect(at.rows).toBe(3);
      expect(at.cols).toBe(2);
      expect(at.toArray()).toEqual([
        [1, 4],
        [2, 5],
        [3, 6]
      ]);
    });
  });

  describe('Matrix Determinant', () => {
    it('computes det for 1x1, 2x2, 3x3, and 4x4', () => {
      const m1 = Matrix.fromArray([[7]]);
      expect(m1.det().toNumber()).toBe(7);

      const m2 = Matrix.fromArray([
        [1, 2],
        [3, 4]
      ]); // 1*4 - 2*3 = -2
      expect(m2.det().toNumber()).toBe(-2);

      const m3 = Matrix.fromArray([
        [6, 1, 1],
        [4, -2, 5],
        [2, 8, 7]
      ]); // det = -306
      expect(m3.det().toNumber()).toBe(-306);

      const m4 = Matrix.identity(4);
      expect(m4.det().toNumber()).toBe(1);
    });

    it('throws DimensionError if computing det of non-square matrix', () => {
      const a = Matrix.fromArray([[1, 2]]);
      expect(() => a.det()).toThrow(DimensionError);
    });
  });

  describe('Matrix Inversion (A⁻¹)', () => {
    it('computes inverse of invertible matrix: A * A⁻¹ = I', () => {
      const a = Matrix.fromArray([
        [4, 7],
        [2, 6]
      ]); // det = 24 - 14 = 10
      const inv = a.inv();
      const identity = a.mul(inv);

      // Check approx identity
      expect(identity.get(0, 0).toDecimal().toNumber()).toBeCloseTo(1, 8);
      expect(identity.get(0, 1).toDecimal().toNumber()).toBeCloseTo(0, 8);
      expect(identity.get(1, 0).toDecimal().toNumber()).toBeCloseTo(0, 8);
      expect(identity.get(1, 1).toDecimal().toNumber()).toBeCloseTo(1, 8);
    });

    it('throws MathError when inverting singular matrix (det = 0)', () => {
      const singular = Matrix.fromArray([
        [1, 2],
        [2, 4]
      ]);
      expect(() => singular.inv()).toThrow(MathError);
    });

    it('throws DimensionError when inverting non-square matrix', () => {
      const nonSquare = Matrix.fromArray([[1, 2, 3]]);
      expect(() => nonSquare.inv()).toThrow(DimensionError);
    });
  });

  describe('MatrixMode Management & MatAns', () => {
    it('defines matrices and stores result into MatAns', () => {
      const mode = new MatrixMode();

      mode.defineMatrix('MatA', 2, 2, [
        [1, 2],
        [3, 4]
      ]);
      mode.defineMatrix('MatB', 2, 2, [
        [2, 0],
        [1, 2]
      ]);

      const sum = mode.add('MatA', 'MatB');
      expect(sum.toArray()).toEqual([
        [3, 2],
        [4, 6]
      ]);

      const matAns = mode.getMatrix('MatAns');
      expect(matAns).toBeDefined();
      expect(matAns!.toArray()).toEqual([
        [3, 2],
        [4, 6]
      ]);
    });

    it('throws MathError when accessing undefined matrix', () => {
      const mode = new MatrixMode();
      expect(() => mode.det('MatC')).toThrow(MathError);
    });
  });
});

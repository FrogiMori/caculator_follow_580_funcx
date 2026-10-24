import { describe, it, expect } from 'vitest';
import { Vector } from '../../src/modes/vector/Vector';
import { VectorMode } from '../../src/modes/vector/VectorMode';
import { DimensionError, MathError } from '../../src/engine/errors';

describe('Vector & VectorMode (Mode 5)', () => {
  describe('Vector Construction and Dimensions', () => {
    it('creates 2D and 3D vectors correctly', () => {
      const v2 = Vector.fromArray([3, 4]);
      expect(v2.dimension).toBe(2);
      expect(v2.toArray()).toEqual([3, 4]);

      const v3 = Vector.fromArray([1, 2, 3]);
      expect(v3.dimension).toBe(3);
      expect(v3.toArray()).toEqual([1, 2, 3]);
    });

    it('throws DimensionError if vector dimension is not 2 or 3', () => {
      expect(() => Vector.fromArray([1])).toThrow(DimensionError);
      expect(() => Vector.fromArray([1, 2, 3, 4])).toThrow(DimensionError);
    });
  });

  describe('Vector Arithmetic (+, -, scalar *)', () => {
    it('adds two vectors of same dimension', () => {
      const u = Vector.fromArray([1, 2, 3]);
      const v = Vector.fromArray([4, 5, 6]);
      const res = u.add(v);
      expect(res.toArray()).toEqual([5, 7, 9]);
    });

    it('subtracts two vectors of same dimension', () => {
      const u = Vector.fromArray([5, 7]);
      const v = Vector.fromArray([2, 3]);
      const res = u.sub(v);
      expect(res.toArray()).toEqual([3, 4]);
    });

    it('throws DimensionError when adding 2D and 3D vectors', () => {
      const u = Vector.fromArray([1, 2]);
      const v = Vector.fromArray([1, 2, 3]);
      expect(() => u.add(v)).toThrow(DimensionError);
      expect(() => u.sub(v)).toThrow(DimensionError);
    });

    it('multiplies vector by scalar', () => {
      const v = Vector.fromArray([2, -3, 4]);
      const res = v.mulScalar(-2);
      expect(res.toArray()).toEqual([-4, 6, -8]);
    });
  });

  describe('Dot Product (•)', () => {
    it('computes dot product of two 2D vectors', () => {
      const u = Vector.fromArray([1, 2]);
      const v = Vector.fromArray([3, 4]);
      // 1*3 + 2*4 = 11
      expect(u.dot(v).toDecimal().toNumber()).toBe(11);
    });

    it('computes dot product of two 3D vectors', () => {
      const u = Vector.fromArray([1, 2, 3]);
      const v = Vector.fromArray([4, -5, 6]);
      // 1*4 + 2*(-5) + 3*6 = 4 - 10 + 18 = 12
      expect(u.dot(v).toDecimal().toNumber()).toBe(12);
    });

    it('throws DimensionError when computing dot product of mismatched dimensions', () => {
      const u = Vector.fromArray([1, 2]);
      const v = Vector.fromArray([1, 2, 3]);
      expect(() => u.dot(v)).toThrow(DimensionError);
    });
  });

  describe('Cross Product (×)', () => {
    it('computes cross product of two 3D vectors', () => {
      // i = (1, 0, 0), j = (0, 1, 0) => i x j = (0, 0, 1) = k
      const i = Vector.fromArray([1, 0, 0]);
      const j = Vector.fromArray([0, 1, 0]);
      const k = i.cross(j);
      expect(k.toArray()).toEqual([0, 0, 1]);

      // (2, 3, 4) x (5, 6, 7) = (3*7 - 4*6, 4*5 - 2*7, 2*6 - 3*5) = (-3, 6, -3)
      const u = Vector.fromArray([2, 3, 4]);
      const v = Vector.fromArray([5, 6, 7]);
      expect(u.cross(v).toArray()).toEqual([-3, 6, -3]);
    });

    it('throws DimensionError when taking cross product of 2D vectors', () => {
      const u = Vector.fromArray([1, 2]);
      const v = Vector.fromArray([3, 4]);
      expect(() => u.cross(v)).toThrow(DimensionError);
    });
  });

  describe('Vector Magnitude (|v|)', () => {
    it('computes magnitude of 2D vector', () => {
      const v = Vector.fromArray([3, 4]);
      expect(v.magnitude().toNumber()).toBe(5);
    });

    it('computes magnitude of 3D vector', () => {
      const v = Vector.fromArray([1, 2, 2]);
      expect(v.magnitude().toNumber()).toBe(3);
    });
  });

  describe('Angle Between Vectors (Angle)', () => {
    it('computes angle between vectors in Degree, Radian, Gradian', () => {
      const u = Vector.fromArray([1, 0, 0]);
      const v = Vector.fromArray([0, 1, 0]);

      // Orthogonal vectors: 90 deg, pi/2 rad, 100 gra
      expect(u.angle(v, 'DEG').toNumber()).toBeCloseTo(90, 6);
      expect(u.angle(v, 'RAD').toNumber()).toBeCloseTo(Math.PI / 2, 6);
      expect(u.angle(v, 'GRA').toNumber()).toBeCloseTo(100, 6);
    });

    it('computes 0 degree for collinear vectors in same direction', () => {
      const u = Vector.fromArray([1, 2]);
      const v = Vector.fromArray([2, 4]);
      expect(u.angle(v, 'DEG').toNumber()).toBeCloseTo(0, 6);
    });

    it('throws MathError if one or both vectors are zero vectors', () => {
      const u = Vector.fromArray([0, 0]);
      const v = Vector.fromArray([1, 2]);
      expect(() => u.angle(v, 'DEG')).toThrow(MathError);
    });
  });

  describe('Unit Vector (UnitV)', () => {
    it('computes unit vector of 2D vector', () => {
      const v = Vector.fromArray([3, 4]);
      const unit = v.unitVector();
      expect(unit.get(0).toNumber()).toBeCloseTo(0.6, 6);
      expect(unit.get(1).toNumber()).toBeCloseTo(0.8, 6);
      expect(unit.magnitude().toNumber()).toBeCloseTo(1, 6);
    });

    it('throws MathError when computing unit vector of zero vector', () => {
      const zero = Vector.fromArray([0, 0, 0]);
      expect(() => zero.unitVector()).toThrow(MathError);
    });
  });

  describe('VectorMode Management & VctAns', () => {
    it('stores vectors in VctA..VctD and outputs result to VctAns', () => {
      const mode = new VectorMode();
      mode.defineVector('VctA', [1, 2, 3]);
      mode.defineVector('VctB', [4, 5, 6]);

      const sum = mode.add('VctA', 'VctB');
      expect(sum.toArray()).toEqual([5, 7, 9]);

      const ans = mode.getVector('VctAns');
      expect(ans).toBeDefined();
      expect(ans!.toArray()).toEqual([5, 7, 9]);
    });

    it('throws MathError when accessing undefined vector', () => {
      const mode = new VectorMode();
      expect(() => mode.magnitude('VctC')).toThrow(MathError);
    });
  });
});

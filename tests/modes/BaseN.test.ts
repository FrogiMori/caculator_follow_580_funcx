import { describe, it, expect } from 'vitest';
import {
  parseBase,
  formatBase,
  createBaseNResult
} from '../../src/modes/baseN/BaseNConverter';
import { BaseNEngine } from '../../src/modes/baseN/BaseNEngine';
import { BaseNMode } from '../../src/modes/baseN/BaseNMode';
import { MathError } from '../../src/engine/errors';

describe('BaseNEngine & BaseNMode (Mode 3: Base-N)', () => {
  describe('Base Conversion & Representation (DEC, HEX, BIN, OCT)', () => {
    it('parses and formats positive numbers across all 4 bases', () => {
      // Decimal 15
      expect(parseBase('15', 'DEC')).toBe(15n);
      expect(parseBase('F', 'HEX')).toBe(15n);
      expect(parseBase('1111', 'BIN')).toBe(15n);
      expect(parseBase('17', 'OCT')).toBe(15n);

      const res = createBaseNResult(15n, 'DEC');
      expect(res.representations.dec).toBe('15');
      expect(res.representations.hex).toBe('F');
      expect(res.representations.bin).toBe('1111');
      expect(res.representations.oct).toBe('17');
    });

    it('handles 32-bit two\'s complement negative numbers correctly', () => {
      // Decimal -1
      expect(parseBase('-1', 'DEC')).toBe(-1n);
      // FFFFFFFF in 32-bit hex is -1
      expect(parseBase('FFFFFFFF', 'HEX')).toBe(-1n);
      // 32 ones in binary is -1
      expect(parseBase('11111111111111111111111111111111', 'BIN')).toBe(-1n);

      const res = createBaseNResult(-1n, 'HEX');
      expect(res.representations.dec).toBe('-1');
      expect(res.representations.hex).toBe('FFFFFFFF');
      expect(res.representations.bin).toBe('11111111111111111111111111111111');
      expect(res.representations.oct).toBe('37777777777');
    });

    it('rejects invalid digits according to current base', () => {
      // BIN accepts only 0 and 1
      expect(() => parseBase('102', 'BIN')).toThrow(MathError);

      // OCT accepts only 0-7
      expect(() => parseBase('178', 'OCT')).toThrow(MathError);

      // DEC accepts only digits
      expect(() => parseBase('12A', 'DEC')).toThrow(MathError);

      // HEX accepts 0-9 and A-F
      expect(() => parseBase('12G', 'HEX')).toThrow(MathError);
    });

    it('rejects numbers exceeding 32-bit bounds (Overflow)', () => {
      // 2^31 = 2147483648 exceeds max signed int32 (2147483647)
      expect(() => parseBase('2147483648', 'DEC')).toThrow(MathError);
      expect(() => parseBase('-2147483649', 'DEC')).toThrow(MathError);
      // > 32 bits hex
      expect(() => parseBase('100000000', 'HEX')).toThrow(MathError);
    });
  });

  describe('Arithmetic Operations (+, -, ×, ÷)', () => {
    const engine = new BaseNEngine();

    it('performs addition in Base-N', () => {
      // BIN: 1010 (10) + 0101 (5) = 1111 (15)
      const res = engine.add(10n, 5n);
      expect(res).toBe(15n);
      expect(formatBase(res, 'BIN')).toBe('1111');
    });

    it('performs subtraction in Base-N', () => {
      // HEX: 20 (32) - 5 = 1B (27)
      const res = engine.sub(32n, 5n);
      expect(res).toBe(27n);
      expect(formatBase(res, 'HEX')).toBe('1B');
    });

    it('performs multiplication in Base-N', () => {
      // OCT: 7 * 2 = 16 (14 in dec)
      const res = engine.mul(7n, 2n);
      expect(res).toBe(14n);
      expect(formatBase(res, 'OCT')).toBe('16');
    });

    it('performs integer division truncated toward zero', () => {
      expect(engine.div(7n, 2n)).toBe(3n);
      expect(engine.div(-7n, 2n)).toBe(-3n);
    });

    it('throws MathError on division by zero', () => {
      expect(() => engine.div(5n, 0n)).toThrow(MathError);
    });

    it('throws MathError on arithmetic overflow', () => {
      expect(() => engine.add(2147483640n, 10n)).toThrow(MathError);
    });
  });

  describe('Bitwise / Logic Operations', () => {
    const engine = new BaseNEngine();

    it('computes bitwise AND', () => {
      // 1010 & 1100 = 1000 (10 & 12 = 8)
      const res = engine.and(10n, 12n);
      expect(res).toBe(8n);
      expect(formatBase(res, 'BIN')).toBe('1000');
    });

    it('computes bitwise OR', () => {
      // 1010 | 0101 = 1111 (10 | 5 = 15)
      const res = engine.or(10n, 5n);
      expect(res).toBe(15n);
      expect(formatBase(res, 'BIN')).toBe('1111');
    });

    it('computes bitwise XOR', () => {
      // 1010 ^ 1100 = 0110 (10 ^ 12 = 6)
      const res = engine.xor(10n, 12n);
      expect(res).toBe(6n);
      expect(formatBase(res, 'BIN')).toBe('110');
    });

    it('computes bitwise XNOR', () => {
      // not (10 ^ 12) in 32-bit: 10 ^ 12 = 6, ~6 in 32-bit = FFFFFFF9 (-7)
      const res = engine.xnor(10n, 12n);
      expect(res).toBe(-7n); // ~6 in two's complement is -7
      expect(formatBase(res, 'HEX')).toBe('FFFFFFF9');
    });

    it('computes bitwise NOT', () => {
      // not 0 = FFFFFFFF (-1)
      expect(engine.not(0n)).toBe(-1n);
      expect(formatBase(engine.not(0n), 'HEX')).toBe('FFFFFFFF');
    });

    it('computes arithmetic NEG (two\'s complement negation)', () => {
      expect(engine.neg(5n)).toBe(-5n);
      expect(engine.neg(-5n)).toBe(5n);
      expect(() => engine.neg(-2147483648n)).toThrow(MathError);
    });
  });

  describe('BaseNMode Controller & Base Switching', () => {
    it('manages base switching and converts current result immediately', () => {
      const mode = new BaseNMode();
      expect(mode.getBase()).toBe('DEC');

      // Set value 255 in DEC
      mode.setValue('255');
      expect(mode.getLastResult()!.displayText).toBe('255');

      // Switch to HEX -> "FF"
      mode.setBase('HEX');
      expect(mode.getBase()).toBe('HEX');
      expect(mode.getLastResult()!.displayText).toBe('FF');

      // Switch to BIN -> "11111111"
      mode.setBase('BIN');
      expect(mode.getLastResult()!.displayText).toBe('11111111');

      // Switch to OCT -> "377"
      mode.setBase('OCT');
      expect(mode.getLastResult()!.displayText).toBe('377');
    });

    it('evaluates binary operation with current base', () => {
      const mode = new BaseNMode();
      mode.setBase('BIN');

      // 1010 + 0101 = 1111
      const res = mode.evaluateBinary('+', '1010', '0101');
      expect(res.displayText).toBe('1111');
      expect(res.representations.dec).toBe('15');
      expect(res.representations.hex).toBe('F');
    });

    it('evaluates unary NOT with current base', () => {
      const mode = new BaseNMode();
      mode.setBase('HEX');

      // not 0 = FFFFFFFF
      const res = mode.evaluateUnary('not', '0');
      expect(res.displayText).toBe('FFFFFFFF');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseExpression } from '../../src/parser/index';
import { CasioSyntaxError } from '../../src/parser/errors';

describe('Parser Edge Cases & Syntax Errors', () => {
  describe('Empty & Whitespace-only Inputs', () => {
    it('throws CasioSyntaxError for completely empty expression', () => {
      expect(() => parseExpression('')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError for whitespace-only expression', () => {
      expect(() => parseExpression('   \t  ')).toThrow(CasioSyntaxError);
    });
  });

  describe('Invalid Operators & Consecutive Binary Operators', () => {
    it('throws CasioSyntaxError when starting with binary multiplication or division', () => {
      expect(() => parseExpression('* 5')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('÷ 3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('^ 2')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError on consecutive binary operators', () => {
      expect(() => parseExpression('2 + * 3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('5 * / 2')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('4 * * 2')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError when expression ends with a dangling operator', () => {
      expect(() => parseExpression('5 +')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('12 *')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('7 -')).toThrow(CasioSyntaxError);
    });
  });

  describe('Parentheses & Brackets Validation', () => {
    it('throws CasioSyntaxError for empty parentheses ()', () => {
      expect(() => parseExpression('()')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('2 + () * 3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('(   )')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError when closing parenthesis appears without opening', () => {
      expect(() => parseExpression(') 2 + 3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('2 + 3 )')).toThrow(CasioSyntaxError);
    });

    it('auto-closes trailing unclosed parentheses (Casio ClassWiz standard behavior)', () => {
      // Casio automatically auto-closes trailing parentheses: 2*(3+4 -> 14
      const ast = parseExpression('2*(3+4');
      expect(ast).toBeDefined();
      expect(ast.type).toBe('BinaryOp');
    });
  });

  describe('Function Call Syntax & Arguments', () => {
    it('throws CasioSyntaxError for empty function argument', () => {
      expect(() => parseExpression('sin()')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('cos(   )')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('√()')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError on dangling comma in multi-argument function', () => {
      expect(() => parseExpression('log(10, )')).toThrow(CasioSyntaxError);
    });
  });

  describe('Number Formatting & Spaces', () => {
    it('throws CasioSyntaxError when multiple numbers are adjacent without operators', () => {
      expect(() => parseExpression('2 3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('10 20 30')).toThrow(CasioSyntaxError);
    });

    it('throws CasioSyntaxError for malformed decimal points like 1.2.3', () => {
      expect(() => parseExpression('1.2.3')).toThrow(CasioSyntaxError);
      expect(() => parseExpression('..')).toThrow(CasioSyntaxError);
    });
  });
});

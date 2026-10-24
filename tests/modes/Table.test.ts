import { describe, it, expect } from 'vitest';
import { TableGenerator } from '../../src/modes/table/TableGenerator';
import { TableMode } from '../../src/modes/table/TableMode';
import { MathError } from '../../src/engine/errors';

describe('TableGenerator & TableMode (Mode 9: TABLE)', () => {
  describe('Single Function f(x)', () => {
    it('generates table for f(x) = x² - 2 from 1 to 5 with step 1', () => {
      const generator = new TableGenerator();
      const res = generator.generateTable('x² - 2', { start: 1, end: 5, step: 1 });

      expect(res.totalRows).toBe(5);
      expect(res.rows).toHaveLength(5);

      // x = 1: 1 - 2 = -1
      expect(res.rows[0].x.displayText).toBe('1');
      expect(res.rows[0].f!.displayText).toBe('-1');
      expect(res.rows[0].f!.isError).toBe(false);

      // x = 2: 4 - 2 = 2
      expect(res.rows[1].x.displayText).toBe('2');
      expect(res.rows[1].f!.displayText).toBe('2');

      // x = 3: 9 - 2 = 7
      expect(res.rows[2].x.displayText).toBe('3');
      expect(res.rows[2].f!.displayText).toBe('7');

      // x = 4: 16 - 2 = 14
      expect(res.rows[3].x.displayText).toBe('4');
      expect(res.rows[3].f!.displayText).toBe('14');

      // x = 5: 25 - 2 = 23
      expect(res.rows[4].x.displayText).toBe('5');
      expect(res.rows[4].f!.displayText).toBe('23');
    });

    it('generates table with decimal step without floating-point accumulation drift', () => {
      const generator = new TableGenerator();
      const res = generator.generateTable('2x', { start: 0, end: 1, step: 0.2 });

      expect(res.totalRows).toBe(6);
      const xVals = res.rows.map((r) => r.x.displayText);
      expect(xVals).toEqual(['0', '0.2', '0.4', '0.6', '0.8', '1']);

      const fVals = res.rows.map((r) => r.f!.displayText);
      expect(fVals).toEqual(['0', '0.4', '0.8', '1.2', '1.6', '2']);
    });

    it('marks cell with ERROR if calculation fails at a point (e.g. division by zero)', () => {
      const generator = new TableGenerator();
      // f(x) = 1 / (x - 2) on [1, 3] with step 1
      const res = generator.generateTable('1 / (x - 2)', { start: 1, end: 3, step: 1 });

      expect(res.rows).toHaveLength(3);

      // x = 1 -> 1 / (-1) = -1
      expect(res.rows[0].f!.displayText).toBe('-1');
      expect(res.rows[0].f!.isError).toBe(false);

      // x = 2 -> 1 / 0 -> ERROR
      expect(res.rows[1].f!.displayText).toBe('ERROR');
      expect(res.rows[1].f!.isError).toBe(true);

      // x = 3 -> 1 / 1 = 1
      expect(res.rows[2].f!.displayText).toBe('1');
      expect(res.rows[2].f!.isError).toBe(false);
    });
  });

  describe('Two Functions f(x) and g(x)', () => {
    it('generates simultaneous table for f(x) and g(x)', () => {
      const generator = new TableGenerator();
      const res = generator.generateTable(
        '2x + 1',
        { start: 0, end: 4, step: 2 },
        'x²',
        'F_AND_G'
      );

      expect(res.totalRows).toBe(3);
      expect(res.tableType).toBe('F_AND_G');

      // x = 0: f = 1, g = 0
      expect(res.rows[0].x.displayText).toBe('0');
      expect(res.rows[0].f!.displayText).toBe('1');
      expect(res.rows[0].g!.displayText).toBe('0');

      // x = 2: f = 5, g = 4
      expect(res.rows[1].x.displayText).toBe('2');
      expect(res.rows[1].f!.displayText).toBe('5');
      expect(res.rows[1].g!.displayText).toBe('4');

      // x = 4: f = 9, g = 16
      expect(res.rows[2].x.displayText).toBe('4');
      expect(res.rows[2].f!.displayText).toBe('9');
      expect(res.rows[2].g!.displayText).toBe('16');
    });
  });

  describe('Range Validations & Row Limits', () => {
    it('throws MathError if step <= 0', () => {
      const generator = new TableGenerator();
      expect(() => generator.generateTable('x', { start: 1, end: 5, step: 0 })).toThrow(MathError);
      expect(() => generator.generateTable('x', { start: 1, end: 5, step: -1 })).toThrow(MathError);
    });

    it('throws MathError if end < start', () => {
      const generator = new TableGenerator();
      expect(() => generator.generateTable('x', { start: 5, end: 1, step: 1 })).toThrow(MathError);
    });

    it('throws MathError if rows exceed max limits (45 for F_ONLY, 30 for F_AND_G)', () => {
      const generator = new TableGenerator();
      // 50 rows in F_ONLY -> exceeds 45
      expect(() => generator.generateTable('x', { start: 1, end: 50, step: 1 }, undefined, 'F_ONLY')).toThrow(MathError);

      // 35 rows in F_AND_G -> exceeds 30
      expect(() => generator.generateTable('x', { start: 1, end: 35, step: 1 }, '2x', 'F_AND_G')).toThrow(MathError);
    });
  });

  describe('TableMode Controller', () => {
    it('manages settings and stores lastResult', () => {
      const mode = new TableMode();
      mode.setFunctionF('3x - 1');
      mode.setFunctionG('x + 2');
      mode.setTableType('F_AND_G');
      mode.setRange({ start: 1, end: 3, step: 1 });

      const res = mode.generate();
      expect(res.totalRows).toBe(3);
      expect(mode.getRows()).toHaveLength(3);
      expect(mode.getLastResult()).toBe(res);

      expect(mode.getRows()[0].f!.displayText).toBe('2');
      expect(mode.getRows()[0].g!.displayText).toBe('3');
    });
  });
});

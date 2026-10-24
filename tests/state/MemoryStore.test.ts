import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/state/MemoryStore';
import { CalculationResult } from '../../src/engine/result';
import { Decimal } from '../../src/engine/decimal';

describe('MemoryStore', () => {
  it('initializes all variables (A-F, X, Y, M, Ans) to zero', () => {
    const store = new MemoryStore();
    expect(store.getVariable('A').decimal.isZero()).toBe(true);
    expect(store.getVariable('B').decimal.isZero()).toBe(true);
    expect(store.getVariable('M').decimal.isZero()).toBe(true);
    expect(store.getVariable('ANS').decimal.isZero()).toBe(true);
    expect(store.hasMemory()).toBe(false);
  });

  it('sets and gets variables by name case-insensitively', () => {
    const store = new MemoryStore();
    store.setVariable('a', 42);
    expect(store.getVariable('A').toNumber()).toBe(42);
    expect(store.getVariableString('A')).toBe('42');

    store.setVariable('X', '3/4');
    expect(store.getVariable('x').getDisplayText()).toBe('3/4');
  });

  it('ignores invalid variable names', () => {
    const store = new MemoryStore();
    store.setVariable('INVALID_VAR', 100);
    expect(store.getVariable('INVALID_VAR').decimal.isZero()).toBe(true);
  });

  it('adds and subtracts from M (M+ and M-)', () => {
    const store = new MemoryStore();
    expect(store.hasMemory()).toBe(false);

    // M+ 10 -> M = 10
    const res1 = store.addToM(CalculationResult.fromDecimal(Decimal.fromNumber(10)));
    expect(res1.toNumber()).toBe(10);
    expect(store.hasMemory()).toBe(true);
    expect(store.getVariable('M').toNumber()).toBe(10);

    // M+ 5 -> M = 15
    store.addToM(CalculationResult.fromDecimal(Decimal.fromNumber(5)));
    expect(store.getVariable('M').toNumber()).toBe(15);

    // M- 7 -> M = 8
    store.subtractFromM(CalculationResult.fromDecimal(Decimal.fromNumber(7)));
    expect(store.getVariable('M').toNumber()).toBe(8);

    // M- 8 -> M = 0
    store.subtractFromM(CalculationResult.fromDecimal(Decimal.fromNumber(8)));
    expect(store.getVariable('M').toNumber()).toBe(0);
    expect(store.hasMemory()).toBe(false);
  });

  it('exports and imports variable records correctly', () => {
    const store1 = new MemoryStore();
    store1.setVariable('A', 12);
    store1.setVariable('M', 50);

    const record = store1.exportRecord();
    expect(record).toEqual({ A: '12', M: '50' });

    const store2 = new MemoryStore();
    store2.importRecord(record);
    expect(store2.getVariable('A').toNumber()).toBe(12);
    expect(store2.getVariable('M').toNumber()).toBe(50);
    expect(store2.hasMemory()).toBe(true);
  });

  it('resets variables only while preserving Ans', () => {
    const store = new MemoryStore();
    store.setVariable('A', 10);
    store.setVariable('M', 20);
    store.setVariable('ANS', 99);

    store.resetVariablesOnly();
    expect(store.getVariable('A').decimal.isZero()).toBe(true);
    expect(store.getVariable('M').decimal.isZero()).toBe(true);
    expect(store.getVariable('ANS').toNumber()).toBe(99);
  });
});

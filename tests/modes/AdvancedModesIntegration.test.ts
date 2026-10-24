import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../../src/input/InputDispatcher';

describe('AdvancedModesIntegration (Table, Base-N, Statistics with InputDispatcher)', () => {
  it('instantiates InputDispatcher with access to Table, Base-N, and Statistics modes', () => {
    const dispatcher = new InputDispatcher();

    expect(dispatcher.getTableMode()).toBeDefined();
    expect(dispatcher.getBaseNMode()).toBeDefined();
    expect(dispatcher.getStatisticsMode()).toBeDefined();
  });

  it('switches between TABLE, BASE-N, and STATISTICS modes', () => {
    const dispatcher = new InputDispatcher();

    dispatcher.setMode('TABLE');
    expect(dispatcher.getState().currentMode).toBe('TABLE');

    dispatcher.setMode('BASE-N');
    expect(dispatcher.getState().currentMode).toBe('BASE-N');

    dispatcher.setMode('STATISTICS');
    expect(dispatcher.getState().currentMode).toBe('STATISTICS');
  });

  it('runs complete workflow in TableMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    dispatcher.setMode('TABLE');

    const tableMode = dispatcher.getTableMode();
    tableMode.setFunctionF('x²');
    tableMode.setRange({ start: 1, end: 3, step: 1 });

    const result = tableMode.generate();
    expect(result.totalRows).toBe(3);
    expect(result.rows[0].f!.displayText).toBe('1');
    expect(result.rows[1].f!.displayText).toBe('4');
    expect(result.rows[2].f!.displayText).toBe('9');
  });

  it('runs complete workflow in BaseNMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    dispatcher.setMode('BASE-N');

    const baseNMode = dispatcher.getBaseNMode();
    baseNMode.setBase('BIN');

    // 1010 + 0101 = 1111 (15 in DEC)
    const result = baseNMode.evaluateBinary('+', '1010', '0101');
    expect(result.displayText).toBe('1111');

    baseNMode.setBase('HEX');
    expect(baseNMode.getLastResult()!.displayText).toBe('F');
  });

  it('runs complete workflow in StatisticsMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    dispatcher.setMode('STATISTICS');

    const statMode = dispatcher.getStatisticsMode();
    statMode.setSubMode('1-VAR');
    statMode.addDataPoint1Var(2);
    statMode.addDataPoint1Var(4);
    statMode.addDataPoint1Var(6);

    const result = statMode.calculate1Var();
    expect(result.n).toBe(3);
    expect(result.meanX).toBe(4);
    expect(result.minX).toBe(2);
    expect(result.maxX).toBe(6);
  });
});

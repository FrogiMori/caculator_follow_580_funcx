import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../../src/input/InputDispatcher';
import { DimensionError } from '../../src/engine/errors';

describe('ModesIntegration (InputDispatcher & Modes)', () => {
  it('instantiates InputDispatcher with access to Equation, Matrix, and Vector modes', () => {
    const dispatcher = new InputDispatcher();

    expect(dispatcher.getEquationMode()).toBeDefined();
    expect(dispatcher.getMatrixMode()).toBeDefined();
    expect(dispatcher.getVectorMode()).toBeDefined();
    expect(dispatcher.getState().currentMode).toBe('COMP');
  });

  it('switches modes and clears display state', () => {
    const dispatcher = new InputDispatcher();
    dispatcher.dispatchKeyId('KEY_5'); // enters 5
    expect(dispatcher.getState().expression).toBe('5');

    dispatcher.setMode('MATRIX');
    expect(dispatcher.getState().currentMode).toBe('MATRIX');
    expect(dispatcher.getState().expression).toBe('');
    expect(dispatcher.getState().result).toBeNull();

    dispatcher.setMode('EQUATION');
    expect(dispatcher.getState().currentMode).toBe('EQUATION');

    dispatcher.setMode('VECTOR');
    expect(dispatcher.getState().currentMode).toBe('VECTOR');
  });

  it('handles Dimension ERROR in InputDispatcher when thrown', () => {
    const dispatcher = new InputDispatcher();
    // Simulate evaluating an expression or catching DimensionError
    const vectorMode = dispatcher.getVectorMode();
    vectorMode.defineVector('VctA', [1, 2]);
    vectorMode.defineVector('VctB', [1, 2, 3]);

    expect(() => vectorMode.add('VctA', 'VctB')).toThrow(DimensionError);
  });

  it('solves full workflow in EquationMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    const eqMode = dispatcher.getEquationMode();

    // Select simultaneous 2 unknowns
    eqMode.setSubMode('SIMULTANEOUS');
    const result = eqMode.solveSimultaneous(2, [
      [1, 1],
      [1, -1]
    ], [4, 2]);

    expect(result.status).toBe('UNIQUE');
    expect(result.solutions[0].variable).toBe('x');
    expect(result.solutions[0].value.toFractionString()).toBe('3');
    expect(result.solutions[1].variable).toBe('y');
    expect(result.solutions[1].value.toFractionString()).toBe('1');
  });

  it('executes full workflow in MatrixMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    const matMode = dispatcher.getMatrixMode();

    matMode.defineMatrix('MatA', 2, 2, [
      [1, 2],
      [3, 4]
    ]);
    const det = matMode.det('MatA');
    expect(det.toNumber()).toBe(-2);

    const inv = matMode.inv('MatA');
    expect(inv.rows).toBe(2);
    expect(inv.cols).toBe(2);

    const ans = matMode.getMatrix('MatAns');
    expect(ans).toBeDefined();
  });

  it('executes full workflow in VectorMode through InputDispatcher', () => {
    const dispatcher = new InputDispatcher();
    const vctMode = dispatcher.getVectorMode();

    vctMode.defineVector('VctA', [3, 4]);
    const mag = vctMode.magnitude('VctA');
    expect(mag.toNumber()).toBe(5);

    const unit = vctMode.unitVector('VctA');
    expect(unit.get(0).toNumber()).toBeCloseTo(0.6, 6);
  });
});

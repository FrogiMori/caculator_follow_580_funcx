import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../../src/input/InputDispatcher';
import { StateManager } from '../../src/state/StateManager';
import { StorageManager, MemoryStorageBackend } from '../../src/state/StorageAdapter';

describe('EndToEndWorkflow (Key Input -> Parsing -> Math Engine -> Display -> History)', () => {
  it('full calculation flow: typing "12 + 34 =", verifying display, history, and Ans', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    // Type 1, 2, +, 3, 4
    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_ADD');
    dispatcher.dispatchKeyId('KEY_3');
    dispatcher.dispatchKeyId('KEY_4');

    expect(dispatcher.getState().expression).toBe('12+34');
    expect(dispatcher.getState().result).toBeNull();

    // Press =
    dispatcher.dispatchKeyId('KEY_EQUALS');
    expect(dispatcher.getState().result).toBe('46');

    // Verify history has entry
    expect(stateManager.getHistoryManager().getCount()).toBe(1);
    const lastHist = stateManager.getHistoryManager().getAll()[0];
    expect(lastHist.expression).toBe('12+34');
    expect(lastHist.result).toBe('46');

    // Ans variable is set to 46
    expect(stateManager.getMemoryStore().getVariable('ANS').toNumber()).toBe(46);
  });

  it('chained calculation: using Ans in subsequent calculation "Ans * 2 = 92"', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    // First calculation: 46
    dispatcher.dispatchKeyId('KEY_4');
    dispatcher.dispatchKeyId('KEY_6');
    dispatcher.dispatchKeyId('KEY_EQUALS');
    expect(dispatcher.getState().result).toBe('46');

    // Press AC to clear screen (history & Ans are retained)
    dispatcher.dispatchKeyId('KEY_AC');
    expect(dispatcher.getState().expression).toBe('');

    // Type Ans * 2 =
    dispatcher.dispatchKeyId('KEY_ANS');
    dispatcher.dispatchKeyId('KEY_MUL');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_EQUALS');

    expect(dispatcher.getState().result).toBe('92');
    expect(stateManager.getHistoryManager().getCount()).toBe(2);
  });

  it('fraction calculation and S<=>D view toggling flow', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    // 1 / 2 + 1 / 3 = 5/6
    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_DIV');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_ADD');
    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_DIV');
    dispatcher.dispatchKeyId('KEY_3');
    dispatcher.dispatchKeyId('KEY_EQUALS');

    // Default exact view is fraction 5/6
    expect(dispatcher.getState().result).toBe('5/6');

    // Toggle S<=>D to Decimal
    dispatcher.dispatchKeyId('KEY_SD');
    expect(dispatcher.getState().result).toMatch(/^0\.833333333/);

    // Toggle S<=>D back to Fraction
    dispatcher.dispatchKeyId('KEY_SD');
    expect(dispatcher.getState().result).toBe('5/6');
  });

  it('syntax error display flow: typing "5 + * 3" displays "Syntax ERROR"', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    dispatcher.dispatchKeyId('KEY_5');
    dispatcher.dispatchKeyId('KEY_ADD');
    dispatcher.dispatchKeyId('KEY_MUL');
    dispatcher.dispatchKeyId('KEY_3');
    dispatcher.dispatchKeyId('KEY_EQUALS');

    expect(dispatcher.getState().result).toBe('Syntax ERROR');
  });

  it('math error display flow: dividing by zero displays "Math ERROR"', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    dispatcher.dispatchKeyId('KEY_9');
    dispatcher.dispatchKeyId('KEY_DIV');
    dispatcher.dispatchKeyId('KEY_0');
    dispatcher.dispatchKeyId('KEY_EQUALS');

    expect(dispatcher.getState().result).toBe('Math ERROR');
  });

  it('history replay and modification: recall previous expression and edit it', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    // 1. Calculate 10 + 20 = 30
    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_0');
    dispatcher.dispatchKeyId('KEY_ADD');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_0');
    dispatcher.dispatchKeyId('KEY_EQUALS');
    expect(dispatcher.getState().result).toBe('30');

    // 2. Press AC
    dispatcher.dispatchKeyId('KEY_AC');

    // 3. Press ArrowUp to recall
    dispatcher.dispatchKeyboardEvent({ key: 'ArrowUp' });
    expect(dispatcher.getState().expression).toBe('10+20');

    // 4. Delete last character (0) with DEL -> expression becomes 10+2
    dispatcher.dispatchKeyId('KEY_DEL');
    expect(dispatcher.getState().expression).toBe('10+2');

    // 5. Press = to re-evaluate -> 12
    dispatcher.dispatchKeyId('KEY_EQUALS');
    expect(dispatcher.getState().result).toBe('12');
    expect(stateManager.getHistoryManager().getCount()).toBe(2);
  });
});

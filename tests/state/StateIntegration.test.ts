import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../../src/input/InputDispatcher';
import { StateManager } from '../../src/state/StateManager';
import { StorageManager, MemoryStorageBackend } from '../../src/state/StorageAdapter';

describe('StateIntegration (InputDispatcher & StateManager)', () => {
  it('records calculations in history upon pressing = and recalls with ArrowUp', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    // Calculate: 5 * 6 = 30
    dispatcher.dispatchKeyId('KEY_5');
    dispatcher.dispatchKeyId('KEY_MUL');
    dispatcher.dispatchKeyId('KEY_6');
    dispatcher.dispatchKeyId('KEY_EQUALS');

    expect(dispatcher.getState().result).toBe('30');
    expect(dispatcher.getState().statusFlags.scrollUp).toBe(true);

    // Clear screen with AC
    dispatcher.dispatchKeyId('KEY_AC');
    expect(dispatcher.getState().expression).toBe('');
    expect(dispatcher.getState().result).toBeNull();
    // History is still intact, so scrollUp is still true!
    expect(dispatcher.getState().statusFlags.scrollUp).toBe(true);

    // Press ArrowUp to recall history
    dispatcher.dispatchKeyboardEvent({ key: 'ArrowUp' });
    expect(dispatcher.getState().expression).toBe('5×6');
    expect(dispatcher.getState().result).toBe('30');
  });

  it('updates memory variable M and toggles icon M on status flags', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    expect(dispatcher.getState().statusFlags.hasMemory).toBe(false);

    // Enter 25 and press M+
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_5');
    dispatcher.dispatchKeyId('KEY_M_PLUS');

    expect(dispatcher.getState().statusFlags.hasMemory).toBe(true);
    expect(stateManager.getMemoryStore().getVariable('M').toNumber()).toBe(25);

    // Subtract 25 with SHIFT + M+ (M-)
    dispatcher.dispatchKeyId('KEY_AC');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_5');
    dispatcher.dispatchKeyId('KEY_SHIFT');
    dispatcher.dispatchKeyId('KEY_M_PLUS');

    expect(stateManager.getMemoryStore().getVariable('M').toNumber()).toBe(0);
    expect(dispatcher.getState().statusFlags.hasMemory).toBe(false);
  });

  it('persists variables and history across dispatcher instances via storage', () => {
    const backend = new MemoryStorageBackend();
    const storage1 = new StorageManager(backend);
    const stateManager1 = new StateManager(undefined, undefined, storage1);
    const dispatcher1 = new InputDispatcher(undefined, undefined, stateManager1);

    // Set variable A = 123 in dispatcher1
    stateManager1.getMemoryStore().setVariable('A', 123);
    // Execute a calculation in dispatcher1
    dispatcher1.dispatchKeyId('KEY_7');
    dispatcher1.dispatchKeyId('KEY_ADD');
    dispatcher1.dispatchKeyId('KEY_3');
    dispatcher1.dispatchKeyId('KEY_EQUALS');
    stateManager1.saveToStorage();

    // Create a new dispatcher2 with the same storage backend
    const storage2 = new StorageManager(backend);
    const stateManager2 = new StateManager(undefined, undefined, storage2);
    const dispatcher2 = new InputDispatcher(undefined, undefined, stateManager2);

    expect(stateManager2.getMemoryStore().getVariable('A').toNumber()).toBe(123);
    expect(stateManager2.getHistoryManager().getCount()).toBe(1);
    expect(stateManager2.getHistoryManager().getAll()[0].result).toBe('10');
    expect(dispatcher2.getState().statusFlags.scrollUp).toBe(true);
  });

  it('clears all history and memory upon SHIFT 9 (RESET)', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);

    stateManager.getMemoryStore().setVariable('M', 50);
    stateManager.recordCalculation('1 + 1', '2');

    // Trigger RESET via SHIFT + KEY_9
    dispatcher.dispatchKeyId('KEY_SHIFT');
    dispatcher.dispatchKeyId('KEY_9');

    expect(dispatcher.getState().expression).toBe('');
    expect(dispatcher.getState().result).toBeNull();
    expect(dispatcher.getState().statusFlags.hasMemory).toBe(false);
    expect(dispatcher.getState().statusFlags.scrollUp).toBe(false);
    expect(stateManager.getHistoryManager().getCount()).toBe(0);
    expect(stateManager.getMemoryStore().getVariable('M').decimal.isZero()).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { StateManager } from '../../src/state/StateManager';
import { MemoryStorageBackend, StorageManager } from '../../src/state/StorageAdapter';
import { MemoryStore } from '../../src/state/MemoryStore';
import { HistoryManager } from '../../src/state/HistoryManager';

describe('StateManager (Single Source of Truth)', () => {
  it('subscribes to state updates and notifies listeners', () => {
    const memory = new MemoryStore();
    const history = new HistoryManager();
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(memory, history, storage);

    let notifyCount = 0;
    const unsubscribe = stateManager.subscribe((snap) => {
      notifyCount++;
      expect(snap.display.expression).toBe('5 + 5');
    });

    stateManager.setExpression('5 + 5');
    expect(notifyCount).toBe(1);

    unsubscribe();
    stateManager.setExpression('2 * 2');
    expect(notifyCount).toBe(1); // Unsubscribed
  });

  it('records calculations, updates history, and sets Ans variable', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);

    stateManager.recordCalculation('10 * 3', '30');

    const appState = stateManager.getAppState();
    expect(appState.display.result).toBe('30');
    expect(appState.historyCount).toBe(1);
    expect(stateManager.getMemoryStore().getVariable('ANS').toNumber()).toBe(0); // If no CalculationResult passed, preserves Ans or sets

    expect(appState.display.statusFlags.scrollUp).toBe(true);
    expect(appState.display.statusFlags.scrollDown).toBe(false);
  });

  it('navigates calculation history using Up and Down', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);

    stateManager.recordCalculation('1 + 1', '2');
    stateManager.recordCalculation('2 + 2', '4');

    // Navigate Up -> loads 2 + 2
    expect(stateManager.navigateHistoryUp()).toBe(true);
    expect(stateManager.getDisplayState().expression).toBe('2 + 2');
    expect(stateManager.getDisplayState().result).toBe('4');
    expect(stateManager.getDisplayState().statusFlags.scrollDown).toBe(true);

    // Navigate Up -> loads 1 + 1
    expect(stateManager.navigateHistoryUp()).toBe(true);
    expect(stateManager.getDisplayState().expression).toBe('1 + 1');
    expect(stateManager.getDisplayState().statusFlags.scrollUp).toBe(false); // Oldest reached

    // Navigate Down -> returns to 2 + 2
    expect(stateManager.navigateHistoryDown()).toBe(true);
    expect(stateManager.getDisplayState().expression).toBe('2 + 2');

    // Navigate Down -> returns to empty fresh buffer
    expect(stateManager.navigateHistoryDown()).toBe(true);
    expect(stateManager.getDisplayState().expression).toBe('');
    expect(stateManager.getDisplayState().result).toBeNull();
  });

  it('updates setup configuration and reflects on status flags', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);

    stateManager.setSetup({ angleUnit: 'RAD', displayMode: 'SCI' });

    const snap = stateManager.getAppState();
    expect(snap.setup.angleUnit).toBe('RAD');
    expect(snap.display.statusFlags.angleUnit).toBe('R');
    expect(snap.display.statusFlags.sci).toBe(true);
    expect(snap.display.statusFlags.fix).toBe(false);
  });

  it('resets all state, memory, and history to pristine state', () => {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);

    stateManager.setExpression('123');
    stateManager.getMemoryStore().setVariable('A', 50);
    stateManager.recordCalculation('1 + 1', '2');

    stateManager.resetAll();

    const snap = stateManager.getAppState();
    expect(snap.display.expression).toBe('');
    expect(snap.display.result).toBeNull();
    expect(snap.historyCount).toBe(0);
    expect(stateManager.getMemoryStore().getVariable('A').decimal.isZero()).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import {
  StorageManager,
  MemoryStorageBackend,
  CURRENT_STATE_VERSION
} from '../../src/state/StorageAdapter';
import { PersistentStatePayload } from '../../src/state/types';

describe('StorageManager & Adapters', () => {
  it('saves and loads valid state payload successfully', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    const payload: PersistentStatePayload = {
      version: CURRENT_STATE_VERSION,
      timestamp: Date.now(),
      variables: { A: '10', B: '20' },
      setup: {
        angleUnit: 'DEG',
        displayMode: 'NORM1',
        naturalDisplay: true
      },
      history: [
        { expression: '1 + 1', result: '2', timestamp: Date.now() }
      ],
      currentMode: 'COMP'
    };

    const saved = manager.saveState(payload);
    expect(saved).toBe(true);

    const loaded = manager.loadState();
    expect(loaded).not.toBeNull();
    expect(loaded!.version).toBe(CURRENT_STATE_VERSION);
    expect(loaded!.variables.A).toBe('10');
    expect(loaded!.history[0].expression).toBe('1 + 1');
  });

  it('rejects payload with invalid schema version', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    const payload: any = {
      version: 999, // Incompatible version
      timestamp: Date.now(),
      variables: {},
      setup: { angleUnit: 'DEG', displayMode: 'NORM1', naturalDisplay: true },
      history: [],
      currentMode: 'COMP'
    };

    backend.setItem('casio_fx580vnx_state_v1', JSON.stringify(payload));
    expect(manager.loadState()).toBeNull();
  });

  it('rejects payload with invalid setup values', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    const payload: any = {
      version: CURRENT_STATE_VERSION,
      timestamp: Date.now(),
      variables: {},
      setup: { angleUnit: 'INVALID_UNIT', displayMode: 'NORM1', naturalDisplay: true },
      history: [],
      currentMode: 'COMP'
    };

    backend.setItem('casio_fx580vnx_state_v1', JSON.stringify(payload));
    expect(manager.loadState()).toBeNull();
  });

  it('handles corrupted JSON string gracefully without crashing', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    backend.setItem('casio_fx580vnx_state_v1', 'corrupted {json [broken');
    const loaded = manager.loadState();
    expect(loaded).toBeNull();
  });

  it('detects and discards dangerous XSS scripts inside storage payload', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    const xssPayload = JSON.stringify({
      version: CURRENT_STATE_VERSION,
      timestamp: Date.now(),
      variables: { A: '<script>alert("hack")</script>' },
      setup: { angleUnit: 'DEG', displayMode: 'NORM1', naturalDisplay: true },
      history: [],
      currentMode: 'COMP'
    });

    backend.setItem('casio_fx580vnx_state_v1', xssPayload);
    const loaded = manager.loadState();
    expect(loaded).toBeNull();
  });

  it('clears state from backend correctly', () => {
    const backend = new MemoryStorageBackend();
    const manager = new StorageManager(backend);

    backend.setItem('casio_fx580vnx_state_v1', 'some_data');
    manager.clearState();
    expect(backend.getItem('casio_fx580vnx_state_v1')).toBeNull();
  });
});

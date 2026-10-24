import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../../src/input/InputDispatcher';
import { StateManager } from '../../src/state/StateManager';
import { StorageManager, MemoryStorageBackend } from '../../src/state/StorageAdapter';

describe('CalculatorAppIntegration (T16 - Toàn diện luồng tích hợp UI, Menu, Ans, STO)', () => {
  function createTestDispatcher() {
    const storage = new StorageManager(new MemoryStorageBackend());
    const stateManager = new StateManager(undefined, undefined, storage);
    const dispatcher = new InputDispatcher(undefined, undefined, stateManager);
    return { dispatcher, stateManager };
  }

  describe('Menu Mode Switching Flow', () => {
    it('opens mode menu on KEY_MENU and switches to COMPLEX on KEY_2', () => {
      const { dispatcher } = createTestDispatcher();
      expect(dispatcher.getState().currentMode).toBe('COMP');
      expect(dispatcher.getState().isMenuOpen).toBeFalsy();

      // Press MENU
      dispatcher.dispatchKeyId('KEY_MENU');
      expect(dispatcher.getState().isMenuOpen).toBe(true);

      // Select 2 (Complex)
      dispatcher.dispatchKeyId('KEY_2');
      expect(dispatcher.getState().isMenuOpen).toBe(false);
      expect(dispatcher.getState().currentMode).toBe('COMPLEX');
    });

    it('switches to MATRIX, VECTOR, BASE-N, TABLE, EQUATION via menu', () => {
      const { dispatcher } = createTestDispatcher();

      // Matrix
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_4');
      expect(dispatcher.getState().currentMode).toBe('MATRIX');

      // Vector
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_5');
      expect(dispatcher.getState().currentMode).toBe('VECTOR');

      // Base-N
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_3');
      expect(dispatcher.getState().currentMode).toBe('BASE-N');

      // Table
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_9');
      expect(dispatcher.getState().currentMode).toBe('TABLE');

      // Equation
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_NEG');
      expect(dispatcher.getState().currentMode).toBe('EQUATION');
    });

    it('displays "Not Supported" for unimplemented modes (e.g. 7, 8)', () => {
      const { dispatcher } = createTestDispatcher();
      dispatcher.dispatchKeyId('KEY_MENU');
      dispatcher.dispatchKeyId('KEY_7');
      expect(dispatcher.getState().notification).toBe('Not Supported');
      expect(dispatcher.getState().currentMode).toBe('COMP');
    });

    it('closes menu without changing mode on KEY_AC', () => {
      const { dispatcher } = createTestDispatcher();
      dispatcher.dispatchKeyId('KEY_MENU');
      expect(dispatcher.getState().isMenuOpen).toBe(true);

      dispatcher.dispatchKeyId('KEY_AC');
      expect(dispatcher.getState().isMenuOpen).toBe(false);
      expect(dispatcher.getState().currentMode).toBe('COMP');
    });
  });

  describe('Automatic Ans Chaining & Expression Reset', () => {
    it('automatically chains "Ans" when pressing a binary operator after result', () => {
      const { dispatcher } = createTestDispatcher();

      // 10 + 20 = 30
      dispatcher.dispatchKeyId('KEY_1');
      dispatcher.dispatchKeyId('KEY_0');
      dispatcher.dispatchKeyId('KEY_ADD');
      dispatcher.dispatchKeyId('KEY_2');
      dispatcher.dispatchKeyId('KEY_0');
      dispatcher.dispatchKeyId('KEY_EQUALS');
      expect(dispatcher.getState().result).toBe('30');

      // Press '+' without AC -> automatically becomes 'Ans+'
      dispatcher.dispatchKeyId('KEY_ADD');
      expect(dispatcher.getState().expression).toBe('Ans+');
      expect(dispatcher.getState().result).toBeNull();

      // Type 5 = -> 35
      dispatcher.dispatchKeyId('KEY_5');
      dispatcher.dispatchKeyId('KEY_EQUALS');
      expect(dispatcher.getState().result).toBe('35');
    });

    it('starts fresh expression when pressing number or function after result', () => {
      const { dispatcher } = createTestDispatcher();

      // 10 + 20 = 30
      dispatcher.dispatchKeyId('KEY_1');
      dispatcher.dispatchKeyId('KEY_0');
      dispatcher.dispatchKeyId('KEY_ADD');
      dispatcher.dispatchKeyId('KEY_2');
      dispatcher.dispatchKeyId('KEY_0');
      dispatcher.dispatchKeyId('KEY_EQUALS');
      expect(dispatcher.getState().result).toBe('30');

      // Press '7' without AC -> starts fresh expression '7'
      dispatcher.dispatchKeyId('KEY_7');
      expect(dispatcher.getState().expression).toBe('7');
      expect(dispatcher.getState().result).toBeNull();

      // Type + 3 = -> 10
      dispatcher.dispatchKeyId('KEY_ADD');
      dispatcher.dispatchKeyId('KEY_3');
      dispatcher.dispatchKeyId('KEY_EQUALS');
      expect(dispatcher.getState().result).toBe('10');
    });
  });

  describe('Variable Storage (STO) Flow', () => {
    it('stores last calculated result into variable A via STO -> KEY_NEG', () => {
      const { dispatcher, stateManager } = createTestDispatcher();

      // 25 * 4 = 100
      dispatcher.dispatchKeyId('KEY_2');
      dispatcher.dispatchKeyId('KEY_5');
      dispatcher.dispatchKeyId('KEY_MUL');
      dispatcher.dispatchKeyId('KEY_4');
      dispatcher.dispatchKeyId('KEY_EQUALS');
      expect(dispatcher.getState().result).toBe('100');

      // Press STO
      dispatcher.dispatchKeyId('KEY_STO');
      expect(dispatcher.getState().notification).toBe('STO');

      // Press KEY_NEG (Variable A)
      dispatcher.dispatchKeyId('KEY_NEG');
      expect(stateManager.getMemoryStore().getVariable('A').toNumber()).toBe(100);
      expect(dispatcher.getState().result).toBe('100 → A');
      expect(dispatcher.getState().notification).toBeNull();
    });

    it('cancels STO mode on KEY_AC', () => {
      const { dispatcher } = createTestDispatcher();
      dispatcher.dispatchKeyId('KEY_STO');
      expect(dispatcher.getState().notification).toBe('STO');

      dispatcher.dispatchKeyId('KEY_AC');
      expect(dispatcher.getState().notification).toBeNull();
    });
  });

  describe('Safe Handling of Unimplemented Features', () => {
    it('safely displays "Not Supported" for KEY_CALC and KEY_OPTN', () => {
      const { dispatcher } = createTestDispatcher();
      dispatcher.dispatchKeyId('KEY_CALC');
      expect(dispatcher.getState().notification).toBe('Not Supported');

      dispatcher.dispatchKeyId('KEY_OPTN');
      expect(dispatcher.getState().notification).toBe('Not Supported');
    });
  });
});

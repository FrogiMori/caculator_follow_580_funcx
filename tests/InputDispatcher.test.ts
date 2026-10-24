import { describe, it, expect } from 'vitest';
import { InputDispatcher } from '../src/input/InputDispatcher';
import { NormalizedInputEvent } from '../src/types/events';

describe('InputDispatcher & Normalized Input Pipeline', () => {
  it('nhấn phím số bằng mouse/touch cập nhật chính xác biểu thức và con trỏ', () => {
    const dispatcher = new InputDispatcher();

    dispatcher.dispatchKeyId('KEY_1', 'MOUSE');
    dispatcher.dispatchKeyId('KEY_2', 'MOUSE');
    dispatcher.dispatchKeyId('KEY_3', 'TOUCH');

    const state = dispatcher.getState();
    expect(state.expression).toBe('123');
    expect(state.cursorPosition).toBe(3);
    expect(state.result).toBeNull();
  });

  it('gõ bàn phím PC và click chuột tạo ra cấu trúc sự kiện đồng nhất', () => {
    const dispatcher = new InputDispatcher();
    const events: NormalizedInputEvent[] = [];

    dispatcher.subscribe((event) => {
      events.push(event);
    });

    // 1. Click phím '7'
    dispatcher.dispatchKeyId('KEY_7', 'MOUSE');

    // 2. Gõ phím '7' từ bàn phím PC
    dispatcher.dispatchKeyboardEvent({ key: '7' });

    expect(events.length).toBe(2);
    expect(events[0].keyId).toBe('KEY_7');
    expect(events[1].keyId).toBe('KEY_7');
    expect(events[0].action.value).toBe(events[1].action.value);
    expect(events[0].source).toBe('MOUSE');
    expect(events[1].source).toBe('KEYBOARD');
  });

  it('phím SHIFT kết hợp tự động chuyển sang nhãn phụ và hoàn trả NORMAL', () => {
    const dispatcher = new InputDispatcher();

    // Nhấn SHIFT
    dispatcher.dispatchKeyId('KEY_SHIFT', 'MOUSE');
    expect(dispatcher.getState().statusFlags.shift).toBe(true);

    // Nhấn phím EXP (chế độ SHIFT là ký tự π)
    dispatcher.dispatchKeyId('KEY_EXP', 'MOUSE');

    const state = dispatcher.getState();
    expect(state.expression).toBe('π');
    // Cờ SHIFT phải tự động tắt
    expect(state.statusFlags.shift).toBe(false);
  });

  it('phím DEL xóa lùi ký tự trước con trỏ', () => {
    const dispatcher = new InputDispatcher();

    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_3');
    expect(dispatcher.getState().expression).toBe('123');

    dispatcher.dispatchKeyId('KEY_DEL');
    expect(dispatcher.getState().expression).toBe('12');
    expect(dispatcher.getState().cursorPosition).toBe(2);
  });

  it('phím AC xóa sạch màn hình, đưa con trỏ về 0 và reset modifier', () => {
    const dispatcher = new InputDispatcher();

    dispatcher.dispatchKeyId('KEY_SHIFT');
    dispatcher.dispatchKeyId('KEY_5');
    dispatcher.dispatchKeyId('KEY_ADD');
    dispatcher.dispatchKeyId('KEY_2');

    expect(dispatcher.getState().expression.length).toBeGreaterThan(0);

    dispatcher.dispatchKeyId('KEY_AC');

    const state = dispatcher.getState();
    expect(state.expression).toBe('');
    expect(state.cursorPosition).toBe(0);
    expect(state.result).toBeNull();
    expect(state.statusFlags.shift).toBe(false);
    expect(state.statusFlags.alpha).toBe(false);
  });

  it('phím điều hướng con trỏ LEFT và RIGHT di chuyển trong phạm vi hợp lệ', () => {
    const dispatcher = new InputDispatcher();

    dispatcher.dispatchKeyId('KEY_1');
    dispatcher.dispatchKeyId('KEY_2');
    dispatcher.dispatchKeyId('KEY_3');
    expect(dispatcher.getState().cursorPosition).toBe(3);

    // Di chuyển sang trái
    dispatcher.dispatchKeyId('KEY_LEFT');
    expect(dispatcher.getState().cursorPosition).toBe(2);

    dispatcher.dispatchKeyId('KEY_LEFT');
    expect(dispatcher.getState().cursorPosition).toBe(1);

    // Chèn ký tự vào giữa: '1' + '+' + '23'
    dispatcher.dispatchKeyId('KEY_ADD');
    expect(dispatcher.getState().expression).toBe('1+23');
    expect(dispatcher.getState().cursorPosition).toBe(2);

    // Di chuyển sang phải
    dispatcher.dispatchKeyId('KEY_RIGHT');
    expect(dispatcher.getState().cursorPosition).toBe(3);
  });
});

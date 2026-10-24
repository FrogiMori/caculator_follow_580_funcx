import { describe, it, expect } from 'vitest';
import { ShiftAlphaFSM } from '../src/input/ShiftAlphaFSM';

describe('ShiftAlphaFSM State Machine', () => {
  it('khởi tạo mặc định ở trạng thái NORMAL', () => {
    const fsm = new ShiftAlphaFSM();
    expect(fsm.getMode()).toBe('NORMAL');
    expect(fsm.isShift()).toBe(false);
    expect(fsm.isAlpha()).toBe(false);
  });

  it('nhấn SHIFT chuyển sang SHIFT, nhấn tiếp SHIFT hủy về NORMAL', () => {
    const fsm = new ShiftAlphaFSM();
    expect(fsm.handleShiftPress()).toBe('SHIFT');
    expect(fsm.isShift()).toBe(true);

    expect(fsm.handleShiftPress()).toBe('NORMAL');
    expect(fsm.isShift()).toBe(false);
  });

  it('nhấn ALPHA chuyển sang ALPHA, nhấn tiếp ALPHA hủy về NORMAL', () => {
    const fsm = new ShiftAlphaFSM();
    expect(fsm.handleAlphaPress()).toBe('ALPHA');
    expect(fsm.isAlpha()).toBe(true);

    expect(fsm.handleAlphaPress()).toBe('NORMAL');
    expect(fsm.isAlpha()).toBe(false);
  });

  it('chuyển đổi qua lại giữa SHIFT và ALPHA', () => {
    const fsm = new ShiftAlphaFSM();
    fsm.handleShiftPress();
    expect(fsm.isShift()).toBe(true);

    fsm.handleAlphaPress();
    expect(fsm.isAlpha()).toBe(true);
    expect(fsm.isShift()).toBe(false);
  });

  it('tự động hoàn trả về NORMAL sau khi tiêu thụ hành động (consumeAfterAction)', () => {
    const fsm = new ShiftAlphaFSM();
    fsm.handleShiftPress();
    expect(fsm.getMode()).toBe('SHIFT');

    fsm.consumeAfterAction();
    expect(fsm.getMode()).toBe('NORMAL');

    fsm.handleAlphaPress();
    expect(fsm.getMode()).toBe('ALPHA');

    fsm.consumeAfterAction();
    expect(fsm.getMode()).toBe('NORMAL');
  });

  it('thông báo cho các subscriber khi trạng thái thay đổi', () => {
    const fsm = new ShiftAlphaFSM();
    const history: string[] = [];

    const unsubscribe = fsm.subscribe((mode) => {
      history.push(mode);
    });

    fsm.handleShiftPress();
    fsm.handleAlphaPress();
    fsm.reset();

    expect(history).toEqual(['SHIFT', 'ALPHA', 'NORMAL']);
    unsubscribe();
  });
});

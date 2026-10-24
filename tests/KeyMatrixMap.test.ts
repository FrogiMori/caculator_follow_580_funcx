import { describe, it, expect } from 'vitest';
import { CASIO_KEYS, KEY_BY_ID, KEY_BY_SHORTCUT, resolveKeyAction } from '../src/input/KeyMatrixMap';

describe('KeyMatrixMap & 50 Casio Keys Definition', () => {
  it('phải có chính xác 50 phím cứng theo chuẩn CLASSWIZ_P20.dll', () => {
    expect(CASIO_KEYS.length).toBe(50);
  });

  it('toàn bộ các phím phải có index từ 0 đến 49 và ID duy nhất', () => {
    const indices = new Set(CASIO_KEYS.map((k) => k.index));
    const ids = new Set(CASIO_KEYS.map((k) => k.id));

    expect(indices.size).toBe(50);
    expect(ids.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(indices.has(i)).toBe(true);
    }
  });

  it('xác thực các phím đặc biệt đã được RE kiểm chứng', () => {
    // Phím ON: (0, 0)
    const keyOn = KEY_BY_ID.get('KEY_ON')!;
    expect(keyOn).toBeDefined();
    expect(keyOn.matrixRow).toBe(0x00);
    expect(keyOn.matrixCol).toBe(0x00);

    // Phím AC: (0x04, 0x10)
    const keyAc = KEY_BY_ID.get('KEY_AC')!;
    expect(keyAc).toBeDefined();
    expect(keyAc.matrixRow).toBe(0x04);
    expect(keyAc.matrixCol).toBe(0x10);

    // Phím SHIFT: (0x80, 0x01)
    const keyShift = KEY_BY_ID.get('KEY_SHIFT')!;
    expect(keyShift).toBeDefined();
    expect(keyShift.matrixRow).toBe(0x80);
    expect(keyShift.matrixCol).toBe(0x01);
  });

  it('phân giải chính xác hành động ở chế độ NORMAL', () => {
    const key7 = KEY_BY_ID.get('KEY_7')!;
    const action7 = resolveKeyAction(key7, 'NORMAL');
    expect(action7.type).toBe('CHAR');
    expect(action7.value).toBe('7');

    const keyPlus = KEY_BY_ID.get('KEY_ADD')!;
    const actionPlus = resolveKeyAction(keyPlus, 'NORMAL');
    expect(actionPlus.type).toBe('CHAR');
    expect(actionPlus.value).toBe('+');

    const keyFrac = KEY_BY_ID.get('KEY_FRAC')!;
    const actionFrac = resolveKeyAction(keyFrac, 'NORMAL');
    expect(actionFrac.type).toBe('BLOCK');
  });

  it('phân giải chính xác nhãn phụ ở chế độ SHIFT', () => {
    const keyExp = KEY_BY_ID.get('KEY_EXP')!;
    const actionPi = resolveKeyAction(keyExp, 'SHIFT');
    expect(actionPi.type).toBe('CHAR');
    expect(actionPi.value).toBe('π');

    const keySin = KEY_BY_ID.get('KEY_SIN')!;
    const actionSinInv = resolveKeyAction(keySin, 'SHIFT');
    expect(actionSinInv.type).toBe('FUNCTION');
    expect(actionSinInv.value).toBe('sin⁻¹(');
  });

  it('phân giải chính xác nhãn phụ ở chế độ ALPHA', () => {
    const keyNeg = KEY_BY_ID.get('KEY_NEG')!;
    const actionA = resolveKeyAction(keyNeg, 'ALPHA');
    expect(actionA.type).toBe('CHAR');
    expect(actionA.value).toBe('A');

    const keyEng = KEY_BY_ID.get('KEY_ENG')!;
    const actionI = resolveKeyAction(keyEng, 'ALPHA');
    expect(actionI.type).toBe('CHAR');
    expect(actionI.value).toBe('i');
  });

  it('mọi phím phải có shortcut PC duy nhất hoặc tra cứu được', () => {
    expect(KEY_BY_SHORTCUT.get('7')?.id).toBe('KEY_7');
    expect(KEY_BY_SHORTCUT.get('+')?.id).toBe('KEY_ADD');
    expect(KEY_BY_SHORTCUT.get('C')?.id).toBe('KEY_AC');
    expect(KEY_BY_SHORTCUT.get('W')?.id).toBe('KEY_ON');
  });
});

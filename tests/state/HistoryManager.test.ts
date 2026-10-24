import { describe, it, expect } from 'vitest';
import { HistoryManager } from '../../src/state/HistoryManager';

describe('HistoryManager', () => {
  it('adds entries and maintains ring buffer capacity', () => {
    const mgr = new HistoryManager(3); // Capacity 3

    mgr.addEntry('1 + 1', '2');
    mgr.addEntry('2 + 2', '4');
    mgr.addEntry('3 + 3', '6');
    expect(mgr.getCount()).toBe(3);

    // Adding 4th entry drops the oldest (1 + 1)
    mgr.addEntry('4 + 4', '8');
    expect(mgr.getCount()).toBe(3);

    const all = mgr.getAll();
    expect(all[0].expression).toBe('2 + 2');
    expect(all[1].expression).toBe('3 + 3');
    expect(all[2].expression).toBe('4 + 4');
  });

  it('navigates up (▲) from newest to oldest calculation', () => {
    const mgr = new HistoryManager(10);
    mgr.addEntry('10 * 2', '20');
    mgr.addEntry('5 * 5', '25');

    expect(mgr.canScrollUp()).toBe(true);
    expect(mgr.canScrollDown()).toBe(false);

    // 1st Up -> most recent (5 * 5)
    const e1 = mgr.navigateUp();
    expect(e1).not.toBeNull();
    expect(e1!.expression).toBe('5 * 5');
    expect(mgr.canScrollUp()).toBe(true);
    expect(mgr.canScrollDown()).toBe(true);

    // 2nd Up -> earlier (10 * 2)
    const e2 = mgr.navigateUp();
    expect(e2).not.toBeNull();
    expect(e2!.expression).toBe('10 * 2');
    expect(mgr.canScrollUp()).toBe(false); // Reached oldest
    expect(mgr.canScrollDown()).toBe(true);

    // 3rd Up -> stays at oldest
    const e3 = mgr.navigateUp();
    expect(e3!.expression).toBe('10 * 2');
  });

  it('navigates down (▼) towards newest and returns to fresh input', () => {
    const mgr = new HistoryManager(10);
    mgr.addEntry('1 + 2', '3');
    mgr.addEntry('4 + 5', '9');

    // Go to oldest
    mgr.navigateUp();
    mgr.navigateUp();
    expect(mgr.getCurrentEntry()!.expression).toBe('1 + 2');

    // 1st Down -> moves to '4 + 5'
    const e1 = mgr.navigateDown();
    expect(e1).not.toBeNull();
    expect(e1!.expression).toBe('4 + 5');

    // 2nd Down -> returns to fresh input (null)
    const e2 = mgr.navigateDown();
    expect(e2).toBeNull();
    expect(mgr.canScrollDown()).toBe(false);
  });

  it('clears all history and resets navigation', () => {
    const mgr = new HistoryManager(10);
    mgr.addEntry('7 * 8', '56');
    expect(mgr.getCount()).toBe(1);

    mgr.clear();
    expect(mgr.getCount()).toBe(0);
    expect(mgr.canScrollUp()).toBe(false);
    expect(mgr.canScrollDown()).toBe(false);
    expect(mgr.navigateUp()).toBeNull();
  });

  it('safely loads raw entries and filters invalid/corrupted items', () => {
    const mgr = new HistoryManager(5);
    const corruptedList = [
      null,
      undefined,
      'just a string',
      { expression: '1 + 1', result: '2' },
      { expression: '', result: 'invalid' },
      { expression: '9 * 9', result: '81', timestamp: 12345678 }
    ];

    mgr.loadEntries(corruptedList);
    expect(mgr.getCount()).toBe(2);
    expect(mgr.getAll()[0].expression).toBe('1 + 1');
    expect(mgr.getAll()[1].expression).toBe('9 * 9');
  });
});

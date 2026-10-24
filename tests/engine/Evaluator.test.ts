import { describe, it, expect } from 'vitest';
import { CoreMathEngine, calculate } from '../../src/engine/index';
import { Fraction } from '../../src/engine/fraction';
import { MathError } from '../../src/engine/errors';
import { CalculationResult } from '../../src/engine/result';

describe('CoreMathEngine (Bộ máy tính toán số học Casio fx-580VN X)', () => {
  describe('Phạm vi 1: Bốn phép tính cơ bản (+, -, ×, ÷) và độ ưu tiên', () => {
    it('ưu tiên nhân chia trước cộng trừ: 2 + 3 × 4 = 14', () => {
      const res = calculate('2 + 3 × 4');
      expect(res.getDisplayText()).toBe('14');
    });

    it('tôn trọng dấu ngoặc đơn: (2 + 3) × 4 = 20', () => {
      const res = calculate('(2 + 3) × 4');
      expect(res.getDisplayText()).toBe('20');
    });

    it('kết hợp trái: 10 - 4 - 2 = 4', () => {
      const res = calculate('10 - 4 - 2');
      expect(res.getDisplayText()).toBe('4');
    });

    it('chia liên tiếp: 12 ÷ 3 ÷ 2 = 2', () => {
      const res = calculate('12 ÷ 3 ÷ 2');
      expect(res.getDisplayText()).toBe('2');
    });

    it('phép tính phức hợp: ((20 - 5) × 2) ÷ (1 + 2) = 10', () => {
      const res = calculate('((20 - 5) × 2) ÷ (1 + 2)');
      expect(res.getDisplayText()).toBe('10');
    });
  });

  describe('Phạm vi 2: Dấu trừ một ngôi, số âm và thứ tự lũy thừa', () => {
    it('số âm đứng đầu và phép cộng: -5 + 3 = -2', () => {
      const res = calculate('-5 + 3');
      expect(res.getDisplayText()).toBe('-2');
    });

    it('nhân với số âm: 5 × -3 = -15', () => {
      const res = calculate('5 × -3');
      expect(res.getDisplayText()).toBe('-15');
    });

    it('trừ số âm: 5 - - 3 = 8', () => {
      const res = calculate('5 - - 3');
      expect(res.getDisplayText()).toBe('8');
    });

    it('chuỗi dấu trừ âm: ---3 = -3', () => {
      const res = calculate('---3');
      expect(res.getDisplayText()).toBe('-3');
    });

    it('chuẩn Casio: Lũy thừa có độ ưu tiên cao hơn dấu trừ âm (-3^2 = -9)', () => {
      const res = calculate('-3^2');
      expect(res.getDisplayText()).toBe('-9');
    });

    it('dấu trừ trong ngoặc được bình phương: (-3)^2 = 9', () => {
      const res = calculate('(-3)^2');
      expect(res.getDisplayText()).toBe('9');
    });

    it('toán tử hậu tố bình phương có độ ưu tiên cao hơn dấu trừ âm: -3² = -9', () => {
      const res = calculate('-3²');
      expect(res.getDisplayText()).toBe('-9');
    });

    it('toán tử hậu tố bình phương trong ngoặc: (-3)² = 9', () => {
      const res = calculate('(-3)²');
      expect(res.getDisplayText()).toBe('9');
    });

    it('lũy thừa kết hợp phải: 2^3^2 = 512 (2^(3^2))', () => {
      const res = calculate('2^3^2');
      expect(res.getDisplayText()).toBe('512');
    });

    it('lũy thừa số mũ âm: 2^-3 = 0.125', () => {
      const res = calculate('2^-3');
      expect(res.decimal.formatDisplay('NORM1')).toBe('0.125');
    });
  });

  describe('Phạm vi 3: Phép nhân ngầm định chuẩn Casio ClassWiz (Implicit Multiplication)', () => {
    it('phép tính kinh điển Casio: 6 ÷ 2(1+2) = 1', () => {
      const res = calculate('6 ÷ 2(1+2)');
      expect(res.getDisplayText()).toBe('1');
    });

    it('phân biệt với phép nhân tường minh: 6 ÷ 2 × (1+2) = 9', () => {
      const res = calculate('6 ÷ 2 × (1+2)');
      expect(res.getDisplayText()).toBe('9');
    });

    it('nhân ngầm hai cặp ngoặc: (2+3)(4+5) = 45', () => {
      const res = calculate('(2+3)(4+5)');
      expect(res.getDisplayText()).toBe('45');
    });

    it('nhân ngầm trước biến có độ ưu tiên cao hơn phép chia: 1 ÷ 2x với x = 5 -> 1/10', () => {
      const engine = new CoreMathEngine();
      engine.setVariable('X', CalculationResult.fromFraction(Fraction.fromNumberString('5')));
      const res = engine.evaluateExpression('1 ÷ 2x');
      expect(res.getDisplayText()).toBe('1/10');
      expect(res.decimal.formatDisplay('NORM1')).toBe('0.1');
    });
  });

  describe('Phạm vi 4: Tính toán phân số chính xác (Exact Fraction) và phím S<=>D', () => {
    it('cộng phân số tối giản: 1/2 + 1/3 = 5/6', () => {
      const res = calculate('1/2 + 1/3');
      expect(res.currentView).toBe('EXACT');
      expect(res.getDisplayText()).toBe('5/6');
      expect(res.decimal.toStandardDecimalString(10)).toBe('0.8333333333');

      // Chuyển đổi bằng phím S<=>D
      res.toggleView();
      expect(res.currentView).toBe('DECIMAL');
      expect(res.getDisplayText()).toBe('0.8333333333');

      // Bấm lại S<=>D quay về phân số
      res.toggleView();
      expect(res.getDisplayText()).toBe('5/6');
    });

    it('phân số với toán tử ⌟: 1⌟2 + 3⌟4 = 5/4', () => {
      const res = calculate('1⌟2 + 3⌟4');
      expect(res.getDisplayText()).toBe('5/4');
      expect(res.formatMixedFraction()).toBe('1 1/4');
    });

    it('tự động rút gọn phân số thành số nguyên: 8 ÷ 4 = 2', () => {
      const res = calculate('8 ÷ 4');
      expect(res.getDisplayText()).toBe('2');
    });

    it('đầu vào chứa số thập phân hiển thị mặc định dạng Decimal: 0.5 + 1/3', () => {
      const res = calculate('0.5 + 1/3');
      expect(res.currentView).toBe('DECIMAL');
      expect(res.getDisplayText()).toBe('0.8333333333');
    });
  });

  describe('Phạm vi 5: Ký pháp khoa học và hằng số', () => {
    it('ký pháp khoa học: 3×10^8 × 2×10^-3 = 600000', () => {
      const res = calculate('3×10^8 × 2×10^-3');
      expect(res.getDisplayText()).toBe('600000');
    });

    it('ký pháp khoa học đứng đầu không có hệ số: ×10^3 + 5 = 1005', () => {
      const res = calculate('×10^3 + 5');
      expect(res.getDisplayText()).toBe('1005');
    });

    it('hằng số π: 2π ≈ 6.283185307', () => {
      const res = calculate('2π');
      expect(res.decimal.formatDisplay('NORM1')).toBe('6.283185307');
    });
  });

  describe('Phạm vi 6: Toán tử hậu tố, phần trăm, giai thừa, tổ hợp, chỉnh hợp', () => {
    it('giai thừa 5! = 120 và 0! = 1', () => {
      expect(calculate('5!').getDisplayText()).toBe('120');
      expect(calculate('0!').getDisplayText()).toBe('1');
    });

    it('chỉnh hợp 5P2 = 20 và tổ hợp 5C2 = 10', () => {
      expect(calculate('5P2').getDisplayText()).toBe('20');
      expect(calculate('5C2').getDisplayText()).toBe('10');
    });

    it('toán tử phần trăm %: 50% = 0.5', () => {
      const res = calculate('50%');
      expect(res.decimal.formatDisplay('NORM1')).toBe('0.5');
    });

    it('phép tính phần trăm: 100 × 10% = 10 và 100 + 10% = 1001/10 (100.1)', () => {
      expect(calculate('100 × 10%').getDisplayText()).toBe('10');
      const addPct = calculate('100 + 10%');
      expect(addPct.getDisplayText()).toBe('1001/10');
      expect(addPct.decimal.formatDisplay('NORM1')).toBe('100.1');
    });
  });

  describe('Phạm vi 7: Hàm toán học cơ bản (√, abs, root)', () => {
    it('căn bậc hai số chính phương: √(4) = 2, √(16) = 4', () => {
      expect(calculate('√(4)').getDisplayText()).toBe('2');
      expect(calculate('√(16)').getDisplayText()).toBe('4');
    });

    it('căn bậc hai phân số chính phương: √(1/4) = 1/2', () => {
      const res = calculate('√(1/4)');
      expect(res.getDisplayText()).toBe('1/2');
    });

    it('trị tuyệt đối: abs(-25) = 25', () => {
      expect(calculate('abs(-25)').getDisplayText()).toBe('25');
    });

    it('căn bậc n: root(3, 27) = 3', () => {
      expect(calculate('root(3, 27)').getDisplayText()).toBe('3');
    });
  });

  describe('Phạm vi 8: Biến nhớ và Ans', () => {
    it('tự động lưu kết quả vào Ans và dùng trong phép tính tiếp theo', () => {
      const engine = new CoreMathEngine();
      engine.evaluateExpression('15 + 5'); // Ans = 20
      const res = engine.evaluateExpression('Ans × 2');
      expect(res.getDisplayText()).toBe('40');
    });

    it('biến nhớ mặc định là 0 khi chưa gán', () => {
      const engine = new CoreMathEngine();
      const res = engine.evaluateExpression('A + 10');
      expect(res.getDisplayText()).toBe('10');
    });
  });

  describe('Phạm vi 9: Xử lý lỗi toán học có cấu trúc (Math ERROR)', () => {
    it('báo lỗi khi chia cho 0: 1 ÷ 0', () => {
      expect(() => calculate('1 ÷ 0')).toThrow(MathError);
      try {
        calculate('1 ÷ 0');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('DIVISION_BY_ZERO');
      }
    });

    it('báo lỗi 0^0 không xác định', () => {
      try {
        calculate('0^0');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('INVALID_POWER');
      }
    });

    it('báo lỗi 0^-2 (chia cho 0)', () => {
      try {
        calculate('0^-2');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('DIVISION_BY_ZERO');
      }
    });

    it('báo lỗi căn bậc hai số âm: √(-9)', () => {
      try {
        calculate('√(-9)');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('MATH_ERROR');
      }
    });

    it('báo lỗi giai thừa vượt giới hạn: 70!', () => {
      try {
        calculate('70!');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('INVALID_FACTORIAL');
      }
    });

    it('báo lỗi chỉnh hợp n < r: 3P5', () => {
      try {
        calculate('3P5');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('INVALID_PERM_COMB');
      }
    });

    it('báo lỗi tràn số khi kết quả ≥ 10^100', () => {
      try {
        calculate('10^100');
      } catch (e) {
        const err = e as MathError;
        expect(err.code).toBe('OVERFLOW');
      }
    });
  });
});

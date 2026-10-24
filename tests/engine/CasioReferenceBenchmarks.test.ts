import { describe, it, expect } from 'vitest';
import { CoreMathEngine, calculate } from '../../src/engine/index';
import { Decimal } from '../../src/engine/decimal';
import { MathError } from '../../src/engine/errors';
import { ComplexNumber } from '../../src/engine/complex';
import { solveLinearSystem } from '../../src/modes/equation/linearSystem';
import { solvePolynomial } from '../../src/modes/equation/polynomial';

describe('CasioReferenceBenchmarks (Bộ kiểm chuẩn độc lập theo sách hướng dẫn fx-580VN X)', () => {
  describe('Benchmark 1: Độ chính xác số học & BCD Guard Digits', () => {
    it('tránh lỗi làm tròn nhị phân IEEE-754: 0.1 + 0.2 = 0.3', () => {
      const res = calculate('0.1 + 0.2');
      expect(res.decimal.formatDisplay('NORM1')).toBe('0.3');
      expect(res.decimal.toNumber()).toBe(0.3);
    });

    it('tính toán phân số và nghịch đảo tuần hoàn: (1 ÷ 3) × 3 = 1', () => {
      const res = calculate('(1 ÷ 3) × 3');
      expect(res.getDisplayText()).toBe('1');
      expect(res.decimal.toNumber()).toBe(1);
    });

    it('triệt tiêu sai số cộng dồn: 1 - 10 × 0.1 = 0', () => {
      const res = calculate('1 - 10 × 0.1');
      expect(res.decimal.formatDisplay('NORM1')).toBe('0');
      expect(res.decimal.isZero()).toBe(true);
    });

    it('tính toán chuỗi phép tính chính xác: (1 ÷ 7) × 7 = 1', () => {
      const res = calculate('(1 ÷ 7) × 7');
      expect(res.getDisplayText()).toBe('1');
    });
  });

  describe('Benchmark 2: Quy tắc ưu tiên toán tử Casio ClassWiz', () => {
    it('phép tính kinh điển Casio: 6 ÷ 2(1 + 2) = 1 (Nhân ngầm Loại B > Chia)', () => {
      const res = calculate('6 ÷ 2(1 + 2)');
      expect(res.getDisplayText()).toBe('1');
    });

    it('ưu tiên lũy thừa cao hơn dấu trừ âm một ngôi: -3² = -9', () => {
      const res = calculate('-3²');
      expect(res.getDisplayText()).toBe('-9');
    });

    it('ngoặc bao quanh dấu âm: (-3)² = 9', () => {
      const res = calculate('(-3)²');
      expect(res.getDisplayText()).toBe('9');
    });

    it('lũy thừa tầng liên tiếp kết hợp phải: 2^3^2 = 2^(3^2) = 512', () => {
      const res = calculate('2^3^2');
      expect(res.getDisplayText()).toBe('512');
    });

    it('ưu tiên giai thừa cao hơn phép nhân: 2 × 3! = 12', () => {
      const res = calculate('2 × 3!');
      expect(res.getDisplayText()).toBe('12');
    });

    it('tự động đóng ngoặc ở cuối biểu thức: 3 × (4 + 5 -> 27', () => {
      const res = calculate('3 × (4 + 5');
      expect(res.getDisplayText()).toBe('27');
    });
  });

  describe('Benchmark 3: Giới hạn tràn số và kiểm tra lỗi (Capacity & Error Handling)', () => {
    it('báo Math ERROR khi chia cho 0: 5 ÷ 0', () => {
      expect(() => calculate('5 ÷ 0')).toThrow(MathError);
    });

    it('báo Math ERROR khi cơ số và số mũ bằng 0: 0^0', () => {
      expect(() => calculate('0^0')).toThrow(MathError);
    });

    it('báo Math ERROR khi căn bậc hai số âm trong mode thực: √(-4)', () => {
      expect(() => calculate('√(-4)')).toThrow(MathError);
    });

    it('cho phép tính số mũ trong giới hạn dung lượng: 10^99', () => {
      const res = calculate('10^99');
      expect(res).toBeDefined();
    });

    it('báo Math ERROR khi kết quả vượt quá giới hạn 10^100: 10^100', () => {
      expect(() => calculate('10^100')).toThrow(MathError);
    });

    it('giai thừa 69! thành công và 70! báo Math ERROR (vượt 10^100)', () => {
      const res69 = calculate('69!');
      expect(res69).toBeDefined();
      expect(() => calculate('70!')).toThrow(MathError);
    });

    it('giai thừa số âm có ngoặc (-5)! báo Math ERROR', () => {
      expect(() => calculate('(-5)!')).toThrow(MathError);
    });

    it('giai thừa của 0: 0! = 1', () => {
      const res = calculate('0!');
      expect(res.getDisplayText()).toBe('1');
    });
  });

  describe('Benchmark 4: Số học phân số & Chuyển đổi hiển thị S<=>D', () => {
    it('tính toán phân số phức hợp: 2/3 + 3/4 × 5/6 = 31/24', () => {
      const res = calculate('2⌟3 + 3⌟4 × 5⌟6');
      expect(res.currentView).toBe('EXACT');
      expect(res.getDisplayText()).toBe('31/24');

      // Chuyển đổi S<=>D
      res.toggleView();
      expect(res.currentView).toBe('DECIMAL');
      expect(res.getDisplayText()).toBe('1.291666667');
    });

    it('rút gọn phân số tự động về tối giản: 18/24 = 3/4', () => {
      const res = calculate('18⌟24');
      expect(res.getDisplayText()).toBe('3/4');
    });
  });

  describe('Benchmark 5: Rút gọn biểu thức căn thức (Radical Simplification)', () => {
    it('rút gọn √12 = 2√3', () => {
      const res = calculate('√(12)');
      expect(res.radicalForm).toBeDefined();
      expect(res.radicalForm?.coefficient.toFractionString()).toBe('2');
      expect(res.radicalForm?.radicand).toBe(3n);
      expect(res.getDisplayText()).toBe('2√3');
    });

    it('rút gọn √75 = 5√3', () => {
      const res = calculate('√(75)');
      expect(res.radicalForm?.coefficient.toFractionString()).toBe('5');
      expect(res.radicalForm?.radicand).toBe(3n);
      expect(res.getDisplayText()).toBe('5√3');
    });

    it('rút gọn √200 = 10√2', () => {
      const res = calculate('√(200)');
      expect(res.radicalForm?.coefficient.toFractionString()).toBe('10');
      expect(res.radicalForm?.radicand).toBe(2n);
      expect(res.getDisplayText()).toBe('10√2');
    });

    it('khai căn chính phương ra số nguyên: √144 = 12', () => {
      const res = calculate('√(144)');
      expect(res.getDisplayText()).toBe('12');
    });
  });

  describe('Benchmark 6: Chỉnh hợp (nPr) & Tổ hợp (nCr)', () => {
    it('tính chỉnh hợp 5P2 = 20', () => {
      const res = calculate('5P2');
      expect(res.getDisplayText()).toBe('20');
    });

    it('tính tổ hợp 5C2 = 10', () => {
      const res = calculate('5C2');
      expect(res.getDisplayText()).toBe('10');
    });

    it('tính biên tổ hợp 10C0 = 1 và 10C10 = 1', () => {
      expect(calculate('10C0').getDisplayText()).toBe('1');
      expect(calculate('10C10').getDisplayText()).toBe('1');
    });

    it('báo Math ERROR khi n < r trong tổ hợp/chỉnh hợp: 3P5', () => {
      expect(() => calculate('3P5')).toThrow(MathError);
      expect(() => calculate('3C5')).toThrow(MathError);
    });
  });

  describe('Benchmark 7: Lượng giác & Triệt tiêu sai số theo đơn vị góc', () => {
    it('góc đặc biệt trong DEG: sin(30°) = 0.5, cos(60°) = 0.5, tan(45°) = 1', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      expect(engine.evaluateExpression('sin(30)').decimal.formatDisplay('NORM1')).toBe('0.5');
      expect(engine.evaluateExpression('cos(60)').decimal.formatDisplay('NORM1')).toBe('0.5');
      expect(engine.evaluateExpression('tan(45)').decimal.formatDisplay('NORM1')).toBe('1');
    });

    it('triệt tiêu sai số lượng giác về đúng 0: sin(180°) = 0, cos(90°) = 0', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      expect(engine.evaluateExpression('sin(180)').decimal.isZero()).toBe(true);
      expect(engine.evaluateExpression('cos(90)').decimal.isZero()).toBe(true);
    });

    it('báo Math ERROR khi tan không xác định: tan(90°)', () => {
      const engine = new CoreMathEngine({ angleUnit: 'DEG' });
      expect(() => engine.evaluateExpression('tan(90)')).toThrow(MathError);
    });
  });

  describe('Benchmark 8: Đại số số phức (Complex Algebra - Mode 2)', () => {
    it('phép nhân số phức: (1 + 2i)(3 - i) = 5 + 5i', () => {
      const c1 = new ComplexNumber(Decimal.fromNumber(1), Decimal.fromNumber(2));
      const c2 = new ComplexNumber(Decimal.fromNumber(3), Decimal.fromNumber(-1));
      const prod = c1.mul(c2);
      expect(prod.re.toNumber()).toBe(5);
      expect(prod.im.toNumber()).toBe(5);
      expect(prod.toString('DEG')).toBe('5+5i');
    });

    it('mô-đun số phức (Absolute value): |3 + 4i| = 5', () => {
      const c = new ComplexNumber(Decimal.fromNumber(3), Decimal.fromNumber(4));
      expect(c.abs().toNumber()).toBe(5);
    });

    it('argument số phức theo đơn vị góc DEG: arg(1 + i) = 45°', () => {
      const c = new ComplexNumber(Decimal.fromNumber(1), Decimal.fromNumber(1));
      expect(c.arg('DEG').toNumber()).toBeCloseTo(45, 8);
    });

    it('số phức liên hợp: conj(3 + 4i) = 3 - 4i', () => {
      const c = new ComplexNumber(Decimal.fromNumber(3), Decimal.fromNumber(4));
      const conj = c.conj();
      expect(conj.re.toNumber()).toBe(3);
      expect(conj.im.toNumber()).toBe(-4);
      expect(conj.toString('DEG')).toBe('3-4i');
    });

    it('phép chia số phức: (1 + i) ÷ (1 - i) = i', () => {
      const c1 = new ComplexNumber(Decimal.fromNumber(1), Decimal.fromNumber(1));
      const c2 = new ComplexNumber(Decimal.fromNumber(1), Decimal.fromNumber(-1));
      const quot = c1.div(c2);
      expect(quot.re.toNumber()).toBe(0);
      expect(quot.im.toNumber()).toBe(1);
    });
  });

  describe('Benchmark 9: Hệ phương trình tuyến tính (Mode A - Sim EQ)', () => {
    it('hệ 2 ẩn có nghiệm nguyên: 2x + 3y = 7, x - y = 1 => (2, 1)', () => {
      const matrix = [
        [2, 3],
        [1, -1]
      ];
      const constants = [7, 1];
      const res = solveLinearSystem(2, matrix, constants);
      expect(res.status).toBe('UNIQUE');
      expect(res.solutions[0].value.toFractionString()).toBe('2');
      expect(res.solutions[1].value.toFractionString()).toBe('1');
    });

    it('hệ 3 ẩn có nghiệm nguyên: x + 2y + z = 9, 2x - y + 3z = 12, 3x + y - z = 1 => (1, 2, 4)', () => {
      const matrix = [
        [1, 2, 1],
        [2, -1, 3],
        [3, 1, -1]
      ];
      const constants = [9, 12, 1];
      const res = solveLinearSystem(3, matrix, constants);
      expect(res.status).toBe('UNIQUE');
      expect(res.solutions[0].value.toFractionString()).toBe('1');
      expect(res.solutions[1].value.toFractionString()).toBe('2');
      expect(res.solutions[2].value.toFractionString()).toBe('4');
    });

    it('hệ phương trình vô nghiệm (No Solution)', () => {
      const matrix = [
        [1, 1],
        [2, 2]
      ];
      const constants = [2, 5];
      const res = solveLinearSystem(2, matrix, constants);
      expect(res.status).toBe('NO_SOLUTION');
    });
  });

  describe('Benchmark 10: Phương trình đa thức (Mode A - Polynomial)', () => {
    it('phương trình bậc 2 có 2 nghiệm phân biệt: x² - 5x + 6 = 0 => (3, 2)', () => {
      const res = solvePolynomial(2, [1, -5, 6]);
      expect(res.roots).toHaveLength(2);
      const roots = res.roots.map((r) => r.real.toNumber()).sort((a, b) => b - a);
      expect(roots[0]).toBeCloseTo(3, 8);
      expect(roots[1]).toBeCloseTo(2, 8);
    });

    it('phương trình bậc 3 có 3 nghiệm phân biệt: x³ - 6x² + 11x - 6 = 0 => (3, 2, 1)', () => {
      const res = solvePolynomial(3, [1, -6, 11, -6]);
      expect(res.roots).toHaveLength(3);
      const roots = res.roots.map((r) => r.real.toNumber()).sort((a, b) => b - a);
      expect(roots[0]).toBeCloseTo(3, 8);
      expect(roots[1]).toBeCloseTo(2, 8);
      expect(roots[2]).toBeCloseTo(1, 8);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseExpression } from '../../src/parser/index';
import {
  BinaryOpNode,
  UnaryOpNode,
  NumberNode,
  ImplicitMulNode,
  ParenthesisNode,
  FunctionCallNode,
  PostfixOpNode,
  FractionNode,
  VariableNode,
  ConstantNode
} from '../../src/parser/ast';
import { CasioSyntaxError } from '../../src/parser/errors';

describe('Parser (Bộ phân tích cú pháp Pratt Parser Casio fx-580VN X)', () => {
  describe('Độ ưu tiên số học cơ bản (PEMDAS)', () => {
    it('ưu tiên phép nhân và chia trước phép cộng và trừ (2 + 3 × 4)', () => {
      const ast = parseExpression('2 + 3 × 4') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('+');
      expect((ast.left as NumberNode).value).toBe('2');

      const right = ast.right as BinaryOpNode;
      expect(right.type).toBe('BinaryOp');
      expect(right.op).toBe('×');
      expect((right.left as NumberNode).value).toBe('3');
      expect((right.right as NumberNode).value).toBe('4');
    });

    it('xử lý kết hợp trái cho các phép tính cùng mức ưu tiên (10 - 4 - 2)', () => {
      const ast = parseExpression('10 - 4 - 2') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('-');
      expect((ast.right as NumberNode).value).toBe('2');

      const left = ast.left as BinaryOpNode;
      expect(left.type).toBe('BinaryOp');
      expect(left.op).toBe('-');
      expect((left.left as NumberNode).value).toBe('10');
      expect((left.right as NumberNode).value).toBe('4');
    });

    it('tôn trọng dấu ngoặc đơn ghi đè độ ưu tiên ((2 + 3) × 4)', () => {
      const ast = parseExpression('(2 + 3) × 4') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('×');
      expect((ast.right as NumberNode).value).toBe('4');

      const left = ast.left as ParenthesisNode;
      expect(left.type).toBe('Parenthesis');

      const inner = left.content as BinaryOpNode;
      expect(inner.type).toBe('BinaryOp');
      expect(inner.op).toBe('+');
      expect((inner.left as NumberNode).value).toBe('2');
      expect((inner.right as NumberNode).value).toBe('3');
    });
  });

  describe('Dấu trừ một ngôi vs Dấu trừ hai ngôi (Unary vs Binary Minus)', () => {
    it('nhận diện dấu trừ một ngôi ở đầu biểu thức (-5 + 3)', () => {
      const ast = parseExpression('-5 + 3') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('+');

      const left = ast.left as UnaryOpNode;
      expect(left.type).toBe('UnaryOp');
      expect(left.op).toBe('-');
      expect((left.argument as NumberNode).value).toBe('5');

      expect((ast.right as NumberNode).value).toBe('3');
    });

    it('nhận diện dấu trừ một ngôi đứng sau toán tử nhân (5 × -3)', () => {
      const ast = parseExpression('5 × -3') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('×');
      expect((ast.left as NumberNode).value).toBe('5');

      const right = ast.right as UnaryOpNode;
      expect(right.type).toBe('UnaryOp');
      expect(right.op).toBe('-');
      expect((right.argument as NumberNode).value).toBe('3');
    });

    it('phân biệt hai dấu trừ liên tiếp: 5 - - 3 (phép trừ với số âm)', () => {
      const ast = parseExpression('5 - - 3') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('-');
      expect((ast.left as NumberNode).value).toBe('5');

      const right = ast.right as UnaryOpNode;
      expect(right.type).toBe('UnaryOp');
      expect(right.op).toBe('-');
      expect((right.argument as NumberNode).value).toBe('3');
    });

    it('xử lý chuỗi nhiều dấu trừ một ngôi liên tiếp: ---3', () => {
      const ast = parseExpression('---3') as UnaryOpNode;

      expect(ast.type).toBe('UnaryOp');
      expect(ast.op).toBe('-');

      const u2 = ast.argument as UnaryOpNode;
      expect(u2.type).toBe('UnaryOp');

      const u3 = u2.argument as UnaryOpNode;
      expect(u3.type).toBe('UnaryOp');
      expect((u3.argument as NumberNode).value).toBe('3');
    });

    it('quy tắc chuẩn Casio: Lũy thừa có độ ưu tiên cao hơn dấu trừ âm (-3^2 = -(3^2))', () => {
      const ast = parseExpression('-3^2') as UnaryOpNode;

      expect(ast.type).toBe('UnaryOp');
      expect(ast.op).toBe('-');

      const pow = ast.argument as BinaryOpNode;
      expect(pow.type).toBe('BinaryOp');
      expect(pow.op).toBe('^');
      expect((pow.left as NumberNode).value).toBe('3');
      expect((pow.right as NumberNode).value).toBe('2');
    });

    it('dấu trừ trong ngoặc được bình phương: (-3)^2', () => {
      const ast = parseExpression('(-3)^2') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('^');
      expect((ast.right as NumberNode).value).toBe('2');

      const paren = ast.left as ParenthesisNode;
      expect(paren.type).toBe('Parenthesis');

      const inner = paren.content as UnaryOpNode;
      expect(inner.type).toBe('UnaryOp');
      expect((inner.argument as NumberNode).value).toBe('3');
    });

    it('toán tử hậu tố ² có độ ưu tiên cao hơn dấu trừ âm: -3²', () => {
      const ast = parseExpression('-3²') as UnaryOpNode;

      expect(ast.type).toBe('UnaryOp');
      expect(ast.op).toBe('-');

      const sq = ast.argument as PostfixOpNode;
      expect(sq.type).toBe('PostfixOp');
      expect(sq.op).toBe('²');
      expect((sq.argument as NumberNode).value).toBe('3');
    });
  });

  describe('Độ ưu tiên lũy thừa kết hợp phải (Right-Associativity)', () => {
    it('lũy thừa tầng 2^3^4 được nhóm thành 2^(3^4)', () => {
      const ast = parseExpression('2^3^4') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('^');
      expect((ast.left as NumberNode).value).toBe('2');

      const innerPow = ast.right as BinaryOpNode;
      expect(innerPow.type).toBe('BinaryOp');
      expect(innerPow.op).toBe('^');
      expect((innerPow.left as NumberNode).value).toBe('3');
      expect((innerPow.right as NumberNode).value).toBe('4');
    });

    it('lũy thừa với số mũ âm: 2^-3', () => {
      const ast = parseExpression('2^-3') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('^');
      expect((ast.left as NumberNode).value).toBe('2');

      const exp = ast.right as UnaryOpNode;
      expect(exp.type).toBe('UnaryOp');
      expect(exp.op).toBe('-');
      expect((exp.argument as NumberNode).value).toBe('3');
    });
  });

  describe('Phép nhân ngầm định chuẩn Casio ClassWiz (Implicit Multiplication)', () => {
    it('Type A: Nhân ngầm trước hằng số π và biến (2π, 3x)', () => {
      const ast1 = parseExpression('2π') as ImplicitMulNode;
      expect(ast1.type).toBe('ImplicitMul');
      expect(ast1.mulType).toBe('TYPE_A');
      expect((ast1.left as NumberNode).value).toBe('2');
      expect((ast1.right as ConstantNode).name).toBe('π');

      const ast2 = parseExpression('3x') as ImplicitMulNode;
      expect(ast2.type).toBe('ImplicitMul');
      expect(ast2.mulType).toBe('TYPE_A');
      expect((ast2.left as NumberNode).value).toBe('3');
      expect((ast2.right as VariableNode).name).toBe('x');
    });

    it('Type A: Nhân ngầm trước hàm toán học (2sin(30), 3√(4))', () => {
      const ast = parseExpression('2sin(30)') as ImplicitMulNode;
      expect(ast.type).toBe('ImplicitMul');
      expect(ast.mulType).toBe('TYPE_A');
      expect((ast.left as NumberNode).value).toBe('2');

      const func = ast.right as FunctionCallNode;
      expect(func.type).toBe('FunctionCall');
      expect(func.name).toBe('sin');
      expect((func.args[0] as NumberNode).value).toBe('30');
    });

    it('Type A có độ ưu tiên cao hơn phép chia: 1 ÷ 2x = 1 ÷ (2x)', () => {
      const ast = parseExpression('1 ÷ 2x') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('÷');
      expect((ast.left as NumberNode).value).toBe('1');

      const right = ast.right as ImplicitMulNode;
      expect(right.type).toBe('ImplicitMul');
      expect(right.mulType).toBe('TYPE_A');
      expect((right.left as NumberNode).value).toBe('2');
      expect((right.right as VariableNode).name).toBe('x');
    });

    it('Type B: Nhân ngầm trước dấu ngoặc đơn mở 2(1+2) và (2+3)(4+5)', () => {
      const ast = parseExpression('2(1+2)') as ImplicitMulNode;
      expect(ast.type).toBe('ImplicitMul');
      expect(ast.mulType).toBe('TYPE_B');
      expect((ast.left as NumberNode).value).toBe('2');
      expect(ast.right.type).toBe('Parenthesis');
    });

    it('Hiện tượng chuẩn Casio ClassWiz: 6 ÷ 2(1+2) nhóm thành 6 ÷ [2(1+2)]', () => {
      const ast = parseExpression('6 ÷ 2(1+2)') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('÷');
      expect((ast.left as NumberNode).value).toBe('6');

      const right = ast.right as ImplicitMulNode;
      expect(right.type).toBe('ImplicitMul');
      expect(right.mulType).toBe('TYPE_B');
      expect((right.left as NumberNode).value).toBe('2');
      expect(right.right.type).toBe('Parenthesis');
    });

    it('Phân biệt với phép nhân tường minh: 6 ÷ 2 × (1+2) nhóm thành (6 ÷ 2) × (1+2)', () => {
      const ast = parseExpression('6 ÷ 2 × (1+2)') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('×');

      const left = ast.left as BinaryOpNode;
      expect(left.type).toBe('BinaryOp');
      expect(left.op).toBe('÷');
      expect((left.left as NumberNode).value).toBe('6');
      expect((left.right as NumberNode).value).toBe('2');

      expect(ast.right.type).toBe('Parenthesis');
    });
  });

  describe('Toán tử hậu tố, Phân số và Tổ hợp / Chỉnh hợp', () => {
    it('hỗ trợ các toán tử hậu tố !, ², ³, ⁻¹, %, °', () => {
      const ast1 = parseExpression('5!') as PostfixOpNode;
      expect(ast1.type).toBe('PostfixOp');
      expect(ast1.op).toBe('!');

      const ast2 = parseExpression('3² + 4⁻¹') as BinaryOpNode;
      expect(ast2.type).toBe('BinaryOp');
      expect(ast2.op).toBe('+');
      expect((ast2.left as PostfixOpNode).op).toBe('²');
      expect((ast2.right as PostfixOpNode).op).toBe('⁻¹');
    });

    it('phân số với toán tử ⌟ (1⌟2 + 3⌟4)', () => {
      const ast = parseExpression('1⌟2 + 3⌟4') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('+');

      const f1 = ast.left as FractionNode;
      expect(f1.type).toBe('Fraction');
      expect((f1.numerator as NumberNode).value).toBe('1');
      expect((f1.denominator as NumberNode).value).toBe('2');

      const f2 = ast.right as FractionNode;
      expect(f2.type).toBe('Fraction');
      expect((f2.numerator as NumberNode).value).toBe('3');
      expect((f2.denominator as NumberNode).value).toBe('4');
    });

    it('chỉnh hợp P và tổ hợp C: 5P2 + 6C3', () => {
      const ast = parseExpression('5P2 + 6C3') as BinaryOpNode;

      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('+');

      const pNode = ast.left as BinaryOpNode;
      expect(pNode.op).toBe('P');
      expect((pNode.left as NumberNode).value).toBe('5');
      expect((pNode.right as NumberNode).value).toBe('2');

      const cNode = ast.right as BinaryOpNode;
      expect(cNode.op).toBe('C');
      expect((cNode.left as NumberNode).value).toBe('6');
      expect((cNode.right as NumberNode).value).toBe('3');
    });
  });

  describe('Tự động đóng ngoặc ở cuối biểu thức (Casio Trailing Parenthesis Auto-Close)', () => {
    it('tự động đóng hàm sin(30 khi kết thúc biểu thức', () => {
      const ast = parseExpression('sin(30') as FunctionCallNode;

      expect(ast.type).toBe('FunctionCall');
      expect(ast.name).toBe('sin');
      expect((ast.args[0] as NumberNode).value).toBe('30');
    });

    it('tự động đóng nhiều tầng ngoặc ở cuối biểu thức: ((2+3)×(4+5', () => {
      const ast = parseExpression('((2+3)×(4+5') as ParenthesisNode;

      expect(ast.type).toBe('Parenthesis');
      const inner = ast.content as BinaryOpNode;
      expect(inner.type).toBe('BinaryOp');
      expect(inner.op).toBe('×');
    });
  });

  describe('Xử lý lỗi cú pháp có cấu trúc (Syntax ERROR)', () => {
    it('báo lỗi khi biểu thức rỗng', () => {
      expect(() => parseExpression('')).toThrow(CasioSyntaxError);
      try {
        parseExpression('   ');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('EMPTY_EXPRESSION');
      }
    });

    it('báo lỗi khi dấu ngoặc đơn rỗng ()', () => {
      try {
        parseExpression('2 + ()');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('EMPTY_PARENTHESES');
        expect(err.position).toBe(4);
      }
    });

    it('báo lỗi khi hàm không có đối số: sin()', () => {
      try {
        parseExpression('sin()');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('EMPTY_PARENTHESES');
        expect(err.position).toBe(0);
      }
    });

    it('báo lỗi khi thừa dấu đóng ngoặc: 2 + 3)', () => {
      try {
        parseExpression('2 + 3)');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('UNMATCHED_RPAREN');
        expect(err.position).toBe(5);
      }
    });

    it('báo lỗi khi toán tử hai ngôi đứng đầu biểu thức: × 5', () => {
      try {
        parseExpression('× 5');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('INVALID_OPERATOR_SEQUENCE');
        expect(err.position).toBe(0);
      }
    });

    it('báo lỗi khi biểu thức kết thúc đột ngột thiếu toán hạng: 5 +', () => {
      try {
        parseExpression('5 +');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('UNEXPECTED_EOF');
      }
    });

    it('báo lỗi khi hai số đứng liền nhau không có toán tử: 2 3', () => {
      try {
        parseExpression('2 3');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('UNEXPECTED_TOKEN');
        expect(err.position).toBe(2);
      }
    });

    it('báo lỗi khi hai toán tử hai ngôi đứng liền nhau: 2 + × 3', () => {
      try {
        parseExpression('2 + × 3');
      } catch (e) {
        const err = e as CasioSyntaxError;
        expect(err.code).toBe('INVALID_OPERATOR_SEQUENCE');
        expect(err.position).toBe(4);
      }
    });
  });

  describe('Trường hợp biên và hàm nhiều tham số (Edge Cases & Multi-argument Functions)', () => {
    it('hàm logarit 2 tham số: log(2, 8)', () => {
      const ast = parseExpression('log(2, 8)') as FunctionCallNode;

      expect(ast.type).toBe('FunctionCall');
      expect(ast.name).toBe('log');
      expect(ast.args.length).toBe(2);
      expect((ast.args[0] as NumberNode).value).toBe('2');
      expect((ast.args[1] as NumberNode).value).toBe('8');
    });

    it('hàm căn bậc n: root(3, 27)', () => {
      const ast = parseExpression('root(3, 27)') as FunctionCallNode;

      expect(ast.type).toBe('FunctionCall');
      expect(ast.name).toBe('root');
      expect(ast.args.length).toBe(2);
      expect((ast.args[0] as NumberNode).value).toBe('3');
      expect((ast.args[1] as NumberNode).value).toBe('27');
    });

    it('biến nhớ Ans trong phép nhân ngầm: 2Ans và Ans(2+3)', () => {
      const ast1 = parseExpression('2Ans') as ImplicitMulNode;
      expect(ast1.type).toBe('ImplicitMul');
      expect(ast1.mulType).toBe('TYPE_A');
      expect((ast1.left as NumberNode).value).toBe('2');
      expect((ast1.right as VariableNode).name).toBe('Ans');

      const ast2 = parseExpression('Ans(2+3)') as ImplicitMulNode;
      expect(ast2.type).toBe('ImplicitMul');
      expect(ast2.mulType).toBe('TYPE_B');
      expect((ast2.left as VariableNode).name).toBe('Ans');
      expect(ast2.right.type).toBe('Parenthesis');
    });

    it('biểu thức lồng nhau nhiều cấp: 2(3+4(5+6))', () => {
      const ast = parseExpression('2(3+4(5+6))') as ImplicitMulNode;
      expect(ast.type).toBe('ImplicitMul');
      expect(ast.mulType).toBe('TYPE_B');

      const p1 = ast.right as ParenthesisNode;
      const innerAdd = p1.content as BinaryOpNode;
      expect(innerAdd.op).toBe('+');
      expect((innerAdd.left as NumberNode).value).toBe('3');

      const innerMul = innerAdd.right as ImplicitMulNode;
      expect(innerMul.type).toBe('ImplicitMul');
      expect(innerMul.mulType).toBe('TYPE_B');
      expect((innerMul.left as NumberNode).value).toBe('4');
    });

    it('phép cộng với phần trăm: 100 + 10%', () => {
      const ast = parseExpression('100 + 10%') as BinaryOpNode;
      expect(ast.type).toBe('BinaryOp');
      expect(ast.op).toBe('+');
      expect((ast.left as NumberNode).value).toBe('100');

      const pct = ast.right as PostfixOpNode;
      expect(pct.type).toBe('PostfixOp');
      expect(pct.op).toBe('%');
      expect((pct.argument as NumberNode).value).toBe('10');
    });

    it('tự động đóng 3 tầng ngoặc ở cuối: (1 + (2 * (3 + 4', () => {
      const ast = parseExpression('(1 + (2 * (3 + 4') as ParenthesisNode;
      expect(ast.type).toBe('Parenthesis');
    });
  });
});

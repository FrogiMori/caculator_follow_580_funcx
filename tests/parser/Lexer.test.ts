import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/parser/lexer';
import { CasioSyntaxError } from '../../src/parser/errors';

describe('Lexer (Bộ phân tích từ vựng Casio fx-580VN X)', () => {
  it('phân tích chính xác số nguyên và số thập phân', () => {
    const lexer = new Lexer('123 45.67 .89 0');
    const tokens = lexer.tokenize();

    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: 'NUMBER', value: '123' },
      { type: 'NUMBER', value: '45.67' },
      { type: 'NUMBER', value: '.89' },
      { type: 'NUMBER', value: '0' },
      { type: 'EOF', value: '' }
    ]);
  });

  it('phân tích ký pháp khoa học ×10^ và *10^', () => {
    const lexer = new Lexer('3×10^8 2.5×10^-4 ×10^3 1.5e6');
    const tokens = lexer.tokenize();

    expect(tokens.map((t) => t.type)).toEqual([
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'EOF'
    ]);
    expect(tokens[0].value).toBe('3×10^8');
    expect(tokens[1].value).toBe('2.5×10^-4');
    expect(tokens[2].value).toBe('×10^3');
    expect(tokens[3].value).toBe('1.5e6');
  });

  it('báo lỗi khi số chứa nhiều hơn một dấu chấm thập phân', () => {
    expect(() => {
      new Lexer('1.2.3').tokenize();
    }).toThrow(CasioSyntaxError);

    try {
      new Lexer('1.2.3').tokenize();
    } catch (e) {
      const err = e as CasioSyntaxError;
      expect(err.code).toBe('INVALID_NUMBER');
      expect(err.position).toBe(3);
    }
  });

  it('phân tích đúng các toán tử số học ASCII và Unicode', () => {
    const lexer = new Lexer('+ - − × * ÷ / ^ ⌟');
    const tokens = lexer.tokenize();

    expect(tokens.map((t) => t.type)).toEqual([
      'PLUS',
      'MINUS',
      'MINUS',
      'MULTIPLY',
      'MULTIPLY',
      'DIVIDE',
      'DIVIDE',
      'POWER',
      'FRAC',
      'EOF'
    ]);
  });

  it('phân tích đúng các hằng số và biến nhớ Casio', () => {
    const lexer = new Lexer('π e Ans A B C x y M');
    const tokens = lexer.tokenize();

    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: 'CONSTANT', value: 'π' },
      { type: 'CONSTANT', value: 'e' },
      { type: 'VARIABLE', value: 'Ans' },
      { type: 'VARIABLE', value: 'A' },
      { type: 'VARIABLE', value: 'B' },
      { type: 'VARIABLE', value: 'C' },
      { type: 'VARIABLE', value: 'x' },
      { type: 'VARIABLE', value: 'Y' },
      { type: 'VARIABLE', value: 'M' },
      { type: 'EOF', value: '' }
    ]);
  });

  it('phân biệt đúng giữa biến C và tổ hợp C (nCr)', () => {
    // 5C2: C là toán tử tổ hợp
    const lexer1 = new Lexer('5C2');
    const tokens1 = lexer1.tokenize();
    expect(tokens1.map((t) => t.type)).toEqual(['NUMBER', 'NCR', 'NUMBER', 'EOF']);

    // A + C: C là biến nhớ
    const lexer2 = new Lexer('A + C');
    const tokens2 = lexer2.tokenize();
    expect(tokens2.map((t) => t.type)).toEqual(['VARIABLE', 'PLUS', 'VARIABLE', 'EOF']);
  });

  it('phân biệt đúng giữa biến P và chỉnh hợp P (nPr)', () => {
    const lexer = new Lexer('10P3');
    const tokens = lexer.tokenize();
    expect(tokens.map((t) => t.type)).toEqual(['NUMBER', 'NPR', 'NUMBER', 'EOF']);
  });

  it('phân tích các hàm khoa học: sin, cos, tan, sin⁻¹, ln, log, √, abs', () => {
    const lexer = new Lexer('sin(30) + cos⁻¹(0.5) + √(16) + ln(e) + log(100)');
    const tokens = lexer.tokenize();

    const funcTokens = tokens.filter((t) => t.type === 'FUNCTION');
    expect(funcTokens.map((t) => t.value)).toEqual(['sin', 'cos⁻¹', '√', 'ln', 'log']);
  });

  it('phân tích các toán tử hậu tố: !, ², ³, ⁻¹, %, °', () => {
    const lexer = new Lexer('5! + 3² - 2³ + 4⁻¹ + 50% + 45°');
    const tokens = lexer.tokenize();

    expect(tokens.map((t) => t.type)).toEqual([
      'NUMBER', 'FACTORIAL',
      'PLUS',
      'NUMBER', 'SQUARE',
      'MINUS',
      'NUMBER', 'CUBE',
      'PLUS',
      'NUMBER', 'RECIPROCAL',
      'PLUS',
      'NUMBER', 'PERCENT',
      'PLUS',
      'NUMBER', 'DEGREE',
      'EOF'
    ]);
  });

  it('báo lỗi khi gặp ký tự lạ không xác định', () => {
    expect(() => {
      new Lexer('2 + @ 3').tokenize();
    }).toThrow(CasioSyntaxError);

    try {
      new Lexer('2 + @ 3').tokenize();
    } catch (e) {
      const err = e as CasioSyntaxError;
      expect(err.code).toBe('UNEXPECTED_TOKEN');
      expect(err.position).toBe(4);
    }
  });
});

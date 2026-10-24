# Tài Liệu Kỹ Thuật API: Table, Base-N, Statistics Modes (T12)
**Thiết bị mục tiêu:** Casio fx-580VN X (ClassWiz Emulator Ver.2.00)  
**Phạm vi triển khai:** Mode 9 (Table), Mode 3 (Base-N), Mode 6 (Statistics)

---

## 1. Mode 9: Table of Values (`src/modes/table/`)
**Bằng chứng nguồn:** `FEAT-MOD-09` (Phím `[MENU]` $\rightarrow$ `9`)

### 1.1. Đặc Tả Hành Vi & Giới Hạn
- **Hỗ trợ 2 dạng bảng (Table Type):**
  - `F_ONLY`: Chỉ lập bảng cho hàm $f(x)$ đơn nhất. Giới hạn: **Tối đa 45 dòng**.
  - `F_AND_G`: Lập bảng đồng thời cho cả $f(x)$ và $g(x)$. Giới hạn: **Tối đa 30 dòng**.
- **Tham số dải giá trị (Table Range):**
  - `start`: Giá trị bắt đầu của $x$.
  - `end`: Giá trị kết thúc của $x$ ($end \ge start$, nếu $end < start \rightarrow$ `Math ERROR`).
  - `step`: Bước nhảy giữa các điểm ($step > 0$, nếu $step \le 0 \rightarrow$ `Math ERROR`).
  - Số dòng: $N = \lfloor\frac{end - start}{step} + 10^{-9}\rfloor + 1$. Nếu $N > \text{maxRows} \rightarrow$ ném `Math ERROR` ("Số dòng vượt quá giới hạn").
- **Thuật toán triệt tiêu sai số trôi nổi (Float Accumulation Drift):**
  - Các điểm $x_i$ được tính bằng `Decimal`: $x_i = \text{start} + i \times \text{step}$. Nhờ đó các bước nhảy số thập phân như $0.2, 0.1$ cho kết quả chính xác tuyệt đối (`0, 0.2, 0.4, 0.6, 0.8, 1` thay vì `0.6000000000000001`).
- **Xử lý lỗi cục bộ từng ô (Cell-level Error Handling):**
  - Nếu tại điểm $x_k$, hàm gặp lỗi (chia cho 0 $1/0$, logarit số âm, tan ngoài miền), ô hiển thị chữ `"ERROR"` và cờ `isError = true` mà **không làm crash toàn bộ bảng giá trị** (chuẩn 100% Casio fx-580VN X).

### 1.2. API
```typescript
export interface TableRange {
  start: number;
  end: number;
  step: number;
}

export interface TableCell {
  value: CalculationResult | null;
  displayText: string;
  isError: boolean;
}

export interface TableRow {
  rowNumber: number;
  x: TableCell;
  f?: TableCell;
  g?: TableCell;
}

export class TableMode {
  public setTableType(type: 'F_ONLY' | 'F_AND_G'): void;
  public setFunctionF(expr: string): void;
  public setFunctionG(expr: string): void;
  public setRange(range: TableRange): void;
  public generate(): TableResult;
  public getRows(): TableRow[];
}
```

---

## 2. Mode 3: Base-N (`src/modes/baseN/`)
**Bằng chứng nguồn:** `FEAT-MOD-03` (Phím `[3]` `BASE`, nhãn `DEC, HEX, BIN, OCT`)

### 2.1. Đặc Tả Kiến Trúc 32-bit & Cơ Số
- **Phạm vi số nguyên:** Hệ đếm sử dụng số nguyên bù 2 (Two's Complement) độ dài **32-bit**:
  - Dải giá trị có dấu: $-2^{31}$ đến $2^{31} - 1$ (`-2,147,483,648` đến `2,147,483,647`).
  - Dải không dấu (bit pattern): `0` đến `0xFFFFFFFF` (`4,294,967,295`).
- **4 Hệ cơ số:**
  - `DEC` (Thập phân): Ký tự `0-9`, dấu âm `-`.
  - `HEX` (Thập lục phân): Ký tự `0-9, A-F` (tối đa 8 ký tự). Số âm biểu diễn bằng bù 2 (ví dụ `-1` $\rightarrow$ `FFFFFFFF`).
  - `BIN` (Nhị phân): Ký tự `0, 1` (tối đa 32 ký tự). Số âm có các bit 1 dẫn đầu (ví dụ `-1` $\rightarrow$ 32 bit 1).
  - `OCT` (Bát phân): Ký tự `0-7` (tối đa 11 ký tự).
- **Quy tắc kiểm tra cú pháp & Giới hạn:**
  - Ký tự không thuộc bảng chữ số của cơ số tương ứng (ví dụ gõ `2` trong BIN, hoặc `8` trong OCT, hoặc `G` trong HEX) $\rightarrow$ `Math ERROR` / `Syntax ERROR`.
  - Kết quả phép tính vượt ra ngoài phạm vi 32-bit $\rightarrow$ `Math ERROR` (`OVERFLOW`).
- **Các phép toán được hỗ trợ:**
  - Đại số: Cộng (`+`), Trừ (`-`), Nhân (`×`), Chia nguyên (`÷` - làm tròn về 0, chia cho 0 $\rightarrow$ `Math ERROR`).
  - Logic / Bitwise:
    - `and`: Bitwise AND
    - `or`: Bitwise OR
    - `xor`: Bitwise XOR
    - `xnor`: Bitwise XNOR (`not (a xor b)`)
    - `not`: Bitwise NOT (đảo 32 bit)
    - `neg`: Đảo dấu số học (Two's complement arithmetic negation `-a`).

### 2.2. API
```typescript
export type NumberBase = 'DEC' | 'HEX' | 'BIN' | 'OCT';

export class BaseNMode {
  public getBase(): NumberBase;
  public setBase(base: NumberBase): BaseNResult | null; // Chuyển đổi cơ số tức thì
  public parse(str: string, base?: NumberBase): bigint;
  public format(val: bigint, base?: NumberBase): string;
  public evaluateBinary(op: '+' | '-' | '*' | '/' | 'and' | 'or' | 'xor' | 'xnor', a: string | bigint, b: string | bigint): BaseNResult;
  public evaluateUnary(op: 'not' | 'neg', a: string | bigint): BaseNResult;
  public setValue(val: bigint | string): BaseNResult;
}
```

---

## 3. Mode 6: Statistics (`src/modes/statistics/`)
**Bằng chứng nguồn:** `FEAT-MOD-06` (Phím `[1]` `STAT`)

### 3.1. Phân Loại Sub-Mode & Công Thức Chuẩn Casio ClassWiz
Hỗ trợ 2 phân hệ thống kê cốt lõi đã được kiểm chứng đầy đủ:

#### A. 1-Variable Statistics (`1-Var`)
- Dữ liệu đầu vào: Danh sách điểm $(x_i, f_i)$ với tần số $f_i \ge 1$.
- Công thức thống kê:
  - Cỡ mẫu: $n = \sum f_i$
  - Tổng các giá trị: $\sum x = \sum f_i x_i$
  - Tổng bình phương: $\sum x^2 = \sum f_i x_i^2$
  - Giá trị trung bình: $\bar{x} = \frac{\sum x}{n}$
  - Phương sai tổng thể: $\sigma_x^2 = \frac{\sum (x_i - \bar{x})^2}{n} = \frac{\sum x^2 - n \bar{x}^2}{n}$
  - Độ lệch chuẩn tổng thể: $\sigma_x = \sqrt{\sigma_x^2}$
  - Phương sai mẫu: $s_x^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1}$ (chỉ xác định khi $n \ge 2$; khi $n < 2$ trả về `null` hoặc báo lỗi khi yêu cầu)
  - Độ lệch chuẩn mẫu: $s_x = \sqrt{s_x^2}$
  - Tóm tắt 5 số (Five-Number Summary):
    - $\min(x)$, $\max(x)$
    - Trung vị $\text{Med}$: nếu $n = 2m+1 \rightarrow x_{(m+1)}$; nếu $n = 2m \rightarrow \frac{x_{(m)} + x_{(m+1)}}{2}$.
    - Tứ phân vị $Q_1, Q_3$: Khi $n$ lẻ, phần tử trung vị bị loại khỏi cả 2 nửa dữ liệu (chuẩn Casio ClassWiz).

#### B. 2-Variable Statistics & Linear Regression (`y = a + bx`)
- Dữ liệu đầu vào: Cặp $(x_i, y_i, f_i)$.
- Công thức thống kê & hồi quy:
  - Các thống kê đơn biến riêng cho $x$ và $y$: $n, \sum x, \sum x^2, \bar{x}, \sigma_x, s_x, \sum y, \sum y^2, \bar{y}, \sigma_y, s_y$.
  - Tổng tích chéo: $\sum xy = \sum f_i x_i y_i$.
  - Tổng độ lệch bình phương:
    $$S_{xx} = \sum x^2 - n \bar{x}^2, \quad S_{yy} = \sum y^2 - n \bar{y}^2, \quad S_{xy} = \sum xy - n \bar{x}\bar{y}$$
  - Hệ số góc (Slope): $b = \frac{S_{xy}}{S_{xx}}$ (nếu $S_{xx} = 0 \rightarrow$ ném `Math ERROR` vì đường thẳng đứng).
  - Hệ số chặn (Intercept): $a = \bar{y} - b \bar{x}$.
  - Hệ số tương quan Pearson: $r = \frac{S_{xy}}{\sqrt{S_{xx} S_{yy}}}$ ($r \in [-1, 1]$).
  - Hàm dự đoán:
    - $\hat{y}(x) = a + bx$
    - $\hat{x}(y) = \frac{y - a}{b}$ (báo lỗi nếu $b = 0$).

### 3.2. API
```typescript
export class StatisticsMode {
  public setSubMode(mode: '1-VAR' | '2-VAR'): void;
  public addDataPoint1Var(x: number, freq?: number): void;
  public addDataPoint2Var(x: number, y: number, freq?: number): void;
  public calculate1Var(): StatResult1Var;
  public calculate2Var(): StatResult2Var;
  public estimateY(x: number): number;
  public estimateX(y: number): number;
  public clear(): void;
}
```

---

## 4. Tích Hợp Vào InputDispatcher
Cả 3 mode được gắn kết trực tiếp vào [`src/input/InputDispatcher.ts`](file:///Users/nam/rea_casio580vnx/src/input/InputDispatcher.ts):
- `dispatcher.getTableMode()`
- `dispatcher.getBaseNMode()`
- `dispatcher.getStatisticsMode()`
- Chuyển mode thông qua `dispatcher.setMode('TABLE' | 'BASE-N' | 'STATISTICS')`.

---

## 5. Danh Sách Mode / Tính Năng Chưa Có Bằng Chứng Đầy Đủ (Đánh Dấu Bị Chặn / TODO)
Tuân thủ nguyên tắc không triển khai theo suy đoán:
1. **[BỊ CHẶN] Mode 7: Distribution (Phân phối xác suất):** Cần bằng chứng giải mã bảng hàm số mật độ và tích phân xấp xỉ (`NormalPD`, `NormalCD`, `InvNorm`, `BinomialPD`).
2. **[BỊ CHẶN] Mode 8: Spreadsheet (Bảng tính mini):** Cần bằng chứng cấu trúc ô nhớ 45 hàng $\times$ 5 cột và bộ giải mã công thức tham chiếu ô (`=A1+B1`).
3. **[BỊ CHẶN] Mode B: Inequality & Mode C: Ratio:** Tiếp tục giữ trạng thái chờ dữ liệu chi tiết từ emulator ROM.
4. **[TODO] Các dạng hồi quy phi tuyến trong Mode 6 (Quadratic, Logarithmic, Exponential, Power):** Tạm thời chưa triển khai cho đến khi có ca test đối soát trực tiếp từ ClassWiz Emulator.

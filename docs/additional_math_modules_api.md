# Tài Liệu API Các Module Toán Học Bổ Sung (Casio fx-580VN X)

**Mã tài liệu:** `docs/additional_math_modules_api.md`  
**Dự án:** Trình giả lập Web App Casio fx-580VN X  
**Module:** `src/engine/` (Mở rộng T10)  
**Phiên bản:** Ver 1.0.0 (Nhiệm vụ T10)  
**Căn cứ thiết kế:** `docs/feature_inventory.md` (`FEAT-MTH-03`, `FEAT-MTH-05`, `FEAT-MTH-06`, `FEAT-MTH-07`, `FEAT-MTH-09`, `FEAT-MOD-02`).

---

## 1. Nguyên Tắc Thiết Kế và Phân Tầng Module

Tuân thủ nghiêm ngặt yêu cầu kiến trúc:
- **Tận dụng Core Evaluator:** Không xây dựng evaluator thứ hai. Toàn bộ các module tính toán con (`trig.ts`, `logarithm.ts`, `complex.ts`) đóng vai trò là thư viện tính toán chuẩn hóa (Pure Math Functions), được điều phối duy nhất thông qua `CoreMathEngine.evaluate()` trong [`src/engine/evaluator.ts`](file:///Users/nam/rea_casio580vnx/src/engine/evaluator.ts).
- **Tính toán chính xác:** Không sử dụng số thực nhị phân tùy tiện; các giá trị hữu tỉ được giữ nguyên dưới dạng `Fraction` (BigInt), số thập phân dùng `Decimal` (BCD 20 chữ số).
- **Quy chuẩn Casio:** Không suy đoán hành vi không có căn cứ. Tất cả các trường hợp biên tuân thủ đúng phản hồi thực tế của Casio fx-580VN X (`Math ERROR` khi vi phạm miền xác định, làm sạch sai số điểm 0 của hàm lượng giác).

---

## 2. Module Lượng Giác & Đơn Vị Góc (`src/engine/trig.ts`)

**Căn cứ:** `FEAT-MTH-06`, `FEAT-MTH-07`, `FEAT-MTH-09`.

### 2.1. Đơn Vị Đo Góc (`AngleUnit`)
```typescript
export type AngleUnit = 'DEG' | 'RAD' | 'GRA';
```
- `DEG`: Degree (Độ, $360^\circ$ một vòng). Mặc định sau Reset.
- `RAD`: Radian ($2\pi$ một vòng).
- `GRA`: Gradian (400 grad một vòng, $100\text{ gra} = 90^\circ$).

### 2.2. Hàm Tính Toán Lượng Giác (`evalTrig`)
```typescript
export function evalTrig(
  fnName: string,
  args: CalculationResult[],
  angleUnit: AngleUnit
): CalculationResult;
```
- **Các hàm được hỗ trợ:** `sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹` (hỗ trợ cả alias: `arcsin`, `arccos`, `arctan`).
- **Quy tắc làm sạch sai số số thực:** Các giá trị lượng giác có $|x| < 10^{-14}$ sau khi tính (ví dụ $\sin(180^\circ)$, $\cos(90^\circ)$) được tự động gán về $0$ chuẩn xác, tránh lỗi $1.22 \times 10^{-16}$ của JavaScript.
- **Xử lý vi phạm miền xác định (`MathError`):**
  - $\tan(x)$ tại các góc $90^\circ, 270^\circ$ hoặc $(2k+1)\frac{\pi}{2} \rightarrow$ ném `MathError('MATH_ERROR')`.
  - $\sin^{-1}(x)$, $\cos^{-1}(x)$ khi $|x| > 1 \rightarrow$ ném `MathError('MATH_ERROR')`.

### 2.3. Chuyển Đổi Độ - Phút - Giây (DMS)
```typescript
export function dmsToDecimalDegrees(d: number, m: number, s: number): number;
```
- Công thức: $D + \frac{M}{60} + \frac{S}{3600}$.

---

## 3. Module Logarit & Hàm Mũ Tự Nhiên (`src/engine/logarithm.ts`)

**Căn cứ:** `FEAT-MTH-05`.

### 3.1. Hàm Tính Toán Logarit (`evalLogarithm`)
```typescript
export function evalLogarithm(
  fnName: string,
  args: CalculationResult[]
): CalculationResult;
```
- **`ln(x)`:** Logarit tự nhiên cơ số $e$. Miền xác định: $x > 0$.
  - $\ln(e) = 1$, $\ln(1) = 0$.
  - $x \le 0 \rightarrow$ ném `MathError('MATH_ERROR')`.
- **`log(x)` (1 đối số):** Logarit thập phân cơ số 10. Miền xác định: $x > 0$.
  - $\log(100) = 2$, $\log(10) = 1$.
  - $x \le 0 \rightarrow$ ném `MathError('MATH_ERROR')`.
- **`log(a, b)` (2 đối số):** Logarit cơ số $a$ của $b$, công thức $\frac{\ln(b)}{\ln(a)}$.
  - Cơ số $a \le 0$ hoặc $a = 1 \rightarrow$ ném `MathError('MATH_ERROR')`.
  - Đối số $b \le 0 \rightarrow$ ném `MathError('MATH_ERROR')`.
  - Ví dụ: $\log(2, 8) = 3$, $\log(2, 32) = 5$.
- **`e^(x)`:** Hàm mũ tự nhiên $\exp(x)$.
  - Tràn số vượt ngưỡng $10^{100} \rightarrow$ ném `MathError('OVERFLOW')`.

---

## 4. Module Số Phức (`src/engine/complex.ts`)

**Căn cứ:** `FEAT-MOD-02` (Mode 2: Complex).

### 4.1. Lớp `ComplexNumber`
Biểu diễn số phức $z = a + bi$:
```typescript
export class ComplexNumber {
  public readonly re: Decimal; // Phần thực
  public readonly im: Decimal; // Phần ảo

  constructor(re: Decimal, im: Decimal);
  public static fromReal(re: Decimal): ComplexNumber;
  public static fromPolar(r: Decimal, theta: Decimal, angleUnit: AngleUnit): ComplexNumber;

  public add(other: ComplexNumber): ComplexNumber;
  public sub(other: ComplexNumber): ComplexNumber;
  public mul(other: ComplexNumber): ComplexNumber;
  public div(other: ComplexNumber): ComplexNumber;

  public abs(): Decimal;                         // Mô-đun |z| = √(a² + b²)
  public arg(angleUnit: AngleUnit): Decimal;     // Argument pha theo đơn vị góc
  public conj(): ComplexNumber;                  // Số phức liên hợp a - bi
  public isReal(): boolean;                      // Kiểm tra b = 0

  public toString(angleUnit?: AngleUnit): string;       // Dạng đại số "a+bi"
  public toPolarString(angleUnit: AngleUnit): string;   // Dạng tọa độ cực "r∠θ"
}
```

### 4.2. Lớp `ComplexResult`
Bao đóng kết quả tính toán số phức hỗ trợ hai chế độ xem:
```typescript
export class ComplexResult {
  public readonly complex: ComplexNumber;
  public currentView: 'RECT' | 'POLAR'; // Chuyển đổi giữa a+bi và r∠θ
  public getDisplayText(angleUnit?: AngleUnit): string;
}
```

---

## 5. Rút Gọn Căn Thức Đại Số Tối Giản (`FEAT-MTH-03`)

Tích hợp trực tiếp trong `CoreMathEngine` khi đánh giá hàm căn bậc hai `√`:

### 5.1. Cấu Trúc `RadicalForm`
```typescript
export interface RadicalForm {
  coefficient: Fraction; // Hệ số k (luôn dương)
  radicand: bigint;      // Phần dưới căn m (square-free)
}
```

### 5.2. Thuật Toán Rút Gọn
- Với số nguyên dương $n$: Phân tích $n = k^2 \times m$ với $m$ không chứa ước là số chính phương lớn hơn 1.
- Nếu $m = 1$: Kết quả là số nguyên chính xác $\sqrt{n} = k$ (ví dụ: $\sqrt{4} = 2$, $\sqrt{16} = 4$).
- Nếu $k > 1$ và $m > 1$: Hiển thị dạng rút gọn `k√m` (ví dụ: $\sqrt{12} = 2\sqrt{3}$, $\sqrt{75} = 5\sqrt{3}$, $\sqrt{50} = 5\sqrt{2}$).
- Nếu $k = 1$ và $m > 1$: Hiển thị dạng `√m` (ví dụ: $\sqrt{2}$, $\sqrt{3}$).
- Chuyển đổi qua lại với số thập phân bằng phím `[S<=>D]`.

---

## 6. Mở Rộng `CoreMathEngine` & API Điều Khiển

Trong [`src/engine/evaluator.ts`](file:///Users/nam/rea_casio580vnx/src/engine/evaluator.ts):
- Thêm trường `angleUnit: AngleUnit` (mặc định `'DEG'`).
- Bổ sung các phương thức:
  - `setAngleUnit(unit: AngleUnit): void`
  - `getAngleUnit(): AngleUnit`
- Bổ sung cấu hình trong `EvaluationContext`:
  ```typescript
  export interface EvaluationContext {
    variables?: Map<string, CalculationResult>;
    ans?: CalculationResult;
    displayMode?: DisplayMode;
    fixSciDigits?: number;
    angleUnit?: AngleUnit;
  }
  ```
- Định tuyến tự động trong `evalFunctionCall`:
  - `sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹` $\rightarrow$ gọi `evalTrig`.
  - `ln`, `log`, `e^` $\rightarrow$ gọi `evalLogarithm`.
  - `√`, `sqrt` $\rightarrow$ xử lý số chính phương & `RadicalForm`.
  - `abs` $\rightarrow$ trị tuyệt đối.
  - `root` $\rightarrow$ căn bậc $n$.

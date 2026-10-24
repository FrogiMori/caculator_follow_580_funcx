# Tài Liệu Kỹ Thuật API & Đặc Tả: Equation, Matrix, Vector Modes (T11)
**Thiết bị mục tiêu:** Casio fx-580VN X (ClassWiz Emulator Ver.2.00)  
**Phạm vi:** Mode A (Equation/Func), Mode 4 (Matrix), Mode 5 (Vector)

---

## 1. Tổng Quan Kiến Trúc & Phân Định Module

Tuân thủ nghiêm ngặt nguyên tắc của T11:
1. **Không gộp thuật toán**: Mỗi loại phương trình (hệ tuyến tính, bậc 2, bậc 3, bậc 4) có thuật toán giải độc lập, phản ánh chuẩn xác quy trình toán học và hành vi hiển thị của Casio fx-580VN X.
2. **Không dùng số thực nhị phân trôi nổi cho các phép tính đại số**: Mọi phần tử ma trận, véc-tơ và hệ số hệ phương trình được lưu trữ và tính toán bằng `Fraction` (BigInt-based Exact Rational), ngăn chặn hoàn toàn hiện tượng suy biến ma trận sai do sai số trôi nổi (floating-point drift).
3. **Phân biệt rõ ràng lỗi**:
   - `Dimension ERROR`: Xảy ra khi kích thước ma trận/véc-tơ không tương thích trong phép nhân, cộng, trừ; hoặc lấy tích có hướng trên véc-tơ 2D; hoặc tính định thức/lũy thừa trên ma trận không vuông.
   - `Math ERROR`: Xảy ra khi nghịch đảo ma trận suy biến ($\det = 0$); hoặc chuẩn hóa véc-tơ không; hoặc tính góc với véc-tơ không; hoặc hệ số bậc cao nhất $a = 0$ trong phương trình.

---

## 2. Mode A: Equation / Function (`src/modes/equation/`)

### 2.1. Hệ Phương Trình Tuyến Tính (`linearSystem.ts`)
- **Phạm vi hỗ trợ:** Hệ bậc nhất 2, 3 và 4 ẩn ($2 \le n \le 4$).
- **Thuật toán:** Khử toàn phần Gauss-Jordan trên ma trận mở rộng $[A|b]$ với kiểu dữ liệu `Fraction`.
- **Phân loại nghiệm theo định lý Rouché–Capelli:**
  - $r(A) < r([A|b])$: Hệ mâu thuẫn $\rightarrow$ Trạng thái `NO_SOLUTION` ("No Solution").
  - $r(A) = r([A|b]) < n$: Hệ phụ thuộc $\rightarrow$ Trạng thái `INFINITE` ("Infinite Solutions").
  - $r(A) = r([A|b]) = n$: Hệ có nghiệm duy nhất $\rightarrow$ Trạng thái `UNIQUE` (trả về danh sách nghiệm $x, y, z, w$ kèm dạng phân số hoặc thập phân).

#### API:
```typescript
export function solveLinearSystem(
  unknowns: 2 | 3 | 4,
  coefficients: CoefficientInput[][],
  constants: CoefficientInput[]
): LinearSystemResult;

export interface LinearSystemResult {
  status: 'UNIQUE' | 'NO_SOLUTION' | 'INFINITE';
  solutions: { variable: string; value: CalculationResult }[];
  unknowns: 2 | 3 | 4;
  message?: string;
}
```

### 2.2. Phương Trình Đa Thức (`polynomial.ts`)
- **Bậc 2 ($ax^2 + bx + c = 0, a \ne 0$):**
  - Biệt thức $\Delta = b^2 - 4ac$.
  - Nghiệm: 2 nghiệm thực phân biệt ($\Delta > 0$), nghiệm kép ($\Delta = 0$), hoặc 2 nghiệm phức liên hợp $u \pm vi$ ($\Delta < 0$).
  - Điểm cực trị Parabol (Vertex): $x_v = -\frac{b}{2a}$, $y_v = c - \frac{b^2}{4a}$. Tự động phân loại `MINIMUM` ($a > 0$, label: "Min of y") hoặc `MAXIMUM` ($a < 0$, label: "Max of y").
- **Bậc 3 ($ax^3 + bx^2 + cx + d = 0, a \ne 0$):**
  - Chuyển về dạng chính tắc $t^3 + pt + q = 0$.
  - Phương pháp lượng giác Viète khi $\Delta < 0$ (3 nghiệm thực phân biệt).
  - Phương pháp đại số Cardano khi $\Delta > 0$ (1 nghiệm thực và 2 nghiệm phức liên hợp).
  - Nghiệm bội khi $\Delta = 0$.
  - Điểm cực trị địa phương (Local Extrema) thông qua đạo hàm $y' = 3ax^2 + 2bx + c = 0$. Phân loại cực đại/cực tiểu qua đạo hàm cấp hai $y'' = 6ax + 2b$.
- **Bậc 4 ($ax^4 + bx^3 + cx^2 + dx + e = 0, a \ne 0$):**
  - Trường hợp trùng phương ($b=0, d=0$): Phân rã trực tiếp bằng giải phương trình bậc hai phụ $u^2 + pu + r = 0$.
  - Trường hợp tổng quát: Phương pháp Ferrari phân rã thành tích của 2 tam thức bậc hai thông qua phương trình bậc ba bổ trợ (Resolvent cubic: $8m^3 + 8pm^2 + (2p^2 - 8r)m - q^2 = 0$). Tính toán đầy đủ cả 4 nghiệm thực hoặc phức.

#### API:
```typescript
export function solvePolynomial(
  degree: 2 | 3 | 4,
  coeffs: PolyCoeff[]
): PolynomialResult;

export interface PolynomialResult {
  degree: 2 | 3 | 4;
  roots: PolynomialRoot[];
  extrema?: ExtremumPoint[];
}
```

---

## 3. Mode 4: Matrix (`src/modes/matrix/`)

### 3.1. Kích Thước & Bộ Nhớ
- Kích thước hợp lệ: $m \times n$ với $1 \le m \le 4$ và $1 \le n \le 4$.
- Bộ nhớ ma trận xác minh theo Casio fx-580VN X:
  - `MatA`, `MatB`, `MatC`, `MatD`: 4 vùng nhớ ma trận do người dùng định nghĩa.
  - `MatAns`: Ma trận lưu kết quả của phép tính ma trận gần nhất.

### 3.2. Các Phép Toán Hỗ Trợ
| Phép toán | Ký hiệu Casio | Điều kiện kích thước | Xử lý lỗi |
| :--- | :--- | :--- | :--- |
| Cộng ma trận | `MatA + MatB` | Cùng kích thước $(m \times n)$ | `Dimension ERROR` |
| Trừ ma trận | `MatA - MatB` | Cùng kích thước $(m \times n)$ | `Dimension ERROR` |
| Nhân vô hướng | $k \times \text{MatA}$ | Mọi kích thước | Không lỗi |
| Nhân ma trận | `MatA × MatB` | Số cột $A$ = Số hàng $B$ ($m \times k$ với $k \times p$) | `Dimension ERROR` |
| Lũy thừa ma trận | $\text{MatA}^2, \text{MatA}^3$ | Ma trận vuông ($m = n$), số mũ 2 hoặc 3 | `Dimension ERROR` nếu không vuông |
| Ma trận chuyển vị | $\text{MatA}^T$ (`Trn`) | Chuyển $m \times n \rightarrow n \times m$ | Không lỗi |
| Định thức | $\det(\text{MatA})$ | Ma trận vuông ($m = n$) | `Dimension ERROR` nếu không vuông |
| Ma trận nghịch đảo | $\text{MatA}^{-1}$ | Ma trận vuông ($m = n$) và $\det \ne 0$ | `Dimension ERROR` nếu không vuông;<br>`Math ERROR` nếu ma trận suy biến ($\det = 0$) |

#### API:
```typescript
export class Matrix {
  public readonly rows: number;
  public readonly cols: number;
  public add(other: Matrix): Matrix;
  public sub(other: Matrix): Matrix;
  public mul(other: Matrix): Matrix;
  public mulScalar(k: MatrixValue): Matrix;
  public pow(exponent: 2 | 3): Matrix;
  public transpose(): Matrix;
  public det(): Decimal;
  public inv(): Matrix;
  public toArray(): number[][];
  public toStringArray(): string[][];
}

export class MatrixMode {
  public defineMatrix(id: MatrixId, rows: number, cols: number, initialData?: MatrixValue[][]): Matrix;
  public add(id1: MatrixId, id2: MatrixId): Matrix;
  public sub(id1: MatrixId, id2: MatrixId): Matrix;
  public mul(id1: MatrixId, id2: MatrixId): Matrix;
  public mulScalar(id: MatrixId, k: MatrixValue): Matrix;
  public pow(id: MatrixId, exponent: 2 | 3): Matrix;
  public transpose(id: MatrixId): Matrix;
  public det(id: MatrixId): Decimal;
  public inv(id: MatrixId): Matrix;
  public getMatrix(id: MatrixId): Matrix;
}
```

---

## 4. Mode 5: Vector (`src/modes/vector/`)

### 4.1. Kích Thước & Bộ Nhớ
- Kích thước hợp lệ: 2 chiều (2D) hoặc 3 chiều (3D).
- Bộ nhớ véc-tơ xác minh theo Casio fx-580VN X:
  - `VctA`, `VctB`, `VctC`, `VctD`: 4 vùng nhớ véc-tơ người dùng.
  - `VctAns`: Lưu kết quả phép tính véc-tơ gần nhất.

### 4.2. Các Phép Toán Hỗ Trợ
| Phép toán | Ký hiệu Casio | Quy tắc toán học & Điều kiện | Xử lý lỗi |
| :--- | :--- | :--- | :--- |
| Cộng véc-tơ | `VctA + VctB` | Cùng số chiều (2D+2D hoặc 3D+3D) | `Dimension ERROR` |
| Trừ véc-tơ | `VctA - VctB` | Cùng số chiều | `Dimension ERROR` |
| Nhân vô hướng | $k \times \text{VctA}$ | Mọi số chiều | Không lỗi |
| Tích vô hướng (Dot) | `VctA • VctB` | $u \cdot v = \sum u_i v_i$ | `Dimension ERROR` |
| Tích có hướng (Cross) | `VctA × VctB` | $u \times v = (u_1 v_2 - u_2 v_1, u_2 v_0 - u_0 v_2, u_0 v_1 - u_1 v_0)$ | `Dimension ERROR` nếu áp dụng trên 2D |
| Độ dài (Magnitude) | $\text{Abs}(\text{VctA})$ | $|u| = \sqrt{\sum u_i^2}$ | Không lỗi |
| Góc giữa 2 véc-tơ | $\text{Angle}(u, v)$ | $\theta = \arccos\left(\frac{u \cdot v}{\|u\| \cdot \|v\|}\right)$ theo DEG/RAD/GRA | `Dimension ERROR` nếu lệch chiều;<br>`Math ERROR` nếu có véc-tơ không |
| Véc-tơ đơn vị | $\text{UnitV}(u)$ | $\frac{u}{\|u\|}$ | `Math ERROR` nếu véc-tơ không |

#### API:
```typescript
export class Vector {
  public readonly dimension: 2 | 3;
  public add(other: Vector): Vector;
  public sub(other: Vector): Vector;
  public mulScalar(k: VectorValue): Vector;
  public dot(other: Vector): Decimal;
  public cross(other: Vector): Vector; // Throws DimensionError if dim != 3
  public magnitude(): Decimal;
  public angle(other: Vector, unit: AngleUnit): Decimal; // Throws MathError if zero vector
  public unitVector(): Vector; // Throws MathError if zero vector
  public toArray(): number[];
  public toStringArray(): string[];
}

export class VectorMode {
  public defineVector(id: VectorId, dimOrData: VectorDimension | VectorValue[], initialData?: VectorValue[]): Vector;
  public add(id1: VectorId, id2: VectorId): Vector;
  public sub(id1: VectorId, id2: VectorId): Vector;
  public mulScalar(id: VectorId, k: VectorValue): Vector;
  public dot(id1: VectorId, id2: VectorId): Decimal;
  public cross(id1: VectorId, id2: VectorId): Vector;
  public magnitude(id: VectorId): Decimal;
  public angle(id1: VectorId, id2: VectorId, unit?: AngleUnit): Decimal;
  public unitVector(id: VectorId): Vector;
  public getVector(id: VectorId): Vector;
}
```

---

## 5. Tích Hợp UI & Bộ Điều Phối Input (`InputDispatcher`)

- `InputDispatcher` quản lý trạng thái máy và tích hợp trực tiếp các mode thông qua:
  - `dispatcher.getEquationMode()`
  - `dispatcher.getMatrixMode()`
  - `dispatcher.getVectorMode()`
  - `dispatcher.setMode('EQUATION' | 'MATRIX' | 'VECTOR' | 'COMP')`
- Bắt lỗi chuẩn mực:
  - Bắt `DimensionError` $\rightarrow$ hiển thị `"Dimension ERROR"` trên màn hình máy tính (không bị gộp nhầm thành `Math ERROR` hay gây crash giao diện).
  - Bắt `MathError` $\rightarrow$ hiển thị `"Math ERROR"`.

---

## 6. Danh Mục Tính Năng Chưa Hoàn Thành / Cần Giữ Dưới Dạng TODO

Theo nguyên tắc "Không tự khẳng định mọi chức năng của máy gốc khi chưa có bằng chứng":
1. **[TODO] Bất phương trình (Inequation Mode - Mode B):** Cần reverse engineering bảng mã màn hình hiển thị dấu nghiệm ($a < x < b$, $x \le a, x \ge b$).
2. **[TODO] Mode UI Dialogs:** Giao diện nhiều bước nhập kích thước ban đầu (hỏi số chiều $m, n$, lưới nhập $a_{ij}$) hiện đang hoạt động thông qua Mode API; cần gắn component modal trực tiếp vào khung Canvas/DOM khi hoàn thiện màn hình đa dòng.
3. **[TODO] Parse inline token MatA/VctA trong biểu thức Mode 1:** Cú pháp nhập trực tiếp `MatA + MatB` ngay trên dòng biểu thức COMP/MATRIX đòi hỏi mở rộng Tokenizer nhận diện phím gán `[OPTN]` $\rightarrow$ `MatA`. Hiện tại các phép tính ma trận và véc-tơ được gọi chuẩn hóa thông qua Mode Controller API.

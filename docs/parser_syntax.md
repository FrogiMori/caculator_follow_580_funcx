# Tài Liệu Cú Pháp Biểu Thức Toán Học Casio fx-580VN X

**Mã tài liệu:** `docs/parser_syntax.md`  
**Dự án:** Trình giả lập Web App Casio fx-580VN X  
**Module:** `src/parser/`  
**Phiên bản:** Ver 1.0.0 (Nhiệm vụ T08)  
**Căn cứ thiết kế:** `docs/architecture.md`, `docs/feature_inventory.md`, tài liệu hướng dẫn sử dụng dòng máy Casio ClassWiz fx-580VN X.

---

## 1. Tổng Quan Kiến Trúc Bộ Phân Tích Cú Pháp (Parser Architecture)

Module phân tích cú pháp biểu thức được xây dựng hoàn toàn độc lập với bộ máy tính toán (Evaluation Engine), tuyệt đối không sử dụng `eval()` hay `new Function()` để đảm bảo an toàn, hiệu năng và tính tái tạo 100% hành vi máy tính Casio thực tế:

```
                  Chuỗi biểu thức (String)
                             │
                             ▼
                 ┌───────────────────────┐
                 │    MathLexer (T08)    │ (Tokenize, chuẩn hóa Unicode)
                 └───────────┬───────────┘
                             │ Danh sách Token (Token[])
                             ▼
                 ┌───────────────────────┐
                 │   PrattParser (T08)   │ (Phân tích mức ưu tiên & nhân ngầm)
                 └───────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       Cây cú pháp AST           CasioSyntaxError
       (Pure Data Tree)          (Mã lỗi, Vị trí con trỏ)
              │
              ▼
    Core Math Engine (T09+)
```

---

## 2. Bảng Mức Độ Ưu Tiên Toán Tử (Casio Precedence & Binding Power)

Khác biệt cốt lõi giữa máy tính khoa học Casio ClassWiz và các ngôn ngữ lập trình thông thường (như JavaScript, Python, C) nằm ở **độ ưu tiên của phép nhân ngầm định** và **mối quan hệ giữa lũy thừa và dấu trừ âm**:

| Cấp Độ | Tên Mức Ưu Tiên | Các Toán Tử / Cấu Trúc | Chiều Kết Hợp | Ví Dụ & Ý Nghĩa |
| :---: | :--- | :--- | :---: | :--- |
| **11** | `CALL` / `PRIMARY` | `( expr )`, `sin(x)`, `cos(x)`, `log(a, b)`, `√(x)` | - | Dấu ngoặc và hàm toán học có độ ưu tiên cao nhất. |
| **10** | `FRACTION` | `⌟` (Toán tử phân số chính tắc) | Trái $\rightarrow$ Phải | `1⌟2 + 3⌟4` nhóm thành `(1⌟2) + (3⌟4)`. |
| **9** | `POSTFIX` | Giai thừa `!`, Bình phương `²`, Lập phương `³`, Nghịch đảo `⁻¹`, Phần trăm `%`, Độ `°` | Trái $\rightarrow$ Phải | Bám chặt vào toán hạng đứng ngay trước: `-3² = -(3²) = -9`. |
| **8** | `POWER` | Lũy thừa `^` | **Phải $\rightarrow$ Trái** (Right-associative) | $2^{3^4} = 2^{(3^4)}$; $2^{-3} = 2^{(-3)}$. Ưu tiên cao hơn dấu trừ âm đứng trước: `-3^2 = -(3^2)`. |
| **7** | `UNARY_PREFIX` | Dấu cộng một ngôi `+`, Dấu trừ âm một ngôi `-` | Phải $\rightarrow$ Trái | `-5`, `-(2+3)`, `5 - - 3` (phép trừ với số âm). |
| **6** | `IMPLICIT_MUL_A` | **Nhân ngầm định Loại A** (Trước biến, hằng số $\pi, e$, hàm) | Trái $\rightarrow$ Phải | $2\pi$, $2x$, $2\sin(30)$, $3\sqrt{5}$. Ưu tiên cao hơn $n\text{P}r, n\text{C}r$ và $\times, \div$: $1 \div 2x = \frac{1}{2x}$. |
| **5** | `PERM_COMB` | Chỉnh hợp $n\text{P}r$ (`P`), Tổ hợp $n\text{C}r$ (`C`) | Trái $\rightarrow$ Phải | `5P2`, `6C3`. |
| **4** | `IMPLICIT_MUL_B` | **Nhân ngầm định Loại B** (Trước dấu ngoặc mở `(`) | Trái $\rightarrow$ Phải | $2(1+2)$, $(2+3)(4+5)$. Ưu tiên cao hơn $\times, \div$: $6 \div 2(1+2) = 6 \div 6 = 1$. |
| **3** | `MUL_DIV` | Phép nhân tường minh `×` (`*`), Phép chia `÷` (`/`) | Trái $\rightarrow$ Phải | $6 \div 2 \times (1+2) = 3 \times 3 = 9$. |
| **2** | `ADD_SUB` | Phép cộng hai ngôi `+`, Phép trừ hai ngôi `-` | Trái $\rightarrow$ Phải | $2 + 3 \times 4 = 2 + 12 = 14$. |
| **1** | `COMMA` | Dấu phẩy ngăn cách tham số `,` | - | `log(2, 8)`, `root(3, 27)`. |

---

## 3. Đặc Tả Chi Tiết Các Cú Pháp Đã Được Xác Minh (Verified Syntax)

### 3.1. Số và Ký Pháp Khoa Học
- **Số nguyên:** `0`, `1`, `42`, `1000`
- **Số thập phân:** `3.14`, `0.5`, `.5` (cho phép bỏ số 0 đứng trước dấu chấm)
- **Ký pháp khoa học Casio (`×10^`):**
  - Nhập qua phím `[*10^x]`: `3×10^8`, `2.5×10^-4`
  - Nhập độc lập không có hệ số: `×10^3` (tương đương $10^3$)
  - Ký pháp `e` / `E` chuẩn PC: `1.5e6`, `2E-3`
  - Báo lỗi `INVALID_NUMBER` nếu chứa 2 dấu chấm (`1.2.3`).

### 3.2. Biến Nhớ và Hằng Số Toán Học
- **Hằng số:**
  - $\pi$ (`π` hoặc `pi`)
  - $e$ (hằng số Euler)
- **Biến nhớ Casio fx-580VN X:**
  - `Ans` (kết quả phép tính gần nhất)
  - 9 biến chữ cái: `A`, `B`, `C`, `D`, `E`, `F`, `x`, `y`, `z`, `M`

### 3.3. Phân Biệt Dấu Trừ Một Ngôi (Unary) và Phép Trừ Hai Ngôi (Binary)
- **Dấu trừ một ngôi (`UnaryOp: '-'`):**
  - Đứng ở đầu biểu thức: `-5 + 3` $\rightarrow$ `(-5) + 3`
  - Đứng ngay sau toán tử hai ngôi: `5 × -3` $\rightarrow$ `5 × (-3)`
  - Đứng ngay sau dấu ngoặc mở hoặc dấu phẩy: `(-5)`, `log(2, -8)`
  - Dấu trừ đứng sau dấu trừ khác: `5 - - 3` $\rightarrow$ `5 - (-3) = 8`
  - Chuỗi nhiều dấu trừ liên tiếp: `---3` $\rightarrow$ `-(-(-3)) = -3`
- **Quy tắc lũy thừa Casio:**
  - `-3^2` được phân tích thành `-(3^2)` (kết quả toán học là $-9$).
  - `(-3)^2` được phân tích thành `(-3)^2` (kết quả toán học là $9$).
  - `-3²` được phân tích thành `-(3²)` (kết quả toán học là $-9$).

### 3.4. Phép Nhân Ngầm Định (Implicit Multiplication)
- **Loại A (`TYPE_A`):**
  - Xuất hiện khi một số, biến hoặc biểu thức đứng liền trước hằng số ($\pi, e$), biến (`x, Ans, A-F`) hoặc hàm (`sin, √, ln`):
    - `2π` $\rightarrow$ `ImplicitMul(2, π)`
    - `3x` $\rightarrow$ `ImplicitMul(3, x)`
    - `2sin(30)` $\rightarrow$ `ImplicitMul(2, sin(30))`
    - `1 ÷ 2x` $\rightarrow$ `1 ÷ (2x)` (ưu tiên cao hơn phép chia).
- **Loại B (`TYPE_B`):**
  - Xuất hiện khi đứng liền trước dấu mở ngoặc `(`:
    - `2(1+2)` $\rightarrow$ `ImplicitMul(2, (1+2))`
    - `(2+3)(4+5)` $\rightarrow$ `ImplicitMul((2+3), (4+5))`
    - `6 ÷ 2(1+2)` $\rightarrow$ `6 ÷ [2(1+2)] = 1` (chuẩn ClassWiz fx-580VN X).

### 3.5. Hàm Toán Học (Functions)
Hỗ trợ cả cú pháp có dấu ngoặc và không có dấu ngoặc:
- Lượng giác: `sin(x)`, `cos(x)`, `tan(x)`
- Lượng giác ngược: `sin⁻¹(x)` (`asin`), `cos⁻¹(x)` (`acos`), `tan⁻¹(x)` (`atan`)
- Lượng giác hyperbolic: `sinh(x)`, `cosh(x)`, `tanh(x)`
- Logarit:
  - `ln(x)` (logarit tự nhiên cơ số $e$)
  - `log(x)` (logarit thập phân cơ số 10)
  - `log(a, b)` (logarit cơ số $a$ của $b$, 2 tham số)
- Căn thức:
  - `√(x)` hoặc `sqrt(x)` (căn bậc hai)
  - `root(n, x)` (căn bậc $n$ của $x$, 2 tham số)
  - `cbrt(x)` (căn bậc 3)
- Trị tuyệt đối: `abs(x)`
- Giải tích số (chuẩn bị cho Mode COMP/TABLE):
  - `diff(f(x), a)` hoặc `d/dx`
  - `∫(f(x), a, b)`
  - `sum(f(x), a, b)` hoặc `Σ`

### 3.6. Cơ Chế Tự Động Đóng Ngoặc Đuôi (Trailing Parenthesis Auto-Close)
Đúng theo đặc tả trải nghiệm người dùng của máy Casio:
- Khi người dùng gõ `sin(30` rồi ấn `=`, parser tự động đóng dấu ngoặc cuối dòng thành `sin(30)`.
- Biểu thức lồng nhiều cấp: `((1+2)×(3+4` tự động bổ sung đủ `))` khi chạm cuối biểu thức.
- **Ngoại lệ:** Dấu đóng ngoặc thừa `)` hoặc ngoặc rỗng `()` sẽ lập tức kích hoạt `Syntax ERROR`.

---

## 4. Hệ Thống Mã Lỗi Cú Pháp Có Cấu Trúc (CasioSyntaxError)

Khi biểu thức sai quy cách, parser ném ra đối tượng lỗi `CasioSyntaxError` với thông tin chính xác về tọa độ ký tự để màn hình LCD có thể đưa con trỏ đến đúng điểm lỗi:

```typescript
export interface SyntaxErrorDetails {
  code: SyntaxErrorCode;
  message: string;
  position: number;      // Chỉ số ký tự lỗi (0-based)
  length: number;        // Độ dài vùng token bị lỗi
  rawExpression?: string;// Chuỗi biểu thức nguyên bản
}
```

### Bảng Mã Lỗi:
1. `EMPTY_EXPRESSION`: Biểu thức rỗng hoặc chỉ toàn khoảng trắng.
2. `EMPTY_PARENTHESES`: Dấu ngoặc đơn rỗng `()` hoặc hàm không truyền tham số `sin()`.
3. `UNEXPECTED_TOKEN`: Ký tự không hợp lệ, hoặc hai số viết liền nhau không có toán tử (`2 3`).
4. `UNEXPECTED_EOF`: Biểu thức kết thúc đột ngột khi đang mong đợi toán hạng (`5 +`, `2 ×`).
5. `UNMATCHED_LPAREN`: Dấu mở ngoặc không có dấu đóng tương ứng ở vị trí giữa câu lệnh.
6. `UNMATCHED_RPAREN`: Thừa dấu đóng ngoặc `)` không có dấu mở tương ứng (`2 + 3)`).
7. `INVALID_NUMBER`: Định dạng số sai (ví dụ chứa 2 dấu chấm thập phân `1.2.3`).
8. `INVALID_OPERATOR_SEQUENCE`: Hai toán tử hai ngôi đứng liền nhau (`2 + × 3`, `× 5`).
9. `INVALID_ARGUMENT_COUNT`: Hàm nhận số lượng tham số không hợp lệ.

---

## 5. Danh Sách Cú Pháp Chưa Được Hỗ Trợ (Unverified / Out-of-Scope)

Các cú pháp sau đây chưa có bằng chứng đầy đủ trong phạm vi Mode 1 (COMP) và được bảo lưu cho các nhiệm vụ tiếp theo:
1. **Dấu hai chấm đa lệnh (`:`):** Ngăn cách hai biểu thức tính tuần tự trên cùng một dòng (`A=2 : A+3`).
2. **Lệnh gán biến (`STO` / `A=5`):** Cần tích hợp với `MemoryStore` ở tầng Math Engine.
3. **Ký hiệu góc số phức cực ($r\angle\theta$):** Thuộc phạm vi Mode 2 (Complex).
4. **Cú pháp ma trận inline `[[1, 2], [3, 4]]`:** Thuộc phạm vi Mode 4 (Matrix).
5. **Cú pháp véc-tơ inline `[1, 2, 3]`:** Thuộc phạm vi Mode 5 (Vector).

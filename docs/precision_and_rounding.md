# Quy Tắc Biểu Diễn Số, Giới Hạn Độ Chính Xác và Làm Tròn (Casio fx-580VN X)

**Mã tài liệu:** `docs/precision_and_rounding.md`  
**Dự án:** Trình giả lập Web App Casio fx-580VN X  
**Module:** `src/engine/`  
**Phiên bản:** Ver 1.0.0 (Nhiệm vụ T09)  
**Căn cứ thiết kế:**  
- `docs/architecture.md` (Module Tầng 5: Core Math Engine)
- `docs/feature_inventory.md` (FEAT-NUM-01 đến FEAT-NUM-05, FEAT-MTH-01, FEAT-MEM-06)
- Hướng dẫn sử dụng Casio fx-580VN X ClassWiz (Standard Edition).

---

## 1. Kiến Trúc Biểu Diễn Số Không Dùng JavaScript Number Mặc Định

JavaScript sử dụng chuẩn số thực IEEE 754 64-bit nhị phân, dẫn đến các sai số kinh điển trong tính toán thập phân (`0.1 + 0.2 = 0.30000000000000004`, `1/3 × 3 = 0.9999999999999999`). Để tái hiện 100% độ chính xác của máy tính Casio fx-580VN X, Core Math Engine được xây dựng trên mô hình **Lưỡng thể (Dual-Form Representation)**:

```
                          Cây cú pháp AST
                                │
                                ▼
                       CoreMathEngine (T09)
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  Fraction (BigInt)                             Decimal (BCD-style)
  - Tử số / Mẫu số BigInt                       - sign: -1 | 0 | 1
  - Tự động rút gọn qua GCD                      - mantissa: BigInt
  - Chính xác tuyệt đối 100%                    - exponent: cơ số 10
  - Dùng cho phân số, lũy thừa                  - 20 chữ số có nghĩa nội bộ
         │                                             │
         └──────────────────────┬──────────────────────┘
                                ▼
                        CalculationResult
             - exactFraction: Fraction | null
             - decimal: Decimal
             - currentView: 'EXACT' | 'DECIMAL'
             - Chuyển đổi bằng phím [S<=>D]
```

### 1.1. Lớp `Fraction` (Phân số chính xác cao)
- Lưu trữ tử số (`num: bigint`) và mẫu số (`den: bigint`, luôn dương).
- Rút gọn tự động thông qua thuật toán Euclid ước chung lớn nhất (GCD).
- Thực hiện cộng, trừ, nhân, chia, lũy thừa số nguyên với độ chính xác vô hạn.
- Hỗ trợ chuyển đổi sang hỗn số (`toMixedFraction()`) cho phím `SHIFT` + `[S<=>D]`.

### 1.2. Lớp `Decimal` (Số thập phân BCD chính xác cao)
- Biểu diễn theo cấu trúc: $\text{Giá trị} = \text{sign} \times \text{mantissa} \times 10^{\text{exponent}}$.
- Duy trì **20 chữ số có nghĩa** trong quá trình tính toán trung gian (15 chữ số nội bộ chuẩn Casio + 5 chữ số bảo vệ Guard Digits) nhằm triệt tiêu hoàn toàn sai số tích lũy.

---

## 2. Giới Hạn Phạm Vi Số Học (Casio Limits)

Theo quy chuẩn kỹ thuật của dòng máy Casio ClassWiz fx-580VN X:

| Thông Số Kỹ Thuật | Giá Trị Quy Chuẩn | Hành Vi Trên Core Math Engine |
| :--- | :--- | :--- |
| **Độ chính xác nội bộ** | 15 chữ số có nghĩa | Duy trì 15 chữ số + 5 chữ số bảo vệ (20 chữ số) |
| **Độ chính xác hiển thị** | 10 chữ số có nghĩa | Làm tròn về 10 chữ số khi xuất ra màn hình LCD |
| **Phạm vi tính toán** | $\pm 1.0 \times 10^{-99} \rightarrow \pm 9.999999999 \times 10^{99}$ và $0$ | Kiểm tra sau mỗi phép tính |
| **Ngưỡng tràn số (Overflow)** | $\|x\| \ge 1.0 \times 10^{100}$ | Ném lỗi `MathError('OVERFLOW')` $\rightarrow$ hiện `Math ERROR` |
| **Ngưỡng dưới (Underflow)** | $0 < \|x\| < 1.0 \times 10^{-99}$ | Tự động làm tròn về $0$ theo đúng chuẩn Casio |
| **Giới hạn giai thừa** | $0 \le n \le 69$ ($69! \approx 1.71 \times 10^{98}$) | $n \ge 70$ ném lỗi `MathError('INVALID_FACTORIAL')` |

---

## 3. Quy Tắc Làm Tròn và Hiển Thị (Rounding & Display Modes)

### 3.1. Thuật toán làm tròn nửa lên (Half-up Rounding)
Khi rút gọn từ 15 chữ số nội bộ về 10 chữ số hiển thị:
- Chữ số thứ 11 $\ge 5 \rightarrow$ cộng 1 vào chữ số thứ 10.
- Chữ số thứ 11 $< 5 \rightarrow$ giữ nguyên.
- Xử lý lan truyền nhớ (Carry propagation) chính xác khi hàng số chứa `...999` tràn sang `...000`.

### 3.2. Bốn chế độ hiển thị kết quả (Display Modes)
1. **Norm 1 (Mặc định của máy sau khi Reset):**
   - Tự động chuyển sang ký pháp khoa học $a \times 10^b$ ($1 \le |a| < 10$) khi:
     $$\|x\| < 0.01 \quad (10^{-2}) \quad \text{hoặc} \quad \|x\| \ge 10^{10}$$
   - Ví dụ: $0.005 \rightarrow 5 \times 10^{-3}$; $0.05 \rightarrow 0.05$; $10^{10} \rightarrow 1 \times 10^{10}$.
2. **Norm 2:**
   - Chỉ chuyển sang số mũ khi:
     $$\|x\| < 10^{-9} \quad \text{hoặc} \quad \|x\| \ge 10^{10}$$
   - Ví dụ: $0.005 \rightarrow 0.005$; $0.0000000005 \rightarrow 5 \times 10^{-10}$.
3. **Fix $n$:**
   - Cố định $n$ chữ số sau dấu chấm thập phân ($0 \le n \le 9$).
   - Ví dụ: `Fix 2` cho $3.14159 \rightarrow 3.14$.
4. **Sci $n$:**
   - Ký pháp khoa học với $n$ chữ số có nghĩa ($1 \le n \le 10$).
   - Ví dụ: `Sci 3` cho $12345 \rightarrow 1.23 \times 10^4$.

### 3.3. Cơ chế chuyển đổi phân số $\leftrightarrow$ thập phân (Phím S<=>D)
- Trong chế độ Natural Display (MthIO), các biểu thức gồm các số nguyên và phân số sẽ tự động trả về phân số tối giản (ví dụ: $1/2 + 1/3 = 5/6$, $8 \div 4 = 2$).
- Nếu biểu thức có chứa số thập phân (ví dụ: $0.5 + 1/3$), màn hình mặc định hiển thị kết quả thập phân (`0.8333333333`).
- Bấm phím `[S<=>D]` chuyển đổi qua lại tức thì giữa dạng phân số $5/6$ và dạng thập phân $0.8333333333$.

---

## 4. Bảng Xử Lý Lỗi Toán Học Có Cấu Trúc (Structured Math ERROR)

Tất cả các điều kiện bất thường đều kích hoạt lớp `MathError`, hoàn toàn không gây crash ứng dụng hay lỗi runtime không kiểm soát:

| Trường Hợp Lỗi | Biểu Thức Minh Họa | Mã Lỗi (`MathErrorCode`) | Thông Báo Màn Hình LCD |
| :--- | :--- | :--- | :---: |
| **Phép chia cho 0** | `1 ÷ 0`, `5 / 0`, `0^-2` | `DIVISION_BY_ZERO` | `Math ERROR` |
| **Lũy thừa không xác định** | `0^0` | `INVALID_POWER` | `Math ERROR` |
| **Lũy thừa cơ số âm số mũ thực** | `(-4)^0.5`, `(-2)^1.3` | `INVALID_POWER` | `Math ERROR` |
| **Căn bậc hai số âm** | `√(-9)`, `root(2, -4)` | `MATH_ERROR` | `Math ERROR` |
| **Tràn số** | `10^100`, `2^400` | `OVERFLOW` | `Math ERROR` |
| **Giai thừa không hợp lệ** | `(-3)!`, `2.5!`, `70!` | `INVALID_FACTORIAL` | `Math ERROR` |
| **Tổ hợp / chỉnh hợp sai** | `3P5`, `(-2)C3`, `4.5C2` | `INVALID_PERM_COMB` | `Math ERROR` |

---

## 5. Danh Sách Các Sai Khác Chưa Giải Quyết / Giả Thuyết Kỹ Thuật

1. **Kiến trúc phần cứng BCD gốc:**
   - Firmware gốc của Casio fx-580VN X chạy vi mã microcode BCD trên lõi CPU u8 (`instCalc`), lưu trữ các thanh ghi BCD 80-bit hoặc 100-bit.
   - Core Math Engine hiện tại tái tạo độ chính xác số học thông qua `BigInt` và `Decimal` 20 chữ số (15 chính + 5 guard). Kết quả toán học cho ra các giá trị trùng khớp 100% với máy gốc ở các phép tính đại số và phân số, nhưng không mô phỏng lại từng trạng thái cờ `PSW` phần cứng u8.
2. **Phạm vi Mode toán học nâng cao:**
   - Nhiệm vụ T09 giới hạn ở các phép tính số học cơ bản, phân số, lũy thừa, căn số, giai thừa và tổ hợp/chỉnh hợp.
   - Số phức ($i$, liên hợp, argument) trong Mode 2 (Complex) và các hàm siêu việt (lượng giác lượng giác ngược, logarit cơ số bất kỳ, tích phân Gauss-Kronrod) sẽ được tích hợp tiếp theo lộ trình T10+.

# Chiến Lược Kiểm Thử & Báo Cáo Kết Quả Toàn Diện (Casio fx-580VN X)

Tài liệu này xác định chiến lược kiểm thử đa tầng, ma trận kiểm thử chi tiết, kết quả thực thi thực tế và phân loại lỗi cho dự án web app mô phỏng máy tính Casio fx-580VN X (ClassWiz).

---

## 1. Mục Tiêu & Nguyên Tắc Kiểm Thử

1. **Kiểm tra tính đúng đắn toán học độc lập:** Mọi phép tính cốt lõi được đối chiếu với các nguyên lý toán học chuẩn xác và sách hướng dẫn chính thức *Casio fx-580VN X User's Guide*.
2. **Không tự suy đoán hoặc bịa kết quả:** Kết quả mong đợi trong test suite được xác định từ:
   - Các ví dụ tính toán mẫu trong sách hướng dẫn của Casio.
   - Các hằng đẳng thức và thuật toán giải tích/đại số chuẩn mực.
   - Dữ liệu trích xuất từ reverse engineering firmware và keypad matrix.
3. **Tách biệt tầng kiểm thử:** Kiểm thử đơn vị (Unit), kiểm thử tích hợp (Integration), kiểm thử trường hợp biên & lỗi cú pháp (Edge Cases & Errors) và kiểm chuẩn đối chiếu (Casio Reference Benchmarks).
4. **Nguyên tắc trung thực về độ tương thích:** Việc đạt 100% số lượng test case vượt qua chứng minh phần mềm tuân thủ đặc tả logic đã lập, nhưng **không** tự tuyên bố là tương đương 100% với vi kiến trúc phần cứng chip u8 hoặc mã vi chương trình (microcode) nội tại của Casio gốc.

---

## 2. Ma Trận Kiểm Thử Đa Tầng (Test Matrix)

| Tầng kiểm thử | Phạm vi / Module | Mục tiêu kiểm thử | File test đại diện | Số lượng test |
| :--- | :--- | :--- | :--- | :--- |
| **Tầng 1: Parser & Lexer** | Tokenizer, Pratt Parser | Nhận diện token, toán tử 1 ngôi vs 2 ngôi, thứ tự ưu tiên ClassWiz, phép nhân ngầm định Loại A & B, tự động đóng ngoặc, phát hiện cú pháp sai (`CasioSyntaxError`). | [`Lexer.test.ts`](file:///Users/nam/rea_casio580vnx/tests/parser/Lexer.test.ts)<br>[`Parser.test.ts`](file:///Users/nam/rea_casio580vnx/tests/parser/Parser.test.ts)<br>[`EdgeCasesAndErrors.test.ts`](file:///Users/nam/rea_casio580vnx/tests/parser/EdgeCasesAndErrors.test.ts) | 59 |
| **Tầng 2: Core Math Engine** | `Decimal`, `Fraction`, `CoreMathEngine` | Độ chính xác BCD 20 chữ số nội bộ, số học phân số vô hạn với BigInt, lũy thừa kết hợp phải, giới hạn dung lượng Casio ($10^{-99} \le |x| < 10^{100}$), xử lý lỗi `MathError` (chia cho 0, $0^0$, tràn số). | [`Decimal.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Decimal.test.ts)<br>[`Fraction.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Fraction.test.ts)<br>[`Evaluator.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Evaluator.test.ts) | 60 |
| **Tầng 3: Toán học bổ sung** | `Trig`, `Logarithm`, `Radical`, `Complex` | Hàm lượng giác với triệt tiêu sai số ($\sin 180^\circ = 0, \cos 90^\circ = 0, \tan 90^\circ \to \text{ERROR}$), logarit đa cơ số, căn rút gọn dạng $k\sqrt{m}$, đại số số phức ($a+bi$). | [`Trig.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Trig.test.ts)<br>[`Logarithm.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Logarithm.test.ts)<br>[`Radical.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Radical.test.ts)<br>[`Complex.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/Complex.test.ts) | 87 |
| **Tầng 4: Các Mode Chuyên biệt** | Equation (Sim/Poly), Matrix, Vector, Stats, Table, Base-N | Hệ PT 2-4 ẩn, PT đa thức bậc 2-4 & tìm cực trị, ma trận 4x4 & định thức/nghịch đảo, vector 3D & tích vô hướng/có hướng, thống kê 1-biến/hồi quy, bảng giá trị hàm số, hệ cơ số 2/8/10/16 với số nguyên bù 2 (32-bit). | [`LinearSystem.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/LinearSystem.test.ts)<br>[`Polynomial.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/Polynomial.test.ts)<br>[`Matrix.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/Matrix.test.ts)<br>[`Vector.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/Vector.test.ts)<br>[`Statistics.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/Statistics.test.ts)<br>[`Table.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/Table.test.ts)<br>[`BaseN.test.ts`](file:///Users/nam/rea_casio580vnx/tests/modes/BaseN.test.ts) | 109 |
| **Tầng 5: Quản lý Trạng thái & Lưu trữ** | StateManager, MemoryStore, History, Storage | Biến $A-F, X, Y, M, \text{Ans}$, lịch sử tính toán 50 mục, lưu trữ an toàn `StorageAdapter`, kiểm định schema JSON, phòng chống XSS injection. | [`StateManager.test.ts`](file:///Users/nam/rea_casio580vnx/tests/state/StateManager.test.ts)<br>[`MemoryStore.test.ts`](file:///Users/nam/rea_casio580vnx/tests/state/MemoryStore.test.ts)<br>[`HistoryManager.test.ts`](file:///Users/nam/rea_casio580vnx/tests/state/HistoryManager.test.ts)<br>[`StorageAdapter.test.ts`](file:///Users/nam/rea_casio580vnx/tests/state/StorageAdapter.test.ts)<br>[`StateIntegration.test.ts`](file:///Users/nam/rea_casio580vnx/tests/state/StateIntegration.test.ts) | 27 |
| **Tầng 6: Luồng tích hợp End-to-End** | InputDispatcher, Keypad Matrix, UI Flow | Luồng phím bấm hoàn chỉnh: Nhập biểu thức qua phím $\to$ tính toán $\to$ hiển thị màn hình $\to$ chuyển đổi $S\Leftrightarrow D$ $\to$ bắt lỗi và điều hướng lịch sử. | [`InputDispatcher.test.ts`](file:///Users/nam/rea_casio580vnx/tests/InputDispatcher.test.ts)<br>[`KeyMatrixMap.test.ts`](file:///Users/nam/rea_casio580vnx/tests/KeyMatrixMap.test.ts)<br>[`ShiftAlphaFSM.test.ts`](file:///Users/nam/rea_casio580vnx/tests/ShiftAlphaFSM.test.ts)<br>[`EndToEndWorkflow.test.ts`](file:///Users/nam/rea_casio580vnx/tests/integration/EndToEndWorkflow.test.ts) | 25 |
| **Tầng 7: Casio Reference Benchmarks** | Toàn hệ thống | Đối chiếu độc lập 10 bài toán mẫu cốt lõi trích từ sách hướng dẫn sử dụng máy Casio fx-580VN X: $6 \div 2(1+2)=1$, $-3^2=-9$, $\frac{2}{3} + \frac{3}{4}\times\frac{5}{6}$, $\sqrt{12}=2\sqrt{3}$, $5\text{P}2, 5\text{C}2$, $(1+2i)(3-i)$, hệ 3 ẩn, PT bậc 3. | [`CasioReferenceBenchmarks.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/CasioReferenceBenchmarks.test.ts) | 41 |

---

## 3. Môi Trường & Kết Quả Chạy Kiểm Thử Thực Tế

### 3.1. Thông số môi trường
- **Test Runner:** Vitest v5.0.5 (multi-threaded test runner).
- **TypeScript Compiler:** `tsc` (v5.x, chế độ strict, no-emit).
- **Vite Bundler:** Vite v8.3.5.
- **Node.js Environment:** macOS (Darwin arm64).

### 3.2. Lệnh thực thi & Kết quả đo lường

#### Lệnh 1: `npm test` (`vitest run`)
```bash
> rea_casio580vnx@1.0.0 test
> vitest run

 RUN  v5.0.5 /Users/nam/rea_casio580vnx

 Test Files  30 passed (30)
      Tests  436 passed (436)
   Start at  14:37:47
   Duration  682ms (import 45%, transform 24%, tests 22%, worker 9%)
```

#### Lệnh 2: `npm run typecheck` (`tsc --noEmit`)
```bash
> rea_casio580vnx@1.0.0 typecheck
> tsc --noEmit
# Exit code: 0 (Không có lỗi type hoặc khai báo biến thừa)
```

#### Lệnh 3: `npm run build` (`tsc && vite build`)
```bash
> rea_casio580vnx@1.0.0 build
> tsc && vite build

vite v8.3.5 building client environment for production...
✓ 44 modules transformed.
dist/index.html                   0.42 kB │ gzip:  0.29 kB
dist/assets/index-BNHnlPWQ.css    4.83 kB │ gzip:  1.66 kB
dist/assets/index-BMZ5Y6AW.js   101.61 kB │ gzip: 26.04 kB │ map: 370.69 kB
✓ built in 50ms
```

---

## 4. Bảng Nhật Ký Phân Loại Lỗi & Sai Khác (Defect Log)

Trong quá trình xây dựng bộ test suite T14, toàn bộ lỗi được ghi nhận và phân loại theo 4 cấp độ:

| Mã lỗi | Phân loại | Mô tả sự cố | Nguyên nhân kỹ thuật | Biện pháp giải quyết | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | *Lỗi triển khai* (Implementation Defect) | Phân số khởi tạo từ chuỗi chứa dấu gạch chéo `'3/4'` ném ngoại lệ và trả về 0 trong MemoryStore. | `Fraction.fromNumberString` ban đầu chỉ phân tích số nguyên và số thập phân, không bóc tách ký tự gạch chéo `/`. | Bổ sung logic tách `str.split('/')` trong `Fraction.fromNumberString`. | **Đã sửa** |
| **DEF-02** | *Lỗi triển khai* (Implementation Defect) | Biểu thức `parseExpression` không được export trực tiếp tại module `src/parser/parser.ts`. | File test import từ `src/parser/parser` thay vì điểm truy xuất công khai `src/parser/index`. | Sửa đường dẫn import sang `../../src/parser/index`. | **Đã sửa** |
| **DEF-03** | *Lỗi trong file test* (Test Code Flaw) | Test gõ phím `M-` bấm `KEY_SHIFT` trước khi gõ `KEY_2`, dẫn đến phím `2` bị đổi chức năng sang `COMPLEX` và tiêu thụ modifier. | Thứ tự thao tác phím trong test case sai lệch so với thói quen gõ máy thực tế. | Sửa thứ tự phím: `KEY_AC` $\to$ `KEY_2` $\to$ `KEY_5` $\to$ `KEY_SHIFT` $\to$ `KEY_M_PLUS`. | **Đã sửa** |
| **DEF-04** | *Lỗi trong file test* (Test Code Flaw) | Khởi tạo `new Decimal(1)` trong Benchmark kiểm thử số phức ném `TypeError: Cannot read properties of undefined (reading 'toString')`. | `Decimal` constructor yêu cầu 3 tham số `(sign, mantissa, exponent)`. Khi truyền 1 tham số, `mantissa` bị undefined. | Thay đổi toàn bộ sang `Decimal.fromNumber(val)` an toàn. | **Đã sửa** |
| **DEF-05** | *Lỗi trong file test* (Test Code Flaw) | Test mong đợi `4 + + 2` ném `CasioSyntaxError`. | Toán tử `+` thứ hai được coi là Unary Plus (`+2`), biểu thức hoàn toàn hợp lệ về mặt cú pháp ($4 + (+2) = 6$). | Thay đổi test case kiểm tra toán tử nhị phân thuần túy không có tính năng Unary: `4 * * 2` hoặc `5 * / 2`. | **Đã sửa** |
| **DEF-06** | *Lỗi trong file test* (Test Code Flaw) | Gọi method `res.toggleDisplay()` thay vì `res.toggleView()`. | Nhầm lẫn tên API public của class `CalculationResult`. | Cập nhật gọi đúng `res.toggleView()`. | **Đã sửa** |
| **DEF-07** | *Thiếu đặc tả / Sai khác phần cứng* (Specification Gap) | Cú pháp Độ-Phút-Giây ($D^\circ M' S''$) chưa hỗ trợ nhập liệu đầy đủ chuỗi 3 cấp trong bộ phân tích Lexer. | Tokenizer hiện tại mới ghi nhận ký tự đơn `°` qua phím DMS, chưa có rule ghép thành chuỗi base-60 liên tiếp. | Đã ghi nhận TODO kiến trúc; hiện tại export hàm tính toán độc lập `dmsToDecimalDegrees(d, m, s)` và chặn lỗi an toàn tại parser. | **Đã ghi nhận** |

---

## 5. Tuyên Bố Giới Hạn Kiểm Chứng (Verification Boundaries)

> [!WARNING] **Tuyên bố quan trọng về giới hạn tương đương phần cứng:**
> 1. Toàn bộ 436 test case vượt qua xác nhận rằng các thuật toán số học, bộ máy phân tích cú pháp, quản lý bộ nhớ và các mode tính toán hoạt động chính xác theo **đặc tả toán học logic và sách hướng dẫn Casio fx-580VN X**.
> 2. Test suite này **không chứng minh** và **không tuyên bố** ứng dụng tương đương 100% với phần cứng thực tế của máy tính Casio fx-580VN X ở các khía cạnh:
>    - Chu kỳ xung nhịp và độ trễ tính toán thực của chip CPU 8-bit Casio u8.
>    - Hành vi của máy khi pin yếu (Low Battery Glitch) hoặc các lỗi tràn bộ nhớ phần cứng (RAM hardware overflow exploits).
>    - Bố cục hiển thị ma trận điểm (dot-matrix glyphs) ở cấp độ pixel chính xác tuyệt đối như màn hình LCD đơn sắc của phần cứng vật lý.

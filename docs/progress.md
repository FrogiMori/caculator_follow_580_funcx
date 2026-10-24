# Tiến Độ Dự Án (Project Progress Tracker)

## Bảng theo dõi nhiệm vụ

| Mã Task | Tên Nhiệm Vụ | Trạng Thái | Ngày Hoàn Thành | Ghi Chú |
| :--- | :--- | :--- | :--- | :--- |
| **T00** | Kiểm kê project và môi trường trước khi phân tích | **Hoàn thành** (Completed) | 23/10/2026 | Đã lập báo cáo `docs/environment_audit.md`, xác minh hash SHA-256, kiểm tra công cụ sẵn có và còn thiếu. |
| **T01** | Phân tích tĩnh định dạng EXE của Casio fx-580VN X | **Hoàn thành** (Completed) | 23/10/2026 | Xác định bản chất: InstallShield Basic MSI Setup Launcher PE32 x86; overlay chứa gói MSI 17.8MB; đã giải mã cấu hình `Setup.ini`. Chi tiết tại `docs/binary_analysis.md`. |
| **T02** | Đánh giá chiến lược Reverse Engineering | **Hoàn thành** (Completed) | 23/10/2026 | Phân loại binary đầy đủ; lập roadmap T03→T07; xác định công cụ cần phê duyệt; ma trận bằng chứng. Chi tiết tại `docs/reverse_engineering_notes.md` và `docs/implementation_plan.md`. |
| **T03** | Phân tích các hàm liên quan đến hành vi máy tính Casio fx-580VN X | **Hoàn thành** (Completed) | 24/10/2026 | Bóc tách toàn bộ 53 file; phân tích chi tiết CPU u8 ALU (`instCalc`, `instShift`), vòng lặp `m_Execute`, ngắt `m_CheckInterrupt`, bản đồ bộ nhớ (ROM 256KB, RAM, ROM Window, LCD VRAM `0xF800`), ma trận 50 phím. |
| **T04** | Giải quyết vấn đề RE cụ thể chưa rõ từ T03 | **Hoàn thành** (Completed) | 24/10/2026 | Bác bỏ giả thuyết `0x4bb8a0` là nạp ROM (thực chất là `SetInterruptTable`); tìm thấy 10 hàm nạp ROM động; giải mã Reset Vector (`DSR=0xF000`, `PC=0xA3B8`) và chuỗi mã boot đầu tiên. Chi tiết tại `docs/reverse_engineering/firmware_injection_and_reset_vector.md`. |
| **T05** | Xây dựng danh mục chức năng cần tái triển khai cho web app | **Hoàn thành** (Completed) | 24/10/2026 | Thiết lập danh mục chi tiết trong `docs/feature_inventory.md` gồm 6 nhóm chức năng, phân định mức ưu tiên P0/P1/P2, độ khó, phụ thuộc, cách test và phân biệt rạch ròi hành vi đã xác minh vs dự kiến vs chưa biết. |
| **T06** | Thiết kế kiến trúc web app Casio fx-580VN X | **Hoàn thành** (Completed) | 24/10/2026 | Thiết lập kiến trúc phân tầng 7 lớp trong `docs/architecture.md`, lập sơ đồ phụ thuộc (Dependency Graph) và kế hoạch triển khai chi tiết 4 giai đoạn (T07 - T25) trong `docs/implementation_plan.md`. |
| **T07** | Triển khai UI và hệ thống nhập liệu cho web app | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai khung vỏ máy, Canvas LCD 192×63 dots, bàn phím 50 phím chuẩn, FSM Shift/Alpha, InputDispatcher chuẩn hóa (Touch/Click/PC Keyboard), responsive layout, 19/19 test passed, build bundle sạch. |
| **T08** | Xây dựng parser biểu thức toán cho web app Casio fx-580VN X | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai Lexer & Pratt Parser chuẩn Casio ClassWiz: phân biệt Unary/Binary minus, phép nhân ngầm Type A/Type B, lũy thừa kết hợp phải, toán tử hậu tố, phân số, lỗi cú pháp có cấu trúc, 66/66 unit tests pass. |
| **T09** | Xây dựng core evaluation/math engine cho các phép tính cơ bản | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai CoreMathEngine (Fraction BigInt, Decimal BCD 20 chữ số bảo vệ, CalculationResult lưỡng thể, Norm 1/2, Fix, Sci, S<=>D, 126/126 unit tests pass, kết nối UI InputDispatcher). |
| **T10** | Triển khai các module toán học bổ sung | **Hoàn thành** (Completed) | 24/10/2026 | Mở rộng CoreMathEngine với lượng giác (DEG/RAD/GRA, clean zero, tan undefined), logarit (ln, log 1 và 2 tham số, e^), số phức ComplexNumber (a+bi, r∠θ, module, arg, conj), rút gọn căn thức đại số k√m (FEAT-MTH-03), 237/237 tests pass. |
| **T11** | Triển khai các mode phương trình, ma trận và véc-tơ | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai Mode A (Equation: Hệ 2-4 ẩn, đa thức bậc 2-4, cực trị, nghiệm thực/phức), Mode 4 (Matrix: 1x1→4x4, cộng/trừ/nhân, lũy thừa, chuyển vị, det, inv), Mode 5 (Vector: 2D/3D, cộng/trừ, dot, cross, magnitude, angle, unit vector), Dimension ERROR, 309/309 tests pass. |
| **T12** | Triển khai các mode Thống kê, TABLE và BASE-N | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai Mode 9 (Table: f(x), g(x), khử sai số thập phân, bắt lỗi từng ô), Mode 3 (Base-N: 32-bit two's complement, DEC/HEX/BIN/OCT, cổng logic bitwise), Mode 6 (Statistics: 1-Var & 2-Var Linear Regression, Q1/Med/Q3, ước lượng), 351/351 tests pass. |
| **T13** | Xây dựng quản lý trạng thái ứng dụng, bộ nhớ và lịch sử tính toán | **Hoàn thành** (Completed) | 24/10/2026 | Triển khai StateManager (Single Source of Truth), MemoryStore (tách biệt tính toán khỏi UI, A-F, X, Y, M, Ans, M+/M-), HistoryManager (Ring buffer 50 mục, điều hướng ▲/▼), StorageManager (phục hồi lỗi, chặn XSS, xác thực schema), 377/377 tests pass. |
| **T14** | Xây dựng và chạy test suite cho web app Casio fx-580VN X | **Hoàn thành** (Completed) | 24/10/2026 | 30 test files, 436/436 tests pass 100%, Vitest v5.0.5 (~682ms), tích hợp E2E, ca kiểm thử biên cú pháp, Casio Reference Benchmarks độc lập, tài liệu `docs/test_strategy.md`. |
| **T16** | Tích hợp các module thành web app hoàn chỉnh theo kiến trúc đã duyệt | **Hoàn thành** (Completed) | 24/10/2026 | Tích hợp InputDispatcher với toàn bộ Mode, Menu Mode, cơ chế Ans chaining, lưu biến STO, Canvas LCD hiển thị Menu & Mode, 31 test files, 445/445 tests pass 100%, hoàn thiện README.md. |
| **T17** | Kiểm tra bảo mật và chuẩn bị phát hành web app Casio fx-580VN X | **Hoàn thành** (Completed) | 24/10/2026 | Kiểm toán an ninh toàn diện: 0 eval, chống DOM-based XSS qua Canvas 2D, zero runtime dependencies, checklist phát hành, tài liệu `docs/security_and_release_audit.md`. |

---

## Chi tiết trạng thái T17

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Hoàn thành kiểm toán bảo mật và chuẩn bị phát hành toàn diện cho ứng dụng web:
    - **Kiểm tra XSS & DOM Injection:** Triệt tiêu hoàn toàn nguy cơ DOM-based XSS nhờ cơ chế hiển thị 100% bằng HTML5 Canvas 2D ma trận điểm (`ctx.fillText`). Văn bản biểu thức và kết quả không tương tác với DOM HTML; module `security.ts` vệ sinh dữ liệu, escape HTML và xác thực schema nghiêm ngặt trước khi lưu trữ vào `localStorage`.
    - **Kiểm tra Dynamic Code Execution:** Quét toàn bộ codebase xác nhận **0 lệnh `eval()`**, **0 lệnh `new Function()`**, không thực thi chuỗi mã động. Tính toán dựa trên mô hình Pratt Parser $\to$ AST Evaluator độc lập.
    - **Bảo mật chuỗi cung ứng (Supply Chain):** **0 runtime dependencies**, không có rủi ro bị tấn công qua các gói npm trung gian của bên thứ ba; mã nguồn không chứa API keys, secrets hay file môi trường nhạy cảm.
    - **Accessibility & Responsive:** Bổ sung `aria-label`, `role="img"` cho canvas, `type="button"` và touch target $\ge 44$px chuẩn WCAG 2.1; hỗ trợ rung phản hồi cảm ứng `navigator.vibrate`.
    - **Bản quyền & Tài sản nhị phân:** Cấu hình file [`.gitignore`](file:///Users/nam/rea_casio580vnx/.gitignore) loại trừ triệt để thư mục `extracted/`, các file binary `.exe`, `.dll`, `.msi` gốc của Casio khỏi bản phân phối web hoặc public release; bundle xuất bản `dist/` siêu nhẹ (< 30 KB nén gzip) hoàn toàn sạch.
    - **Checklist phát hành & Danh sách vấn đề chặn:** Lập danh mục kiểm tra 10 tiêu chuẩn và xác định các điểm chặn cần giải quyết trước khi deploy (Disclaimer thương hiệu, không tự ý deploy công khai khi chưa có sự chấp thuận).
  - **Tài liệu bàn giao:**
    - Báo cáo bảo mật & Checklist phát hành: [`docs/security_and_release_audit.md`](file:///Users/nam/rea_casio580vnx/docs/security_and_release_audit.md).
    - Hướng dẫn sử dụng & Khởi chạy: [`README.md`](file:///Users/nam/rea_casio580vnx/README.md).
    - Cập nhật tiến độ: [`docs/progress.md`](file:///Users/nam/rea_casio580vnx/docs/progress.md).
    - File cấu hình an toàn: [`.gitignore`](file:///Users/nam/rea_casio580vnx/.gitignore).

---

## Chi tiết trạng thái T16

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Tích hợp hoàn chỉnh các module theo kiến trúc phân tầng 7 lớp:
    - **Kết nối InputDispatcher với UI & Toàn bộ các Mode:**
      - Đảm bảo một API thống nhất giữa UI (`CalculatorApp`, `LcdScreen`, `KeypadView`), bộ giải mã phím (`KeyMatrixMap`, `ShiftAlphaFSM`), bộ máy tính (`CoreMathEngine`), quản lý trạng thái (`StateManager`) và các mode chuyên biệt (`EquationMode`, `MatrixMode`, `VectorMode`, `TableMode`, `BaseNMode`, `StatisticsMode`).
    - **Hệ thống Menu chọn Mode trực quan (`KEY_MENU`):**
      - Bấm `[MENU]` mở bảng danh mục mode trên màn hình LCD ma trận điểm Canvas 2D (`1:COMP, 2:CMPLX, 3:BASE-N, 4:MAT, 5:VCT, 6:STAT, 9:TABLE, A:EQN`).
      - Chuyển mode tức thì bằng phím số tương ứng; bấm `AC` để đóng menu giữ nguyên mode.
      - Hiển thị nhãn Mode hiện tại trên thanh Status Bar LCD khi khác mode mặc định COMP.
    - **Cơ chế nối Ans tự động chuẩn Casio ClassWiz (Chained Calculation):**
      - Sau khi có kết quả tính toán (`=`), nếu người dùng bấm toán tử nhị phân hoặc hậu tố (`+`, `-`, `×`, `÷`, `^`, `²`, `³`, `!`, `%`, `⁻¹`), biểu thức tự động bắt đầu bằng `Ans + ...`.
      - Nếu người dùng bấm phím số, hàm hoặc biến mới, biểu thức tự động reset và bắt đầu phép tính mới độc lập.
      - Bấm phím điều hướng `▲`/`▼`/`◀`/`▶` giữ nguyên biểu thức để chỉnh sửa tiếp mà không bị mất.
    - **Lưu trữ biến nhớ qua phím `STO`:**
      - Hỗ trợ phím `[STO]` gán kết quả tính toán vào các biến nhớ $A, B, C, D, E, F, x, y, M$ và cập nhật icon $M$ trên LCD.
    - **Xử lý an toàn các tính năng chưa hỗ trợ:**
      - Các tính năng chưa triển khai (Mode 7 Distribution, Mode 8 Spreadsheet, Mode B Inequality, Mode C Ratio, hàm $\int dx$, $d/dx$, `CALC`) được bắt an toàn và hiển thị `Not Supported` trên màn hình thay vì làm sập UI hay ném ngoại lệ chưa xử lý.
  - **Kiểm thử tích hợp & Đo lường thực tế:**
    - Tạo mới [`tests/integration/CalculatorAppIntegration.test.ts`](file:///Users/nam/rea_casio580vnx/tests/integration/CalculatorAppIntegration.test.ts) (9 tests pass).
    - Toàn bộ test suite: **31 test files, 445/445 tests pass 100%** (~737ms).
    - TypeScript compiler (`tsc --noEmit`): 0 lỗi.
    - Vite production build (`tsc && vite build`): bundle tạo thành công trong 52ms.
  - **Tài liệu bàn giao:**
    - Tài liệu hướng dẫn sử dụng và kiểm thử: [`README.md`](file:///Users/nam/rea_casio580vnx/README.md).
    - Cập nhật tiến độ: [`docs/progress.md`](file:///Users/nam/rea_casio580vnx/docs/progress.md).
    - Tuyên bố giới hạn: Ứng dụng mô phỏng logic toán học, chưa phát hành production và không tuyên bố tương đương 100% phần cứng chip u8 gốc.

---

## Chi tiết trạng thái T14

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Thiết lập và mở rộng bộ kiểm thử tự động toàn diện đa tầng cho toàn bộ hệ thống web app Casio fx-580VN X:
    - **Unit Tests:** Kiểm thử độc lập cho từng module cơ sở (Tokens, Lexer, Parser, Decimal BCD 20 chữ số, Fraction BigInt, CoreMathEngine, Trig, Logarithm, Radical, Complex, LinearSystem, Polynomial, Matrix, Vector, Statistics, Table, Base-N, MemoryStore, HistoryManager, StorageAdapter, ShiftAlphaFSM).
    - **Integration Tests:** Kiểm thử luồng tích hợp luân chuyển dữ liệu:
      - [`tests/integration/EndToEndWorkflow.test.ts`](file:///Users/nam/rea_casio580vnx/tests/integration/EndToEndWorkflow.test.ts): Nhập biểu thức bằng phím bấm $\to$ tính toán $\to$ hiển thị kết quả $\to$ chuỗi tính toán liên tiếp với `Ans` $\to$ chuyển đổi hiển thị $S\Leftrightarrow D$ $\to$ bắt lỗi cú pháp/toán học $\to$ điều hướng lịch sử bằng phím `▲`/`▼`.
    - **Edge Cases & Syntax Errors:**
      - [`tests/parser/EdgeCasesAndErrors.test.ts`](file:///Users/nam/rea_casio580vnx/tests/parser/EdgeCasesAndErrors.test.ts): Biểu thức rỗng hoặc chỉ có khoảng trắng, toán tử nhị phân liên tiếp (`4 * * 2`), toán tử treo ở đuôi (`5 +`), dấu ngoặc rỗng `()`, đóng ngoặc không mở, hàm thiếu đối số, hai số liền nhau không toán tử, lỗi nhiều dấu chấm thập phân (`1.2.3`).
    - **Casio Reference Benchmarks (Bộ kiểm chuẩn độc lập theo sách hướng dẫn fx-580VN X):**
      - [`tests/engine/CasioReferenceBenchmarks.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/CasioReferenceBenchmarks.test.ts): Đối chiếu 41 trường hợp kiểm chuẩn độc lập:
        - BCD Guard Digits: Tránh lỗi làm tròn nhị phân IEEE-754 ($0.1 + 0.2 = 0.3$, $1 - 10 \times 0.1 = 0$, $(1\div 3)\times 3 = 1$).
        - Quy tắc ưu tiên Casio ClassWiz: $6\div 2(1+2) = 1$, $-3^2 = -9$, $(-3)^2 = 9$, $2^{3^2} = 512$, $2\times 3! = 12$, tự động đóng ngoặc đuôi.
        - Giới hạn dung lượng và bắt lỗi: $5\div 0$, $0^0$, $\sqrt{-4}$, tràn số $10^{100}$, giới hạn $69!$ cho phép vs $70!$ báo Math ERROR.
        - Số học phân số & chuyển đổi $S\Leftrightarrow D$: $\frac{2}{3} + \frac{3}{4}\times\frac{5}{6} = \frac{31}{24} \Leftrightarrow 1.291666667$.
        - Rút gọn căn thức: $\sqrt{12}=2\sqrt{3}, \sqrt{75}=5\sqrt{3}, \sqrt{200}=10\sqrt{2}$.
        - Chỉnh hợp & tổ hợp: $5\text{P}2 = 20, 5\text{C}2 = 10, 10\text{C}0 = 1, 10\text{C}10 = 1$.
        - Lượng giác chuẩn: $\sin 30^\circ = 0.5, \cos 60^\circ = 0.5$, triệt tiêu sai số $\sin 180^\circ = 0, \cos 90^\circ = 0, \tan 90^\circ \to \text{Math ERROR}$.
        - Đại số số phức: $(1+2i)(3-i) = 5+5i, |3+4i| = 5, \arg(1+i) = 45^\circ, \text{conj}(3+4i) = 3-4i, (1+i)\div(1-i) = i$.
        - Giải hệ phương trình 2-3 ẩn có nghiệm duy nhất & vô nghiệm.
        - Giải phương trình đa thức bậc 2 & bậc 3 với nghiệm thực và cực trị.
  - **Kết quả thực thi đo lường thực tế:**
    - Tổng số test files: **30 files**.
    - Tổng số tests: **436 tests pass 100%** (0 failed, 0 skipped).
    - Thời gian thực thi: **~682ms** (Vitest v5.0.5 multi-threaded).
    - Kiểm tra type: `tsc --noEmit` đạt 0 lỗi (Exit code: 0).
    - Build kiểm thử: `tsc && vite build` hoàn thành trong 50ms (Exit code: 0).
  - **Phân loại lỗi và tuyên bố giới hạn:**
    - Lập nhật ký phân loại lỗi Defect Log chi tiết (DEF-01 $\to$ DEF-07) phân định rạch ròi lỗi triển khai, lỗi test case và thiếu đặc tả.
    - Tuyên bố minh bạch về giới hạn kiểm chứng: Test pass trên phần mềm không đồng nghĩa với việc tương đương 100% về mặt vi kiến trúc phần cứng chip u8 gốc của Casio.
- **Tài liệu bàn giao:**
  - Bộ kiểm thử: [`tests/integration/EndToEndWorkflow.test.ts`](file:///Users/nam/rea_casio580vnx/tests/integration/EndToEndWorkflow.test.ts), [`tests/parser/EdgeCasesAndErrors.test.ts`](file:///Users/nam/rea_casio580vnx/tests/parser/EdgeCasesAndErrors.test.ts), [`tests/engine/CasioReferenceBenchmarks.test.ts`](file:///Users/nam/rea_casio580vnx/tests/engine/CasioReferenceBenchmarks.test.ts).
  - Chiến lược kiểm thử & Báo cáo: [`docs/test_strategy.md`](file:///Users/nam/rea_casio580vnx/docs/test_strategy.md).
  - Cập nhật tiến độ: [`docs/progress.md`](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T13

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Thiết lập nguồn trạng thái thống nhất và quản lý bộ nhớ độc lập ([`src/state/`](file:///Users/nam/rea_casio580vnx/src/state/)):
    - **`StateManager.ts` (Single Source of Truth):**
      - Quản lý tập trung toàn bộ trạng thái: `DisplayState`, `MemoryStore`, `HistoryManager`, `SetupConfig`, và `StorageManager`.
      - Hỗ trợ cơ chế Observer (`subscribe`) cho phép giao diện hoặc các thành phần lắng nghe tự động cập nhật khi trạng thái thay đổi.
    - **`MemoryStore.ts` (Tách biệt bộ nhớ tính toán khỏi UI):**
      - Quản lý 9 biến nhớ do người dùng định nghĩa (`A, B, C, D, E, F, x, y, M`) và biến kết quả gần nhất `Ans` dưới dạng [`CalculationResult`](file:///Users/nam/rea_casio580vnx/src/engine/result.ts).
      - Xử lý các phép toán trên bộ nhớ: phím `M+` ($M = M + \text{val}$), phím `M-` ($M = M - \text{val}$).
      - Tự động bật/tắt icon `M` trên thanh trạng thái LCD (`statusFlags.hasMemory = true` khi $M \ne 0$).
      - Cung cấp cơ chế reset biến nhớ giữ lại `Ans` hoặc reset sạch toàn bộ.
    - **`HistoryManager.ts` (Lịch sử tính toán Replay Ring Buffer):**
      - Hàng đợi vòng giới hạn 50 mục tính toán gần nhất.
      - Điều hướng Replay hai chiều chuẩn Casio: phím `▲` (`navigateUp`) duyệt ngược về phép tính cũ; phím `▼` (`navigateDown`) duyệt xuôi về phép tính mới hoặc quay lại màn hình nhập trống.
      - Tự động cập nhật các cờ mũi tên `scrollUp` (icon ▲) và `scrollDown` (icon ▼) trên LCD.
      - Phím `AC` chỉ xóa vùng đệm hiển thị hiện tại, **không xóa lịch sử tính toán** (bấm `▲` sau AC vẫn gọi lại phép tính trước).
    - **`StorageAdapter.ts` & `security.ts` (Lưu trữ an toàn & Phòng chống XSS):**
      - Khóa lưu trữ: `'casio_fx580vnx_state_v1'`.
      - Xử lý lỗi ngoại lệ an toàn: Bắt lỗi `SecurityError` (khi trình duyệt chặn cookies/storage ở chế độ ẩn danh) và `QuotaExceededError`, tự động fallback sang `MemoryStorageBackend` mà không làm crash ứng dụng.
      - Xác thực schema nghiêm ngặt: Kiểm tra cấu trúc JSON, số hiệu phiên bản `version === 1`, kiểu dữ liệu các biến, cấu hình cài đặt và mảng lịch sử. Tự động loại bỏ dữ liệu bị can thiệp.
      - Phòng chống XSS: Lọc sạch control characters, null bytes, thẻ `<script>`, `javascript:` và escape HTML entities. Giao diện LCD vẽ trên Canvas (`fillText`), không dùng `innerHTML` với chuỗi do người dùng nhập.
    - **Tích hợp sâu vào `InputDispatcher`:**
      - Đồng bộ hóa các thao tác phím `▲`, `▼`, `M+`, `M-`, `AC`, `=`, và `RESET` (SHIFT 9) trực tiếp với `StateManager`.
  - **Kiểm thử tự động Vitest toàn diện:**
    - `tests/state/MemoryStore.test.ts` (6 tests pass)
    - `tests/state/HistoryManager.test.ts` (5 tests pass)
    - `tests/state/StorageAdapter.test.ts` (6 tests pass)
    - `tests/state/StateManager.test.ts` (5 tests pass)
    - `tests/state/StateIntegration.test.ts` (4 tests pass)
    - Toàn bộ suite dự án: **377/377 tests pass 100% (27/27 test files)**.
  - TypeScript `tsc --noEmit` và Vite production build đạt 0 lỗi (54ms).
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/state/`, `src/input/InputDispatcher.ts`.
  - Tests: `tests/state/`.
  - Tài liệu kỹ thuật: [docs/state_and_storage_api.md](file:///Users/nam/rea_casio580vnx/docs/state_and_storage_api.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T12

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Triển khai riêng biệt 3 mode tính toán nâng cao theo danh mục tính năng (`FEAT-MOD-09`, `FEAT-MOD-03`, `FEAT-MOD-06`):
    - **Mode 9: Table of Values (`src/modes/table/`):**
      - `TableGenerator.ts`: Thuật toán sinh bảng giá trị cho $f(x)$ độc lập (tối đa 45 dòng) hoặc cả $f(x)$ và $g(x)$ (tối đa 30 dòng). Dùng `Decimal` khử trôi sai số tích lũy bước nhảy thập phân (`0.1, 0.2...`). Xử lý lỗi cục bộ từng ô (hiển thị `"ERROR"`) không làm crash toàn bảng. Kiểm tra ràng buộc $step > 0$, $end \ge start$, giới hạn số dòng.
      - `TableMode.ts`: Bộ điều khiển quản lý cấu hình bảng, thiết lập phạm vi, tạo bảng và truy xuất dòng dữ liệu.
    - **Mode 3: Base-N (`src/modes/baseN/`):**
      - `BaseNConverter.ts`: Kiến trúc số nguyên bù 2 (Two's Complement) 32-bit ($-2^{31}$ đến $2^{31}-1$). Phân tích cú pháp và định dạng chuỗi hiển thị theo 4 hệ cơ số `DEC`, `HEX`, `BIN`, `OCT`. Kiểm tra tính hợp lệ của ký tự nhập và phát hiện lỗi tràn số `OVERFLOW`.
      - `BaseNEngine.ts`: Các phép toán số học đại số (+, -, ×, ÷ chia nguyên làm tròn về 0, chia cho 0 `Math ERROR`) và các toán tử logic bitwise (`and`, `or`, `xor`, `xnor`, `not`, `neg`).
      - `BaseNMode.ts`: Bộ điều khiển hỗ trợ chuyển đổi cơ số tức thì trên kết quả hiện tại và thực thi các phép toán logic/số học.
    - **Mode 6: Statistics (`src/modes/statistics/`):**
      - `Stat1Var.ts`: Thống kê mô tả 1 biến: $n, \sum x, \sum x^2, \bar{x}, \sigma_x^2, \sigma_x, s_x^2, s_x$ (chỉ tính khi $n \ge 2$), tóm tắt 5 số ($\min, Q_1, \text{Med}, Q_3, \max$) với thuật toán loại trừ trung vị khi $n$ lẻ theo chuẩn Casio ClassWiz.
      - `Stat2Var.ts`: Thống kê 2 biến và mô hình hồi quy tuyến tính $y = a + bx$: $n, \sum x, \sum y, \sum x^2, \sum y^2, \sum xy, \bar{x}, \bar{y}, \sigma_x, s_x, \sigma_y, s_y$, hệ số chặn $a$, hệ số góc $b$ ($S_{xx} = 0 \rightarrow$ ném lỗi), hệ số tương quan Pearson $r$.
      - `StatisticsMode.ts`: Bộ điều khiển quản lý lưới dữ liệu, tần số, tính toán thống kê và hàm ước lượng $\hat{y}(x), \hat{x}(y)$.
    - **Tích hợp InputDispatcher:**
      - Cung cấp accessors `getTableMode()`, `getBaseNMode()`, `getStatisticsMode()`.
      - Hỗ trợ chuyển mode `dispatcher.setMode('TABLE' | 'BASE-N' | 'STATISTICS')`.
  - **Kiểm thử tự động Vitest toàn diện:**
    - `tests/modes/Table.test.ts` (8 tests pass)
    - `tests/modes/BaseN.test.ts` (19 tests pass)
    - `tests/modes/Statistics.test.ts` (10 tests pass)
    - `tests/modes/AdvancedModesIntegration.test.ts` (5 tests pass)
    - Toàn bộ suite dự án: **351/351 tests pass 100% (22/22 test files)**.
  - TypeScript `tsc --noEmit` và Vite production build đạt 0 lỗi (51ms).
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/modes/table/`, `src/modes/baseN/`, `src/modes/statistics/`, `src/input/InputDispatcher.ts`.
  - Tests: `tests/modes/Table.test.ts`, `tests/modes/BaseN.test.ts`, `tests/modes/Statistics.test.ts`, `tests/modes/AdvancedModesIntegration.test.ts`.
  - Tài liệu kỹ thuật: [docs/modes_table_basen_statistics_api.md](file:///Users/nam/rea_casio580vnx/docs/modes_table_basen_statistics_api.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T11

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Triển khai riêng biệt 3 mode tính toán nâng cao theo danh mục tính năng (`FEAT-MOD-10`, `FEAT-MOD-04`, `FEAT-MOD-05`):
    - **Mode A: Equation/Func (`src/modes/equation/`):**
      - `linearSystem.ts`: Giải hệ phương trình bậc nhất 2, 3, 4 ẩn bằng phương pháp khử toàn phần Gauss-Jordan trên phân số chính xác `Fraction`. Tự động phân loại 3 trạng thái nghiệm chuẩn mực Casio: `UNIQUE` (nghiệm duy nhất), `NO_SOLUTION` (vô nghiệm), `INFINITE` (vô số nghiệm).
      - `polynomial.ts`: Giải phương trình đa thức bậc 2, 3, 4 với thuật toán riêng biệt cho từng bậc (không gộp chung một thuật toán):
        - Bậc 2: Biệt thức $\Delta = b^2 - 4ac$, nghiệm thực/phức, tọa độ đỉnh cực trị Parabol (Min/Max).
        - Bậc 3: Phương pháp lượng giác Viète (3 nghiệm thực) và đại số Cardano (1 nghiệm thực, 2 nghiệm phức liên hợp), điểm cực trị địa phương (Local Max/Min) qua đạo hàm bậc nhất và bậc hai.
        - Bậc 4: Phân rã trùng phương hoặc phương pháp Ferrari phân rã thành 2 đa thức bậc hai thông qua phương trình bậc ba bổ trợ (Resolvent cubic).
      - `EquationMode.ts`: Quản lý trạng thái và tương tác người dùng của Mode Equation.
    - **Mode 4: Matrix (`src/modes/matrix/`):**
      - `Matrix.ts`: Biểu diễn ma trận kích thước từ $1\times 1$ đến $4\times 4$ trên nền tảng `Fraction`. Hỗ trợ các phép toán: cộng, trừ, nhân ma trận, nhân vô hướng, lũy thừa bậc 2 và bậc 3 ($A^2, A^3$), chuyển vị ($A^T$), định thức $\det(A)$, nghịch đảo $A^{-1}$ (Gauss-Jordan trên $[A|I]$).
      - Bắt lỗi chuẩn mực: Kích thước không tương thích $\rightarrow$ ném `DimensionError` (`Dimension ERROR`); ma trận suy biến ($\det = 0$) khi lấy nghịch đảo $\rightarrow$ ném `MathError` (`Math ERROR`).
      - `MatrixMode.ts`: Quản lý 4 vùng nhớ ma trận `MatA`, `MatB`, `MatC`, `MatD` và tự động cập nhật kết quả vào `MatAns`.
    - **Mode 5: Vector (`src/modes/vector/`):**
      - `Vector.ts`: Biểu diễn véc-tơ 2 chiều (2D) và 3 chiều (3D) chính xác. Hỗ trợ các phép toán: cộng, trừ, nhân vô hướng, tích vô hướng (Dot product), tích có hướng (Cross product - chỉ định nghĩa cho 3D, nếu gọi trên 2D sẽ ném `DimensionError`), độ dài ($|u|$), góc giữa 2 véc-tơ ($\theta$ theo DEG/RAD/GRA), véc-tơ đơn vị ($u/|u|$).
      - Bắt lỗi chuẩn mực: Sai lệch số chiều $\rightarrow$ `Dimension ERROR`; góc hoặc chuẩn hóa với véc-tơ không $\rightarrow$ `Math ERROR`.
      - `VectorMode.ts`: Quản lý 4 vùng nhớ véc-tơ `VctA`, `VctB`, `VctC`, `VctD` và lưu kết quả vào `VctAns`.
    - **Hạ tầng lỗi & UI Dispatcher:**
      - Thêm `DimensionError` vào `src/engine/errors.ts`.
      - Cập nhật [`src/input/InputDispatcher.ts`](file:///Users/nam/rea_casio580vnx/src/input/InputDispatcher.ts): cung cấp accessors `getEquationMode()`, `getMatrixMode()`, `getVectorMode()`, `setMode()`; bắt và hiển thị đúng `Dimension ERROR` trên màn hình LCD.
  - **Kiểm thử tự động Vitest toàn diện:**
    - `tests/modes/LinearSystem.test.ts` (11 tests pass)
    - `tests/modes/Polynomial.test.ts` (15 tests pass)
    - `tests/modes/Matrix.test.ts` (20 tests pass)
    - `tests/modes/Vector.test.ts` (20 tests pass)
    - `tests/modes/ModesIntegration.test.ts` (6 tests pass)
    - Toàn bộ suite dự án: **309/309 tests pass 100% (18/18 test files)**.
  - TypeScript `tsc --noEmit` và Vite production build đạt 0 lỗi (49ms).
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/modes/`, `src/engine/errors.ts`, `src/input/InputDispatcher.ts`.
  - Tests: `tests/modes/`.
  - Tài liệu kỹ thuật: [docs/modes_equation_matrix_vector_api.md](file:///Users/nam/rea_casio580vnx/docs/modes_equation_matrix_vector_api.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T10

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Mở rộng kiến trúc toán học mà không tạo evaluator thứ hai, tận dụng `CoreMathEngine` duy nhất trong `src/engine/evaluator.ts`.
  - Triển khai các module toán học bổ sung:
    - `src/engine/trig.ts`: Lượng giác (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`), đơn vị góc (`DEG`, `RAD`, `GRA`), làm sạch sai số điểm 0 ($|x| < 10^{-14} \rightarrow 0$), chặn miền xác định ($\tan(90^\circ)$, $\sin^{-1}(|x|>1) \rightarrow$ `Math ERROR`), chuyển đổi DMS (`dmsToDecimalDegrees`).
    - `src/engine/logarithm.ts`: Logarit tự nhiên `ln(x)`, logarit thập phân `log(x)`, logarit cơ số bất kỳ `log(a, b) = ln(b)/ln(a)`, hàm mũ tự nhiên `e^(x)`. Bắt lỗi $x \le 0$, $a \le 0$, $a = 1$.
    - `src/engine/complex.ts`: Số phức `ComplexNumber` ($a + bi$), phép toán cộng, trừ, nhân, chia, mô-đun $|z|$, góc pha argument $\arg(z)$ theo đơn vị góc, liên hợp phức $\bar{z}$, chuyển đổi sang tọa độ cực $r\angle\theta$, `ComplexResult`.
    - Rút gọn căn thức đại số (`FEAT-MTH-03`): Tách thừa số bình phương lớn nhất $n = k^2 \times m$, hiển thị dạng tối giản `k√m` (ví dụ $\sqrt{12} = 2\sqrt{3}$, $\sqrt{75} = 5\sqrt{3}$, $\sqrt{50} = 5\sqrt{2}$), hỗ trợ chuyển đổi S<=>D với số thập phân.
    - Cấu hình đơn vị góc trong `CoreMathEngine`: hỗ trợ `setAngleUnit(unit)`, `getAngleUnit()`, `EvaluationContext.angleUnit`.
  - Kiểm thử tự động Vitest toàn diện:
    - `tests/engine/Trig.test.ts` (28 tests pass)
    - `tests/engine/Logarithm.test.ts` (24 tests pass)
    - `tests/engine/Complex.test.ts` (25 tests pass)
    - `tests/engine/Radical.test.ts` (10 tests pass)
    - `tests/engine/Integration.test.ts` (24 tests pass - tích hợp qua Parser)
    - Tổng cộng toàn bộ project: **237/237 tests pass 100%**.
  - TypeScript `tsc --noEmit` và Vite production build đạt 0 lỗi (82ms).
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/engine/trig.ts`, `src/engine/logarithm.ts`, `src/engine/complex.ts`, `src/engine/result.ts`, `src/engine/evaluator.ts`, `src/engine/index.ts`.
  - Tests: `tests/engine/Trig.test.ts`, `tests/engine/Logarithm.test.ts`, `tests/engine/Complex.test.ts`, `tests/engine/Radical.test.ts`, `tests/engine/Integration.test.ts`.
  - Tài liệu API: [docs/additional_math_modules_api.md](file:///Users/nam/rea_casio580vnx/docs/additional_math_modules_api.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T09

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Thiết kế và triển khai module tính toán toán học lõi (`src/engine/`):
    - `src/engine/fraction.ts`: Lớp phân số chính xác tuyệt đối sử dụng `BigInt`, tự động tối giản thông qua thuật toán GCD, hỗ trợ hỗn số và chuyển đổi số thập phân làm tròn nửa lên.
    - `src/engine/decimal.ts`: Lớp số thập phân độ chính xác cao theo mô hình BCD (20 chữ số có nghĩa gồm 15 chữ số nội bộ + 5 chữ số bảo vệ), loại bỏ hoàn toàn sai số dấu chấm động IEEE 754 (`0.1 + 0.2 = 0.3`, `1/3 × 3 = 1`), kiểm tra ngưỡng tràn số $|x| \ge 10^{100}$ (`OVERFLOW`) và dưới ngưỡng $0 < |x| < 10^{-99}$ (làm tròn về 0).
    - `src/engine/errors.ts`: Lớp `MathError` có cấu trúc với các mã lỗi chuẩn Casio (`DIVISION_BY_ZERO`, `OVERFLOW`, `UNDERFLOW`, `INVALID_POWER`, `INVALID_FACTORIAL`, `INVALID_PERM_COMB`, `MATH_ERROR`).
    - `src/engine/result.ts`: Lớp `CalculationResult` lưu trữ lưỡng thể cả phân số chính xác và số thập phân, hỗ trợ chuyển đổi linh hoạt bằng phím `[S<=>D]`, định dạng theo 4 chế độ: `Norm 1`, `Norm 2`, `Fix`, `Sci`.
    - `src/engine/evaluator.ts`: Bộ máy đánh giá duyệt cây AST (`CoreMathEngine`), thực hiện 4 phép tính cơ bản, số âm, lũy thừa, phân số, toán tử hậu tố (`!`, `²`, `³`, `⁻¹`, `%`), chỉnh hợp/tổ hợp (`nPr`, `nCr`), hàm cơ bản (`√`, `abs`, `root`), biến nhớ và `Ans`.
  - Kết nối trực tiếp vào giao diện người dùng:
    - Cập nhật [`src/input/InputDispatcher.ts`](file:///Users/nam/rea_casio580vnx/src/input/InputDispatcher.ts) để khi bấm phím `=` hoặc `Enter`, máy tự động tính toán biểu thức hiển thị lên LCD, bắt lỗi hiển thị `Math ERROR` / `Syntax ERROR`, và bấm phím `S<=>D` chuyển đổi giữa phân số và số thập phân.
  - Phân tách hoàn toàn tính toán khỏi UI: Module engine chạy độc lập không phụ thuộc DOM hay Canvas.
  - Kiểm thử tự động Vitest:
    - `tests/engine/Fraction.test.ts` (8 tests pass)
    - `tests/engine/Decimal.test.ts` (9 tests pass)
    - `tests/engine/Evaluator.test.ts` (43 tests pass)
    - Toàn bộ test suite dự án: **126/126 tests pass 100%**.
  - TypeScript `tsc --noEmit` và Vite production build đạt 0 lỗi (45ms).
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/engine/errors.ts`, `src/engine/fraction.ts`, `src/engine/decimal.ts`, `src/engine/result.ts`, `src/engine/evaluator.ts`, `src/engine/index.ts`.
  - Cập nhật: `src/input/InputDispatcher.ts`.
  - Tests: `tests/engine/Fraction.test.ts`, `tests/engine/Decimal.test.ts`, `tests/engine/Evaluator.test.ts`.
  - Tài liệu kỹ thuật: [docs/precision_and_rounding.md](file:///Users/nam/rea_casio580vnx/docs/precision_and_rounding.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

---

## Chi tiết trạng thái T08

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Thiết kế và triển khai module phân tích cú pháp biểu thức toán học độc lập (`src/parser/`):
    - `src/parser/ast.ts`: Định nghĩa hệ thống kiểu cây cú pháp trừu tượng (Pure Data AST) gồm `NumberNode`, `VariableNode`, `ConstantNode`, `UnaryOpNode`, `PostfixOpNode`, `BinaryOpNode`, `ImplicitMulNode`, `FractionNode`, `FunctionCallNode`, `ParenthesisNode` kèm thông tin tọa độ `SourceLocation` (`start`, `end`).
    - `src/parser/tokens.ts`: Định nghĩa danh mục Token chuẩn hóa cho 21 loại từ vựng toán học.
    - `src/parser/errors.ts`: Lớp `CasioSyntaxError` ném lỗi có cấu trúc (`code`, `position`, `length`, `message`, `rawExpression`) phục vụ hiển thị con trỏ lỗi trên LCD.
    - `src/parser/lexer.ts`: Bộ phân tích từ vựng hỗ trợ chuẩn hóa ký tự Unicode toán học (`−`, `×`, `÷`, `²`, `³`, `⁻¹`, `π`, `e`, `√`, `°`, `!`, `%`), ký pháp khoa học `×10^`, hằng số, biến nhớ và phân biệt biến `C`/`P` với tổ hợp/chỉnh hợp.
    - `src/parser/parser.ts`: Pratt Parser (Top-Down Operator Precedence) theo đúng thứ tự ưu tiên chuẩn Casio fx-580VN X:
      1. Phân biệt chính xác dấu trừ một ngôi (Unary minus) và hai ngôi (Binary minus).
      2. Quy tắc Casio: Lũy thừa có độ ưu tiên cao hơn dấu trừ âm (`-3^2 = -(3^2) = -9`, `(-3)^2 = 9`, `-3² = -9`).
      3. Lũy thừa kết hợp phải (`2^3^4 = 2^(3^4)`).
      4. Phép nhân ngầm định Loại A (`2π`, `2x`, `2sin(30)`, `1÷2x = 1/(2x)`) ưu tiên cao hơn $n\text{P}r/n\text{C}r$ và $\times, \div$.
      5. Phép nhân ngầm định Loại B (`6÷2(1+2) = 1`, `(2+3)(4+5)`) ưu tiên cao hơn phép nhân chia tường minh `6÷2×(1+2) = 9`.
      6. Hỗ trợ phân số chính tắc `⌟`, chỉnh hợp $n\text{P}r$, tổ hợp $n\text{C}r$, hàm nhiều tham số `log(a, b)`, `root(n, x)`.
      7. Cơ chế tự động đóng dấu ngoặc đơn ở cuối biểu thức (Trailing Parenthesis Auto-Close).
      8. Chặn hoàn toàn hai số liền nhau không toán tử (`2 3`), hai toán tử hai ngôi liên tiếp (`2 + × 3`), dấu ngoặc rỗng `()`, hàm rỗng `sin()`.
  - Tuyệt đối tách biệt Parsing khỏi Evaluation: Không sử dụng `eval()` hay `new Function()`.
  - Kiểm thử tự động Vitest:
    - `tests/parser/Lexer.test.ts` (10 tests pass)
    - `tests/parser/Parser.test.ts` (37 tests pass)
    - Toàn bộ test suite dự án: **66/66 tests pass 100%**.
  - TypeScript `tsc --noEmit` và Vite production build thành công 0 lỗi.
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/parser/ast.ts`, `src/parser/tokens.ts`, `src/parser/errors.ts`, `src/parser/lexer.ts`, `src/parser/parser.ts`, `src/parser/index.ts`.
  - Tests: `tests/parser/Lexer.test.ts`, `tests/parser/Parser.test.ts`.
  - Tài liệu cú pháp: [docs/parser_syntax.md](file:///Users/nam/rea_casio580vnx/docs/parser_syntax.md).
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md).

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Mục tiêu đạt được:**
  - Khởi tạo project thành công với Vite + TypeScript + Vitest.
  - Xây dựng component giao diện máy tính:
    - `src/ui/LcdScreen.ts`: Màn hình Canvas 2D ma trận điểm 192 × 63 dots pixelated, dải icon trạng thái (`S, A, D, Math`), con trỏ nhấp nháy 500ms, dòng biểu thức và kết quả.
    - `src/ui/KeypadView.ts`: Bàn phím 50 phím bấm chính xác theo sơ đồ xác minh từ `classwiz_p20.dll`, nhãn Shift vàng, nhãn Alpha đỏ, cụm D-pad kim loại.
    - `src/ui/CalculatorApp.ts`: Thân vỏ máy tính tích hợp, logo Casio fx-580VN X ClassWiz, pin mặt trời giả lập, lắng nghe sự kiện phím PC.
    - `style.css`: Giao diện chân thực, responsive cho cả Desktop và Mobile (touch target $\ge 44$px).
  - Xây dựng hệ thống nhập liệu chuẩn hóa:
    - `src/input/KeyMatrixMap.ts`: Danh mục 50 phím cứng chuẩn xác kèm ma trận phần cứng và hàm phân giải hành động `resolveKeyAction`.
    - `src/input/ShiftAlphaFSM.ts`: Máy trạng thái FSM điều khiển `NORMAL`, `SHIFT`, `ALPHA` tự động hoàn trả sau khi bấm phím chức năng.
    - `src/input/InputDispatcher.ts`: Chuẩn hóa mọi tương tác (Mouse Click, Touch, PC Keyboard) thành cùng một cấu trúc `NormalizedInputEvent`, điều hướng con trỏ, xóa `DEL`, xóa trắng `AC`.
  - Phân tách tuyệt đối giữa UI/Input với Math Engine (không viết math engine, không tạo mode tính toán giả).
  - Kiểm thử tự động:
    - `tests/KeyMatrixMap.test.ts` (7 tests pass)
    - `tests/ShiftAlphaFSM.test.ts` (6 tests pass)
    - `tests/InputDispatcher.test.ts` (6 tests pass)
    - Tổng cộng: **19/19 tests pass 100%**.
  - TypeScript type check (`tsc --noEmit`) đạt 0 lỗi. Build production `dist/` thành công.
- **Tài liệu bàn giao:**
  - Mã nguồn: `src/types/`, `src/input/`, `src/ui/`, `src/main.ts`, `style.css`, `index.html`.
  - Tests: `tests/KeyMatrixMap.test.ts`, `tests/ShiftAlphaFSM.test.ts`, `tests/InputDispatcher.test.ts`.
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md)

---

## Chi tiết trạng thái T06

- **Trạng thái:** Hoàn thành (Không bị chặn).
- **Tài liệu bàn giao:**
  - [docs/architecture.md](file:///Users/nam/rea_casio580vnx/docs/architecture.md)
  - [docs/implementation_plan.md](file:///Users/nam/rea_casio580vnx/docs/implementation_plan.md)
  - [docs/progress.md](file:///Users/nam/rea_casio580vnx/docs/progress.md)

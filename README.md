# Casio fx-580VN X ClassWiz Web App

Dự án ứng dụng web mô phỏng máy tính khoa học **Casio fx-580VN X ClassWiz** chạy hoàn toàn trên trình duyệt (Client-Side Single Page Application), xây dựng bằng TypeScript, HTML5 Canvas 2D, và Vite.

---

## 1. Kiến Trúc Hệ Thống (Architecture)

Ứng dụng tuân thủ kiến trúc phân tầng 7 lớp độc lập (Separation of Concerns):
1. **Tầng 1 (Presentation):** Màn hình LCD Canvas 2D ma trận điểm $192 \times 63$ dots pixelated, dải icon trạng thái (`S, A, D, FIX, SCI, Math, M, ▲, ▼`), thân vỏ máy tính và cụm bàn phím 50 phím.
2. **Tầng 2 (Hardware Input & Key Mapping):** Bộ giải mã phím `KeyMatrixMap`, máy trạng thái chuyển đổi `ShiftAlphaFSM` (`NORMAL, SHIFT, ALPHA`) và ánh xạ phím tắt máy tính PC.
3. **Tầng 3 (Central Dispatcher):** `InputDispatcher` điều phối sự kiện nhập liệu chuột, cảm ứng chạm đa điểm và bàn phím máy tính.
4. **Tầng 4 (Parser & Lexer):** Pratt Parser (Top-Down Operator Precedence) tuân thủ quy tắc ưu tiên toán tử Casio ClassWiz: phân biệt Unary/Binary minus, nhân ngầm Loại A & B, lũy thừa kết hợp phải, tự động đóng ngoặc.
5. **Tầng 5 (Core Math Engine):** Kết hợp phân số chính xác vô hạn `Fraction` (BigInt), số thực `Decimal` với 20 chữ số bảo vệ (Guard Digits BCD), hàm lượng giác DEG/RAD/GRA, logarit và số phức.
6. **Tầng 6 (Calculator Modes):**
   - **Mode 1 (COMP):** Tính toán số học cơ bản và đại số.
   - **Mode 2 (COMPLEX):** Đại số số phức ($a+bi$, liên hợp, argument, mô-đun).
   - **Mode 3 (BASE-N):** Hệ cơ số DEC, HEX, BIN, OCT số nguyên bù 2 (32-bit).
   - **Mode 4 (MATRIX):** Ma trận kích thước $1\times 1 \to 4\times 4$ (cộng, trừ, nhân, chuyển vị, định thức, ma trận nghịch đảo).
   - **Mode 5 (VECTOR):** Véc-tơ 2D/3D (tích vô hướng, tích có hướng, độ lớn).
   - **Mode 6 (STATISTICS):** Thống kê 1 biến và 2 biến hồi quy tuyến tính.
   - **Mode 9 (TABLE):** Bảng giá trị hàm số $f(x)$ và $g(x)$.
   - **Mode A (EQUATION):** Hệ phương trình 2–4 ẩn, phương trình đa thức bậc 2–4 và tìm cực trị parabol/bậc 3.
7. **Tầng 7 (State & Storage):** `StateManager` (Single Source of Truth), `MemoryStore` ($A-F, x, y, M, \text{Ans}$), `HistoryManager` (Replay ring buffer 50 mục) và `StorageAdapter` (Xác thực schema, phòng vệ XSS).

---

## 2. Yêu Cầu Môi Trường & Khởi Chạy

### 2.1. Yêu cầu hệ thống
- **Node.js:** $\ge$ v18.0.0 (khuyến nghị v20+)
- **Trình quản lý gói:** `npm` $\ge$ 9.0.0

### 2.2. Hướng dẫn khởi chạy môi trường phát triển (Development)
```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy Vite Dev Server tại cổng 3000
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

### 2.3. Hướng dẫn Build kiểm thử đóng gói (Production Build)
```bash
# Kiểm tra kiểu TypeScript tĩnh
npm run typecheck

# Đóng gói bản build production vào thư mục dist/
npm run build

# Xem thử bản build production cục bộ
npm run preview
```

---

## 3. Chạy Kiểm Thử Tự Động (Automated Test Suite)

Dự án sử dụng **Vitest** làm test runner với 31 test files độc lập:

```bash
# Chạy toàn bộ test suite (chạy một lần)
npm test

# Chạy test ở chế độ theo dõi (watch mode)
npx vitest

# Chạy riêng kiểm chuẩn tham chiếu Casio
npx vitest run tests/engine/CasioReferenceBenchmarks.test.ts
```

**Kết quả kiểm thử thực tế:**
- **31 test files passed (100%)**
- **445 tests passed (100%)**
- 0 failed, 0 skipped. Thời gian chạy: ~737ms.

---

## 4. Danh Sách Tính Năng Đã Tích Hợp & Chưa Hỗ Trợ

### 4.1. Tính năng đã tích hợp hoàn chỉnh (Integrated)
- Bàn phím 50 phím bấm chính xác theo sơ đồ phần cứng Casio fx-580VN X.
- Màn hình ma trận điểm Canvas 2D có đầy đủ dải icon trạng thái (`S, A, D, Math, M, ▲, ▼`).
- Hỗ trợ gõ phím từ bàn phím máy tính PC (Phím số, `+`, `-`, `*`, `/`, `Enter` cho `=`, `Backspace` cho `DEL`, `Escape` cho `AC`, mũi tên điều hướng).
- Menu chuyển đổi Mode trực quan qua phím `[MENU]` (1: COMP, 2: COMPLEX, 3: BASE-N, 4: MATRIX, 5: VECTOR, 6: STATISTICS, 9: TABLE, A: EQUATION).
- Cơ chế tự động nối `Ans` khi bấm toán tử sau khi có kết quả tính toán.
- Chuyển đổi hiển thị $S\Leftrightarrow D$ giữa phân số tối giản và số thập phân.
- Lưu biến nhớ `STO` vào các biến $A, B, C, D, E, F, x, y, M$.
- Phím nhớ $M+$ và $M-$, hiển thị icon $M$ khi $M \ne 0$.
- Lịch sử tính toán 50 mục, gọi lại bằng phím `▲` và `▼`.
- Bắt lỗi an toàn (`Syntax ERROR`, `Math ERROR`, `Dimension ERROR`) không làm sập giao diện.

### 4.2. Tính năng chưa tích hợp / Chưa hỗ trợ (Not Supported)
- **Mode 7 (Distribution / Phân phối xác suất):** Chưa triển khai.
- **Mode 8 (Spreadsheet / Bảng tính ma trận ô):** Chưa triển khai.
- **Mode B (Inequality / Bất phương trình):** Chưa triển khai.
- **Mode C (Ratio / Tỉ lệ thức):** Chưa triển khai.
- **Hàm tích phân số $\int dx$ & Đạo hàm $d/dx$:** Engine chưa hỗ trợ tính tích phân giải tích/số. Khi bấm sẽ hiển thị `Not Supported`.
- **Cú pháp chuỗi Độ-Phút-Giây liên tiếp ($D^\circ M' S''$):** Lexer hiện tại mới hỗ trợ ký tự đơn `°`.
- **QR Code Menu:** Chưa triển khai trích xuất mã QR Casio Web Services.

---

## 5. Báo Cáo Bảo Mật & Đánh Giá An Ninh (Security Highlights)

- **Zero Runtime Dependencies:** Toàn bộ Core Math Engine, Parser, Fraction, Decimal và State Manager đều là code thuần tự xây dựng, không phụ thuộc vào thư viện bên ngoài ở runtime.
- **Không sử dụng `eval()` hoặc `new Function()`:** Tuyệt đối không thực thi mã động từ biểu thức toán học. Mọi biểu thức đều đi qua Lexer $\to$ Pratt Parser $\to$ AST Evaluator an toàn.
- **Chống DOM-based XSS:** Biểu thức và kết quả được vẽ trực tiếp lên HTML5 Canvas 2D ma trận điểm, không đưa dữ liệu người dùng vào DOM HTML.
- **Vệ sinh lưu trữ:** Hệ thống xác thực schema JSON và lọc sạch các script nguy hại trước khi lưu trữ vào `localStorage`.
- **Accessibility & Responsive:** Phím bấm có `aria-label`, chuẩn hóa touch target $\ge 44$px trên thiết bị di động theo chuẩn WCAG 2.1.
- Chi tiết báo cáo kiểm toán bảo mật: Xem [`docs/security_and_release_audit.md`](file:///Users/nam/rea_casio580vnx/docs/security_and_release_audit.md).

---

## 6. Tuyên Bố Giới Hạn & Bản Quyền (Disclaimers & IP Notice)

- **Về tính tương đương phần cứng:** Ứng dụng web này là dự án phần mềm mô phỏng thuật toán toán học logic của máy tính Casio ClassWiz fx-580VN X theo tài liệu chính thức. Ứng dụng **không tương đương 100% về mặt vi kiến trúc phần cứng** (vi mã microcode, độ trễ chu kỳ xung nhịp CPU 8-bit Casio u8 gốc, hoặc các lỗi phần cứng pin yếu).
- **Về nhãn hiệu và bản quyền (Trademark Notice):** *CASIO* và *ClassWiz* là nhãn hiệu đã đăng ký của Casio Computer Co., Ltd. Dự án này được phát triển hoàn toàn độc lập cho mục đích giáo dục và nghiên cứu học thuật, không liên kết, tài trợ hay được ủy quyền bởi Casio Computer Co., Ltd.
- **Không phân phối binary gốc:** Bản phát hành web không chứa và không phân phối bất kỳ file binary, mã nguồn hoặc tài sản độc quyền nào trích xuất từ phần mềm gốc của Casio.

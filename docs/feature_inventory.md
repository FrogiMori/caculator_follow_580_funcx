# Danh Mục Chức Năng Cần Tái Triển Khai (Casio fx-580VN X Web App)

**Mã tài liệu:** `docs/feature_inventory.md`  
**Dự án:** Trình giả lập / Web App Casio fx-580VN X  
**Ngày lập:** 24/10/2026 (Nhiệm vụ T05)  
**Căn cứ bằng chứng:**
- `docs/reverse_engineering_notes.md` (Báo cáo tổng hợp RE)
- `docs/reverse_engineering/simu8_cpu_core.md` (Lõi CPU u8, thanh ghi, ALU `instCalc`, cờ `PSW`)
- `docs/reverse_engineering/memory_and_bus_architecture.md` (Bản đồ bộ nhớ ROM 256KB, RAM, LCD VRAM `0xF800`, I/O bàn phím)
- `docs/reverse_engineering/classwiz_hardware_interface.md` (Bảng 50 phím cứng, ma trận phần cứng, tọa độ LCD)
- `docs/reverse_engineering/firmware_injection_and_reset_vector.md` (Reset Vector `0xA3B8`, `DSR=0xF000`, 10 chunk loaders)

---

## Bảng Phân Cấp Mức Ưu Tiên (Priority Definition)

| Mức Ưu Tiên | Ý Nghĩa & Phạm Vi |
| :---: | :--- |
| **P0 (Bắt buộc / Cốt lõi)** | Chức năng bắt buộc phải có để web app hoạt động: khung bàn phím 50 phím, màn hình ma trận điểm, bộ phân tích cú pháp biểu thức, 4 phép tính, phân số, số mũ, căn thức, bộ nhớ `Ans` và xử lý lỗi cú pháp. |
| **P1 (Quan trọng / Nâng cao)** | Các tính năng đặc trưng của ClassWiz: Số phức (Complex), Hàm lượng giác, Logarit, Bộ nhớ 9 biến (`A-F, x, y, M`), Đạo hàm / Tích phân số, Phương trình đa thức bậc 2-4 và Hệ phương trình tuyến tính 2-4 ẩn. |
| **P2 (Mở rộng / Toàn diện)** | Ma trận, Véc-tơ, Bảng tính (Spreadsheet), Thống kê & Phân phối xác suất, Bất phương trình, Tỉ lệ thức, Base-N, Giao diện đa ngôn ngữ (Tiếng Việt / English). |

---

## 1. Giao Diện và Bàn Phím (UI & Keyboard Hardware Interface)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-UI-01** | Bố cục vỏ máy & Khung bàn phím 50 phím | `classwiz_p20.dll` (`GetKeyCount` = 50, bảng 50 phím tại `0x10004010`) | Render đúng 50 nút bấm vật lý theo tọa độ chuẩn Casio | **P0** | Thấp (CSS Grid / Canvas) | Kiểm tra trực quan: đủ 50 phím, vị trí phím đúng chuẩn | Đã phân tích |
| **FEAT-UI-02** | Màn hình ma trận điểm LCD (192 × 63 dots) | `fx_580vn_x_emulator.exe` (`0x004bc4c0`, VRAM `0xF800`, `GetDisplayPosition` 130, 256) | Hiển thị ma trận 192×63 dots + dải icon thông báo phía trên | **P0** | Trung bình (HTML5 Canvas 2D) | Vẽ pattern kẻ caro / pixel dots kiểm tra độ sắc nét | Đã phân tích |
| **FEAT-UI-03** | Thanh biểu tượng trạng thái (Status Indicators) | VRAM `0xF800` (dữ liệu icon ClassWiz) | Bật/tắt các biểu tượng `SHIFT`, `ALPHA`, `D`/`R`/`G`, `FIX`, `SCI`, `M`, `Math` | **P0** | Thấp $\rightarrow$ Phụ thuộc trạng thái máy | Bấm `SHIFT` $\rightarrow$ hiện icon `S`; bấm `ALPHA` $\rightarrow$ hiện icon `A` | Đã phân tích |
| **FEAT-UI-04** | Ánh xạ bàn phím máy tính PC (Keyboard Shortcuts) | `classwiz_p20.dll` (mã ký tự ASCII trong bảng 36-byte mỗi phím) | Nhấn phím PC gõ trực tiếp tương ứng (ví dụ `W` = ON, `C` = AC, `q` = SHIFT) | **P0** | Thấp (Window `keydown` event) | Nhấn phím `1`-`9`, `+`, `-`, `*`, `/`, `Enter` trên bàn phím vật lý | Đã phân tích |
| **FEAT-UI-05** | Phản hồi xúc giác & Nhấn phím ảo (Touch/Click) | `classwiz_p20.dll` (`GetCushionColor`, `GetKeyFrameColor`) | Hiệu ứng active/press khi bấm nút, âm thanh phản hồi nếu có | **P1** | Thấp (CSS active states) | Bấm thử trên màn hình cảm ứng điện thoại & chuột | Đã phân tích |

---

## 2. Nhập Biểu Thức, Sửa Biểu Thức và Lịch Sử (Expression Input & History)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-INP-01** | Hiển thị biểu thức tự nhiên 2D (Natural Textbook Display) | `fx_580vn_x_emulator.exe`, font `casio_classwiz.ttf` | Phân số xếp chồng trên/dưới, căn bậc hai mở rộng, số mũ nhỏ phía trên | **P0** | Cao (Cần engine render AST dạng phân số/mũ) | Nhập $\frac{1+\sqrt{5}}{2}$ kiểm tra hiển thị tự nhiên | Đã phân tích |
| **FEAT-INP-02** | Điều hướng con trỏ chỉnh sửa (Cursor Navigation) | Phím `[Left]`, `[Right]`, `[Up]`, `[Down]` (`classwiz_p20.dll`) | Di chuyển con trỏ giữa các ký tự, vào/ra khỏi tử số/mẫu số | **P0** | Trung bình $\rightarrow$ Phụ thuộc cấu trúc cây AST | Di chuyển con trỏ vào giữa biểu thức và chèn ký tự mới | Đã phân tích |
| **FEAT-INP-03** | Chức năng xóa ký tự (`[DEL]`) | Phím `[DEL]` (code `'o'`, ma trận `Row=0x04, Col=0x08`) | Xóa ký tự đứng ngay trước con trỏ; nếu là block phân số thì xóa cấu trúc | **P0** | Trung bình | Nhập `123`, nhấn `DEL` $\rightarrow$ còn `12` | Đã phân tích |
| **FEAT-INP-04** | Xóa màn hình (`[AC]`) | Phím `[AC]` (`IsAcKeyCode`: `Row=0x04, Col=0x10`) | Đưa màn hình nhập về trống nhưng giữ nguyên lịch sử tính toán | **P0** | Thấp | Nhập phép tính, bấm `AC`, bấm `Up` $\rightarrow$ vẫn còn lịch sử | Đã phân tích |
| **FEAT-INP-05** | Bộ nhớ lịch sử tính toán (Calculation History Buffer) | Lõi CPU u8 RAM `0x0D000` | Lưu trữ tối thiểu 20-50 phép tính gần nhất; bấm `Up`/`Down` để cuộn | **P0** | Trung bình (Ring buffer lịch sử) | Thực hiện 5 phép tính liên tiếp, bấm `Up` để xem lại từng phép tính | Đã phân tích |
| **FEAT-INP-06** | Tự động ghép nối với `Ans` (Auto-Ans Insertion) | Hành vi chuẩn ClassWiz | Bấm trực tiếp toán tử (`+`, `-`, `*`, `/`) sau kết quả $\rightarrow$ tự điền `Ans +` | **P0** | Thấp $\rightarrow$ Phụ thuộc state machine | Sau khi tính `2+3=5`, bấm `*2` $\rightarrow$ màn hình hiện `Ans×2`, kết quả `10` | Đã phân tích |

---

## 3. Tính Toán Cơ Bản và Xử Lý Số (Basic Arithmetic & Number System)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-NUM-01** | 4 phép tính cơ bản ($+$, $-$, $\times$, $\div$) | `instCalc` (`simu8engine.dll`: `ADD`, `SUB`, `ADC`, `SBC`) | Thực hiện cộng, trừ, nhân, chia đúng thứ tự ưu tiên | **P0** | Thấp $\rightarrow$ Bộ giải toán tử PEMDAS | `2 + 3 × 4 = 14` (không phải `20`) | Đã phân tích |
| **FEAT-NUM-02** | Dấu trừ âm một ngôi (`[(-)]`) | Phím `[(-)]` (code `'z'`, ma trận `0x10, 0x01`) | Nhập số âm đứng đầu hoặc sau toán tử: `(-5) × 3 = -15` | **P0** | Thấp | Nhập `-3^2 = -9`, `(-3)^2 = 9` | Đã phân tích |
| **FEAT-NUM-03** | Lũy thừa thập phân kỹ thuật (`[*10^x]`) | Phím `[*10^x]` (code `'K'`, ma trận `0x04, 0x40`) | Nhập ký pháp khoa học: `3 × 10^8` | **P0** | Thấp | Nhập `3 × 10^8 × 2 × 10^-3 = 600,000` | Đã phân tích |
| **FEAT-NUM-04** | Độ chính xác dấu chấm động 15 chữ số (Internal Precision) | Thanh ghi CPU u8, quy chuẩn Casio | Tính toán bên trong đạt 15 chữ số có nghĩa; hiển thị tối đa 10 chữ số | **P0** | Cao (Cần thư viện BigNumber/Decimal chính xác cao) | Kiểm tra `1/3 × 3 = 1` (không bị sai số `0.9999999999`) | Đã phân tích |
| **FEAT-NUM-05** | Dấu ngoặc đơn lồng nhau `[(]`, `[)]` | Phím `[(]`, `[)]` (ma trận `0x08, 0x04` và `0x08, 0x08`) | Hỗ trợ tối đa 24 mức ngoặc lồng nhau | **P0** | Trung bình | `((2+3)×(4+5))/(2+1) = 15` | Đã phân tích |
| **FEAT-NUM-06** | Tính phần trăm (`%`) | `SHIFT` + `[(]` | `200 × 15% = 30` | **P1** | Thấp | `500 + 10% = 550` | Đã phân tích |

---

## 4. Phân Số, Căn Số và Các Hàm Toán Học (Fractions & Math Functions)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-MTH-01** | Phân số chính tắc và hỗn số | Phím `[d/c]` (code `'a'`, ma trận `0x20, 0x01`) | Nhập dạng $\frac{a}{b}$ hoặc $c\frac{a}{b}$, tự động tối giản | **P0** | Trung bình (Thuật toán GCD/UCLN) | `2/4` $\rightarrow$ kết xuất `1/2`; `1/2 + 1/3 = 5/6` | Đã phân tích |
| **FEAT-MTH-02** | Chuyển đổi Thập phân $\leftrightarrow$ Phân số (`[S<>D]`) | Phím `[S<>D]` (code `'n'`, ma trận `0x08, 0x10`) | Chuyển đổi luân phiên: $\frac{1}{2} \leftrightarrow 0.5 \leftrightarrow \frac{1}{2}$ | **P0** | Trung bình | Tính `1 ÷ 2`, bấm `S<>D` $\rightarrow$ `0.5`, bấm lại $\rightarrow$ `1/2` | Đã phân tích |
| **FEAT-MTH-03** | Căn bậc hai và căn bậc bất kỳ | Phím `[Square Root]` và `SHIFT` + `[^]` | $\sqrt{x}$ giữ dạng căn tối giản ($2\sqrt{3}$) hoặc thập phân | **P0** | Cao (Thuật toán rút gọn căn thức đại số) | `\sqrt{12}` $\rightarrow$ kết xuất `2\sqrt{3}` | Đã phân tích |
| **FEAT-MTH-04** | Lũy thừa $x^2$, $x^3$, $x^\Box$, $x^{-1}$ | Phím `[x^2]`, `[^]`, `[x^-1]` | $2^3 = 8$, $5^{-1} = \frac{1}{5}$ | **P0** | Trung bình | `2^10 = 1024`, `4^-1 = 0.25` | Đã phân tích |
| **FEAT-MTH-05** | Hàm logarit tự nhiên $\ln$ và cơ số 10 $\log$ | Phím `[ln]`, `[log(a,b)]` | $\ln(e) = 1$, $\log(100) = 2$, $\log_2(8) = 3$ | **P0** | Trung bình | Tính $\log_2(32) = 5$, $\log(-1) \rightarrow \text{Math ERROR}$ | Đã phân tích |
| **FEAT-MTH-06** | Lượng giác ($\sin, \cos, \tan$) & lượng giác ngược | Phím `[sin], [cos], [tan]` | Giá trị lượng giác chính xác theo Deg/Rad/Gra | **P0** | Trung bình (Đơn vị góc `D/R/G`) | Mode Deg: $\sin(30^\circ) = \frac{1}{2}$, $\tan(45^\circ) = 1$ | Đã phân tích |
| **FEAT-MTH-07** | Số $\pi$ và hằng số Euler $e$ | `SHIFT` + `[*10^x]`, `ALPHA` + `[*10^x]` | Hằng số $\pi \approx 3.14159265358979$, $e \approx 2.71828182845904$ | **P0** | Thấp | `\sin(\pi) = 0` (trong mode Radian) | Đã phân tích |
| **FEAT-MTH-08** | Giai thừa $n!$, Tổ hợp $n\text{C}r$, Chỉnh hợp $n\text{P}r$ | `SHIFT` + `[x^-1]`, `SHIFT` + `[*]`, `SHIFT` + `[/]` | $5! = 120$, $5\text{C}2 = 10$, $5\text{P}2 = 20$ | **P1** | Thấp | Kiểm tra các trường hợp biên $0! = 1$, $n < r \rightarrow \text{ERROR}$ | Đã phân tích |
| **FEAT-MTH-09** | Độ, Phút, Giây (`[''"]`) | Phím `[''"]` (code `'x'`, ma trận `0x10, 0x02`) | Nhập và chuyển đổi góc $12^\circ 30' 0'' = 12.5^\circ$ | **P1** | Trung bình | $2^\circ 15' + 1^\circ 50' = 4^\circ 5' 0''$ | Đã phân tích |
| **FEAT-MTH-10** | Tích phân số $\int_a^b f(x)dx$ | Phím `[Integral]` (code `'y'`, ma trận `0x40, 0x10`) | Thuật toán cầu phương Gauss-Kronrod tính tích phân số | **P1** | Cao (Tích phân số giải tích) | $\int_0^{\pi} \sin(x)dx = 2$ | Đã phân tích |
| **FEAT-MTH-11** | Đạo hàm số $\left.\frac{d}{dx}f(x)\right|_{x=a}$ | `SHIFT` + `[Integral]` | Tính đạo hàm số sai phân hữu hạn tại một điểm | **P1** | Cao | $\left.\frac{d}{dx}(x^2)\right|_{x=3} = 6$ | Đã phân tích |
| **FEAT-MTH-12** | Tổng $\sum$ và Tích $\prod$ | `SHIFT` + `[x]`, `SHIFT` + `[x^2]` | $\sum_{x=1}^{5} x = 15$, $\prod_{x=1}^{4} x = 24$ | **P1** | Trung bình | Kiểm tra vòng lặp biến chạy | Đã phân tích |
| **FEAT-MTH-13** | Phân tích thừa số nguyên tố (`FACT`) | `SHIFT` + `[''"]` | Phân tích số nguyên ra tích các thừa số nguyên tố | **P1** | Trung bình (Thuật toán Trial division/Pollard) | Nhập `60`, bấm `=`, bấm `FACT` $\rightarrow 2^2 \times 3 \times 5$ | Đã phân tích |

---

## 5. Các Mode Nâng Cao (Advanced Modes 1 - 12)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-MOD-01** | **Mode 1: Calculate (COMP)** | Mode mặc định sau Reset (`PC=0xA3B8`) | Toàn bộ các phép tính biểu thức thông thường | **P0** | Cốt lõi | Mọi phép tính cơ bản | Đã kiểm thử |
| **FEAT-MOD-02** | **Mode 2: Complex (Số phức)** | Phím `[ENG]` (ký tự ảo $i$) | Hỗ trợ số phức $a+bi$ và $r\angle\theta$, tính Module, Arg, Liên hợp | **P1** | Trung bình (Thư viện số phức) | $(1+2i)(3-i) = 5 + 5i$, $\text{Abs}(3+4i) = 5$ | Đã kiểm thử |
| **FEAT-MOD-03** | **Mode 3: Base-N (Hệ đếm)** | Nhãn phím Base-N (`DEC, HEX, BIN, OCT`) | Chuyển đổi qua lại và tính toán logic AND, OR, XOR, NOT | **P2** | Trung bình | `BIN: 1010 + 0101 = 1111`, chuyển sang `DEC = 15` | Đã kiểm thử |
| **FEAT-MOD-04** | **Mode 4: Matrix (Ma trận)** | Bộ nhớ RAM `0x0D000` | Tối đa 4 ma trận $4\times 4$; cộng trừ, nhân, $\text{Det}(A)$, $A^{-1}$, $A^T$ | **P2** | Cao (Đại số tuyến tính) | Nhân ma trận $2\times 2$, tìm định thức ma trận $3\times 3$ | Đã kiểm thử |
| **FEAT-MOD-05** | **Mode 5: Vector (Véc-tơ)** | Bộ nhớ RAM `0x0D000` | 4 véc-tơ 2D/3D; tính tích vô hướng (`Dot`), tích có hướng (`Cross`), góc | **P2** | Trung bình | Tích có hướng $[1,0,0] \times [0,1,0] = [0,0,1]$ | Đã kiểm thử |
| **FEAT-MOD-06** | **Mode 6: Statistics (Thống kê)** | Menu Thống kê 1-Var & 2-Var | Bảng nhập $x, y$, tần số `Freq`; tính $\bar{x}, \sigma, s, \Sigma x, \Sigma x^2$ | **P2** | Trung bình (Thống kê mô tả) | Nhập dãy 5 số, tính trung bình và độ lệch chuẩn | Đã kiểm thử |
| **FEAT-MOD-07** | **Mode 7: Distribution (Xác suất)** | Thực đơn phân phối xác suất | Normal PD/CD, Inverse Normal, Binomial, Poisson | **P2** | Cao (Tích phân xác suất) | Kiểm tra $\text{NormalCD}(0, 1) \approx 0.3413$ | Đã phân tích |
| **FEAT-MOD-08** | **Mode 8: Spreadsheet (Bảng tính)** | Đặc trưng ClassWiz (5 cột $\times$ 45 hàng) | Nhập dữ liệu ô bảng tính, công thức `=A1*2`, lệnh điền chuỗi | **P2** | Cao (Engine bảng tính mini) | Nhập số vào cột A, dùng công thức tính tổng cột A | Đã phân tích |
| **FEAT-MOD-09** | **Mode 9: Table (Bảng giá trị hàm số)** | Phím `[MENU]` $\rightarrow$ 9 | Lập bảng giá trị đồng thời cho $f(x)$ và $g(x)$ với Start, End, Step | **P1** | Trung bình | $f(x) = x^2 - 2$, Start=1, End=5, Step=1 $\rightarrow$ bảng 5 dòng | Đã kiểm thử |
| **FEAT-MOD-10** | **Mode A: Equation (Phương trình)** | Phím `[MENU]` $\rightarrow$ A | 1. Hệ phương trình 2, 3, 4 ẩn.<br>2. Phương trình đa thức bậc 2, 3, 4 (kèm tọa độ cực trị parabol) | **P1** | Rất cao (Thuật toán Cardano, Ferrari, khử Gauss) | Giải $x^2 - 5x + 6 = 0 \rightarrow x_1=3, x_2=2$; Giải hệ 3 ẩn | Đã kiểm thử |
| **FEAT-MOD-11** | **Mode B: Inequality (Bất phương trình)** | Phím `[MENU]` $\rightarrow$ B | Bất phương trình đa thức bậc 2, 3, 4 ($>, <, \ge, \le$) | **P2** | Cao $\rightarrow$ Phụ thuộc giải nghiệm đa thức | $x^2 - 4 > 0 \rightarrow x < -2 \text{ hoặc } x > 2$ | Đã phân tích |
| **FEAT-MOD-12** | **Mode C: Ratio (Tỉ lệ thức)** | Phím `[MENU]` $\rightarrow$ C | Giải tỉ lệ thức dạng $A:B = X:D$ hoặc $A:B = C:X$ | **P2** | Thấp | $2:3 = X:6 \rightarrow X=4$ | Đã phân tích |

---

## 6. Bộ Nhớ, Thiết Lập và Xử Lý Lỗi (Memory, Setup & Errors)

| ID | Tên Chức Năng | Bằng Chứng Nguồn | Input / Output Mong Đợi | Ưu Tiên | Độ Khó & Phụ Thuộc | Cách Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-MEM-01** | 9 biến nhớ độc lập (`A, B, C, D, E, F, x, y, M`) | Thanh ghi và RAM `0x0D000` | Gán giá trị vào biến bằng `STO` + phím; gọi lại bằng `ALPHA` + phím | **P0** | Thấp | `5 STO A`, `A + 2 = 7` | Đã phân tích |
| **FEAT-MEM-02** | Cộng/Trừ ô nhớ độc lập (`M+`, `M-`) | Phím `[M+]` (code `'m'`, ma trận `0x08, 0x20`) | `M+` cộng thêm vào ô nhớ $M$; `SHIFT`+`M+` trừ bớt khỏi $M$ | **P0** | Thấp | Gán `M=0`, cộng `10 M+`, trừ `3 M-` $\rightarrow M=7$ | Đã phân tích |
| **FEAT-MEM-03** | Menu cài đặt hệ thống (`[SHIFT] + [MENU]`) | Menu Setup | Tùy chọn Input/Output (Math/Linear), Angle Unit (Deg/Rad/Gra), Display | **P0** | Trung bình | Đổi đơn vị góc sang Radian $\rightarrow$ icon `R` sáng lên | Đã phân tích |
| **FEAT-MEM-04** | Định dạng số hiển thị (Fix, Sci, Norm) | Cấu hình trong Setup | Fix: cố định số lẻ thập phân; Sci: ký pháp khoa học; Norm 1 / Norm 2 | **P0** | Trung bình | Đặt `Fix 2`: `1/3 = 0.33`; Đặt `Sci 3`: `1234 = 1.23×10^3` | Đã phân tích |
| **FEAT-MEM-05** | Ngôn ngữ giao diện Tiếng Việt / Tiếng Anh | Transform `1066.mst`, font `casio_classwiz.ttf` | Hiển thị thông báo, menu bằng Tiếng Việt hoặc Tiếng Anh | **P1** | Thấp (i18n dictionary) | Chọn Tiếng Việt $\rightarrow$ hiển thị "1:Phep tinh", "4:Ma tran" | Đã phân tích |
| **FEAT-MEM-06** | Xử lý lỗi toán học (`Math ERROR`) | CPU u8 Trap / Exception | Chặn phép chia cho 0, log số âm, căn số âm ở mode thực; hiện nút `[Left]/[Right]` quay lại sửa lỗi | **P0** | Trung bình | `1 ÷ 0` $\rightarrow$ hiện màn hình `Math ERROR`, bấm phím mũi tên quay lại con trỏ lỗi | Đã phân tích |
| **FEAT-MEM-07** | Xử lý lỗi cú pháp (`Syntax ERROR`) | Bộ phân tích cú pháp (Parser) | Chặn dấu phép tính liền nhau, ngoặc mở không đóng, biểu thức rỗng | **P0** | Trung bình | `2 + × 3` $\rightarrow$ hiện `Syntax ERROR`, đưa con trỏ về vị trí dấu `×` | Đã phân tích |
| **FEAT-MEM-08** | Khôi phục cài đặt gốc (`Reset` / `Init All`) | `SHIFT` + `[9]` (`Reset`) | Xóa toàn bộ biến nhớ, lịch sử, reset thiết lập về mặc định ban đầu | **P1** | Thấp | Bấm Reset $\rightarrow$ đưa máy về trạng thái như vừa `SimReset` | Đã phân tích |

---

## 7. Khác Biệt Giữa Hành Vi Đã Xác Minh, Dự Kiến và Chưa Biết

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOÀN BỘ CHỨC NĂNG FX-580VN X                    │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│    ĐÃ XÁC MINH           │      DỰ KIẾN            │     CHƯA BIẾT     │
│   (VERIFIED - 100%)      │   (EXPECTED - ~90%)     │  (UNKNOWN / TBD)  │
├──────────────────────────┼─────────────────────────┼───────────────────┤
│ - Layout 50 phím phần    │ - Các công thức toán    │ - Định dạng nhị   │
│   cứng, ma trận Row/Col  │   học chuẩn giải tích   │   phân nén BCD    │
│ - Tọa độ LCD 192x63 dots │   (Cardano, Ferrari)    │   bên trong ROM   │
│ - Bản đồ RAM, ROM 256KB  │ - Ngôn ngữ hiển thị     │ - Thuật toán nén  │
│ - VRAM buffer 0xF800     │   Tiếng Việt / English  │   font glyphs     │
│ - ALU instCalc (10 op)   │ - Quy tắc hiển thị căn  │ - Bảng mã lỗi     │
│ - Reset Vector (0xA3B8)  │   và phân số tối giản   │   nội bộ cho các  │
│ - DSR khởi tạo (0xF000)  │ - 12 Chế độ Menu        │   case cực biên   │
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

### 7.1. Hành vi đã xác minh trực tiếp (Verified - Mức tin cậy 100%)
- Toàn bộ bảng 50 phím vật lý, tên định danh Unicode UTF-16LE, vị trí pixel và tọa độ quét ma trận `(Row, Col)` trong `classwiz_p20.dll`.
- Độ phân giải màn hình LCD đồ họa ma trận điểm 192 × 63 dots và vùng nhớ VRAM tại `0xF800` (2,048 bytes).
- Cơ chế quét bàn phím thông qua các thanh ghi phần cứng `0x48E01` (hàng), `0x48E02` (cột) và ngắt phím `0x0F014` (bit 5).
- Khối tính toán ALU `instCalc` của CPU u8 gồm 10 phép toán cơ sở và thuật toán cập nhật 5 cờ trạng thái (`CF, ZF, SF, OF, HC`).
- Cơ chế khởi động CPU tại `m_SimReset`: nạp `DSR = 0xF000` từ `0x0000` và `PC = 0xA3B8` từ `0x0002`.

### 7.2. Hành vi dự kiến (Expected - Dựa trên quy chuẩn Casio ClassWiz)
- Thứ tự ưu tiên toán tử PEMDAS và độ chính xác tính toán bên trong 15 chữ số có nghĩa.
- 12 chế độ tính toán (`MENU 1-12`) theo đúng hướng dẫn sử dụng dòng máy Casio fx-580VN X chuẩn tại Việt Nam.
- Giao diện hai ngôn ngữ: Tiếng Việt và Tiếng Anh (xác thực từ tệp transform `1066.mst`).

### 7.3. Hành vi chưa biết / Chưa xác minh (Unknown / Unverified)
- Thuật toán nội bộ chính xác của firmware gốc khi giải hệ phương trình suy biến (vô số nghiệm hoặc vô nghiệm dạng tham số phức).
- Dữ liệu thô của các bảng tra hằng số khoa học (`Scientific Constants`) và chuyển đổi đơn vị (`Unit Conversions`) trong ROM.

---

## 8. Lộ Trình Triển Khai Đề Xuất (Implementation Phases)

1. **Giai đoạn 1 (Phase 1 - Core MVP / P0):**
   - Dựng giao diện Web (HTML5 Canvas + SVG + CSS Grid 50 phím).
   - Bộ máy tính toán biểu thức cơ bản (Lexer $\rightarrow$ AST Parser $\rightarrow$ Evaluator), hỗ trợ phân số, số mũ, căn bậc hai, dấu ngoặc, biến nhớ `Ans` và 9 biến `A-F, x, y, M`.
   - Kết nối bàn phím PC và màn hình LCD 192×63 dots.
2. **Giai đoạn 2 (Phase 2 - Scientific Math & P1 Modes):**
   - Hàm lượng giác, logarit, đạo hàm số, tích phân số $\sum, \prod$.
   - Mode 2 (Complex - Số phức).
   - Mode 9 (Table - Bảng giá trị hàm số).
   - Mode A (Equation - Giải phương trình bậc 2, 3, 4 và hệ phương trình 2, 3, 4 ẩn).
3. **Giai đoạn 3 (Phase 3 - Advanced Features & P2):**
   - Mode 4 (Matrix), Mode 5 (Vector), Mode 3 (Base-N), Mode B (Inequality), Mode C (Ratio).
   - Menu Setup đầy đủ và chuyển đổi giao diện Tiếng Việt / Tiếng Anh.

# Bảng Ánh Xạ Phần Cứng và Bàn Phím Casio fx-580VN X (`CLASSWIZ_P20.dll`)

**Tệp phân tích:** `extracted/files/classwiz_p20.dll` (2,431,488 bytes, PE32 x86)  
**Căn cứ bằng chứng:** Bảng dữ liệu 50 phím tại VA `0x10004010` (raw offset `0x2210`), hàm `GetKeyCount` (`0x100010f0`), `IsOnKeyCode` (`0x10001180`), `IsAcKeyCode` (`0x100011b0`), `GetDisplayPosition` (`0x10001080`)  
**Mức độ tin cậy:** 100% (bằng chứng trực tiếp từ bảng cấu trúc 36-byte mỗi phím trong DLL)

---

## 1. Thông Số Giao Diện Phần Cứng (Hardware Physical Layout)

- **Tổng số phím bấm phần cứng (`GetKeyCount`):** Đúng **50 phím** (`0x32`).
- **Vị trí màn hình LCD (`GetDisplayPosition`):**
  - Tọa độ X: `130` (`0x82`)
  - Tọa độ Y: `256` (`0x100`)
- **Vị trí bắt đầu bàn phím (`GetKeyPosition`):** Y = `440` (`0x1B8`).
- **Phím bật nguồn (`IsOnKeyCode`):** Ma trận `Row = 0, Col = 0`.
- **Phím xóa toàn bộ (`IsAcKeyCode`):** Ma trận `Row = 4 (0x04), Col = 16 (0x10)`.

---

## 2. Bảng Tra Cứu Toàn Bộ 50 Phím Bấm Casio fx-580VN X

Mỗi phím bấm trong `classwiz_p20.dll` được định nghĩa bởi một bản ghi cố định **36 bytes** (9 DWORDs) gồm:
- `DWORD 0`: Bitmask hàng ma trận (`Row`).
- `DWORD 1`: Bitmask cột ma trận (`Col`).
- `DWORD 2, 3`: Tọa độ vẽ `(X, Y)` trên thân máy tính ảo.
- `DWORD 4, 5`: Kích thước phím `(Width, Height)` tính bằng pixel.
- `DWORD 6`: Con trỏ thông tin font / phong cách hiển thị.
- `DWORD 7`: Mã ký tự phím tắt bàn phím PC (ASCII key shortcut).
- `DWORD 8`: Con trỏ chuỗi Unicode (UTF-16LE) tên định danh của phím.

| STT | Tên Phím (Unicode) | Phím Tắt PC | Ma Trận Hàng (`Row`) | Ma Trận Cột (`Col`) | Tọa Độ `(X, Y)` | Kích Thước `(W×H)` | Ghi Chú Tính Năng |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | `[SHIFT]` | `q` | `0x80` | `0x01` | `(99, 479)` | 49 × 49 | Chuyển chế độ phím vàng |
| **1** | `[ALPHA]` | `Q` | `0x80` | `0x02` | `(169, 479)` | 49 × 49 | Chuyển chế độ phím đỏ (biến/ký tự) |
| **2** | `[MENU]` | `w` | `0x80` | `0x10` | `(427, 479)` | 49 × 49 | Menu chọn chức năng tính toán |
| **3** | `[ON]` | `W` | `0x00` | `0x00` | `(496, 479)` | 49 × 49 | Bật máy / Đánh thức CPU |
| **4** | `[Up]` | `E` | `0x80` | `0x04` | `(298, 478)` | 49 × 49 | Phím điều hướng Lên |
| **5** | `[Down]` | `R` | `0x40` | `0x08` | `(298, 546)` | 49 × 49 | Phím điều hướng Xuống |
| **6** | `[Left]` | `!` | `0x40` | `0x04` | `(236, 512)` | 49 × 49 | Phím điều hướng Trái |
| **7** | `[Right]` | `$` | `0x80` | `0x08` | `(360, 512)` | 49 × 49 | Phím điều hướng Phải |
| **8** | `[OPTN]` | `T` | `0x40` | `0x01` | `(94, 575)` | 68 × 40 | Tùy chọn chức năng nâng cao |
| **9** | `[CALC]` | `r` | `0x40` | `0x02` | `(172, 575)` | 68 × 40 | Tính giá trị biểu thức / SOLVE |
| **10**| `[Integral]`| `y` | `0x40` | `0x10` | `(406, 575)` | 68 × 40 | Tích phân / Đạo hàm |
| **11**| `[x]` | `[` | `0x40` | `0x20` | `(484, 575)` | 68 × 40 | Nhập biến $x$ nhanh |
| **12**| `[d/c]` | `a` | `0x20` | `0x01` | `(94, 640)` | 68 × 40 | Nhập phân số / hỗn số |
| **13**| `[Square Root]`| `s` | `0x20` | `0x02` | `(172, 640)` | 68 × 40 | Căn bậc hai $\sqrt{\phantom{x}}$ |
| **14**| `[x^2]` | `d` | `0x20` | `0x04` | `(250, 640)` | 68 × 40 | Bình phương $x^2$ |
| **15**| `[^]` | `^` | `0x20` | `0x08` | `(329, 640)` | 68 × 40 | Lũy thừa $x^\Box$ |
| **16**| `[log(a,b)]`| `i` | `0x20` | `0x10` | `(406, 640)` | 68 × 40 | Logarit cơ số bất kỳ $\log_a(b)$ |
| **17**| `[ln]` | `h` | `0x20` | `0x20` | `(484, 640)` | 68 × 40 | Logarit tự nhiên $\ln$ |
| **18**| `[(-)]` | `z` | `0x10` | `0x01` | `(94, 706)` | 68 × 40 | Dấu trừ âm số học |
| **19**| `[''"]` | `x` | `0x10` | `0x02` | `(172, 706)` | 68 × 40 | Độ, phút, giây |
| **20**| `[x^-1]` | `u` | `0x10` | `0x04` | `(250, 706)` | 68 × 40 | Nghịch đảo $x^{-1}$ |
| **21**| `[sin]` | `j` | `0x10` | `0x08` | `(329, 706)` | 68 × 40 | Hàm lượng giác $\sin$ |
| **22**| `[cos]` | `k` | `0x10` | `0x10` | `(406, 706)` | 68 × 40 | Hàm lượng giác $\cos$ |
| **23**| `[tan]` | `l` | `0x10` | `0x20` | `(484, 706)` | 68 × 40 | Hàm lượng giác $\tan$ |
| **24**| `[STO]` | `J` | `0x08` | `0x01` | `(94, 772)` | 68 × 40 | Gán biến nhớ |
| **25**| `[ENG]` | `b` | `0x08` | `0x02` | `(172, 772)` | 68 × 40 | Ký hiệu kỹ thuật (Engineering) |
| **26**| `[(]` | `(` | `0x08` | `0x04` | `(250, 772)` | 68 × 40 | Mở ngoặc đơn |
| **27**| `[)]` | `)` | `0x08` | `0x08` | `(329, 772)` | 68 × 40 | Đóng ngoặc đơn |
| **28**| `[S<>D]` | `n` | `0x08` | `0x10` | `(406, 772)` | 68 × 40 | Chuyển đổi Thập phân $\leftrightarrow$ Phân số |
| **29**| `[M+]` | `m` | `0x08` | `0x20` | `(484, 772)` | 68 × 40 | Cộng vào ô nhớ $M$ |
| **30**| `[7]` | `7` | `0x04` | `0x01` | `(96, 841)` | 80 × 56 | Chữ số 7 |
| **31**| `[8]` | `8` | `0x04` | `0x02` | `(189, 841)` | 80 × 56 | Chữ số 8 |
| **32**| `[9]` | `9` | `0x04` | `0x04` | `(282, 841)` | 80 × 56 | Chữ số 9 |
| **33**| `[DEL]` | `o` | `0x04` | `0x08` | `(375, 841)` | 80 × 56 | Xóa lùi 1 ký tự |
| **34**| `[AC]` | `C` | `0x04` | `0x10` | `(468, 841)` | 80 × 56 | Xóa toàn bộ màn hình |
| **35**| `[4]` | `4` | `0x02` | `0x01` | `(96, 921)` | 80 × 56 | Chữ số 4 |
| **36**| `[5]` | `5` | `0x02` | `0x02` | `(189, 921)` | 80 × 56 | Chữ số 5 |
| **37**| `[6]` | `6` | `0x02` | `0x04` | `(282, 921)` | 80 × 56 | Chữ số 6 |
| **38**| `[*]` | `O` | `0x02` | `0x08` | `(375, 921)` | 80 × 56 | Phép nhân $\times$ |
| **39**| `[/]` | `P` | `0x02` | `0x10` | `(468, 921)` | 80 × 56 | Phép chia $\div$ |
| **40**| `[1]` | `1` | `0x01` | `0x01` | `(96, 1001)`| 80 × 56 | Chữ số 1 |
| **41**| `[2]` | `2` | `0x01` | `0x02` | `(189, 1001)`| 80 × 56 | Chữ số 2 |
| **42**| `[3]` | `3` | `0x01` | `0x04` | `(282, 1001)`| 80 × 56 | Chữ số 3 |
| **43**| `[+]` | `+` | `0x01` | `0x08` | `(375, 1001)`| 80 × 56 | Phép cộng $+$ |
| **44**| `[-]` | `p` | `0x01` | `0x10` | `(468, 1001)`| 80 × 56 | Phép trừ $-$ |
| **45**| `[0]` | `0` | `0x10` | `0x40` | `(96, 1081)`| 80 × 56 | Chữ số 0 |
| **46**| `[.]` | `.` | `0x08` | `0x40` | `(189, 1081)`| 80 × 56 | Dấu chấm thập phân |
| **47**| `[*10^x]` | `K` | `0x04` | `0x40` | `(282, 1081)`| 80 × 56 | Lũy thừa 10 ($\times 10^x$) |
| **48**| `[Ans]` | `M` | `0x02` | `0x40` | `(375, 1081)`| 80 × 56 | Kết quả phép tính trước |
| **49**| `[=]` | `=` | `0x01` | `0x40` | `(468, 1081)`| 80 × 56 | Phím thực thi tính toán |

---

## 3. Kiến Trúc Điều Khiển Đa Luồng (`SimU8.dll`)

`SimU8.dll` đóng vai trò là tầng cầu nối (middleware/bridge) giữa giao diện người dùng MFC (`fx_580vn_x_emulator.exe`) và lõi mô phỏng vi xử lý (`SimU8engine.dll`):
- Chạy vòng lặp mô phỏng vi xử lý CPU trong một **background worker thread** độc lập để tránh đóng băng giao diện GUI khi máy tính thực hiện các phép toán nặng (tích phân số, giải hệ phương trình bậc 4, ma trận 4x4).
- Giao tiếp giữa giao diện GUI và thread mô phỏng sử dụng cơ chế hàng đợi lệnh (command message queue) kèm theo cơ chế đồng bộ hóa Mutex / Event với thời gian chờ tối đa (timeout) chuẩn là **`3000 ms`** (`0xBB8`).

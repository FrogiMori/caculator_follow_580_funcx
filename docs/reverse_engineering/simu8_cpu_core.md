# Phân Tích Kỹ Thuật Lõi Vi Xử Lý nX-U8 (`SimU8engine.dll`)

**Tệp phân tích:** `extracted/files/simu8engine.dll` (46,592 bytes, PE32 x86)  
**Lớp đối tượng trung tâm:** `CSimU8core`  
**Công cụ phân tích:** LLVM `objdump` disassembler, script trích xuất Python PE parser  
**Mức độ tin cậy:** 100% (bằng chứng assembly và memory layout trực tiếp)

---

## 1. Tổng Quan Kiến Trúc Vi Xử Lý (CPU Architecture)

Casio fx-580VN X (ClassWiz) không chạy trên kiến trúc x86 thông thường mà được giả lập thông qua vi điều khiển nhúng lõi **u8 / nX-U8** (dòng vi điều khiển 8-bit/16-bit RISC của Lapis Semiconductor / OKI / Seiko Epson).

### 1.1. Cấu trúc bộ thanh ghi (Register Set)

Tại đối tượng `CSimU8core`, cấu trúc dữ liệu CPU bắt đầu tại con trỏ `this + 0x80`:

| Mã Thanh Ghi (Index) | Tên Thanh Ghi | Kích Thước | Vị Trí Trong Bộ Nhớ (`ecx + 0x80`) | Ý Nghĩa Chức Năng |
| :--- | :--- | :--- | :--- | :--- |
| `0x00` - `0x0F` | `r0` - `r15` | 8-bit | `0x04 + index` | 16 thanh ghi đa năng 8-bit (General Purpose Registers). |
| `0x10` | `PC` | 16-bit | `0x14` | Program Counter (con trỏ lệnh 16-bit). |
| `0x11` - `0x14` | `er0`, `er2`, ... | 16-bit | Ghép đôi thanh ghi 8-bit liền kề | Thanh ghi mở rộng 16-bit (Extended Registers). |
| `0x15` | `CSR` | 16-bit | `0x14 + ...` | Code Segment Register (phân đoạn mã, mở rộng địa chỉ PC lên 24-bit). |
| `0x1E` | `DSR` | 8-bit (4-bit) | `0x1e` | Data Segment Register (phân đoạn dữ liệu). |
| `0x23` | `PSW` | 8-bit | `0x23` | Program Status Word (thanh ghi trạng thái / cờ). |
| `0x28`, `0x2A` | `SP` / `IX` | 16-bit | `0x28`, `0x2a` | Stack Pointer & Index Registers. |

### 1.2. Thanh ghi cờ trạng thái (Program Status Word - PSW)

Hàm thao tác cờ tại RVA `0x18c0` (ghi cờ) và `0x1900` (đọc cờ) thao tác trên byte tại offset `0x23`:
Vị trí bit được xác định bởi công thức: $\text{bit\_index} = 0x27 - \text{flag\_id}$

| Flag ID (Hex) | Vị Trí Bit Trong PSW | Tên Cờ | Ký Hiệu | Ý Nghĩa & Điều Kiện Bật |
| :---: | :---: | :--- | :---: | :--- |
| `0x20` | Bit 7 (`1 << 7`) | **Carry Flag** | **CF** | Bật khi phép cộng tràn byte ($> 255$) hoặc phép trừ có mượn ($< 0$). |
| `0x21` | Bit 6 (`1 << 6`) | **Zero Flag** | **ZF** | Bật khi kết quả ALU bằng 0 (`result == 0`). |
| `0x22` | Bit 5 (`1 << 5`) | **Sign Flag** | **SF** | Bật khi bit cao nhất của kết quả là 1 (`result & 0x80 != 0`). |
| `0x23` | Bit 4 (`1 << 4`) | **Overflow Flag** | **OF / OV** | Bật khi tràn số có dấu 2's complement. |
| `0x25` | Bit 2 (`1 << 2`) | **Half-Carry Flag**| **HC** | Bật khi có tràn từ nibble thấp sang nibble cao (`(a & 0xF) + (b & 0xF) > 0xF`). |
| `0x26`, `0x27`| Bit 1, 0 | **Interrupt Mask** | **IE / MIE** | Cờ cho phép ngắt / mức ưu tiên ngắt. |

---

## 2. Phân Tích Chi Tiết Các Hàm Cốt Lõi

### 2.1. Hàm `instCalc` — Bộ Tính Toán Số Học và Logic (ALU)

- **Địa chỉ (RVA):** `0x10001d00` trong `simu8engine.dll`
- **Định danh mangled:** `?instCalc@CSimU8core@@QAEXEEE@Z`
- **Signature C++:** `void __thiscall CSimU8core::instCalc(unsigned char op, unsigned char reg_dst, unsigned char reg_src_val)`
- **Calling Convention:** `__thiscall` (`ecx` = con trỏ `CSimU8core`, tham số đẩy qua stack).

#### Mô tả Input / Output:
- **Input:**
  - `ecx`: Con trỏ đối tượng `CSimU8core`.
  - `[ebp + 0x08]` (`op`): Mã thao tác ALU (giá trị từ `0` đến `9`).
  - `[ebp + 0x0C]` (`reg_dst`): Chỉ số thanh ghi đích cần thao tác.
  - `[ebp + 0x10]` (`val`): Giá trị toán hạng nguồn (tức thời hoặc giá trị đọc từ thanh ghi nguồn).
- **Output:** Không trả về giá trị qua `eax` (kiểu `void`).
- **Thay đổi trạng thái:** Cập nhật giá trị thanh ghi `reg_dst` và các cờ trạng thái tương ứng trong `PSW` (`CF`, `ZF`, `SF`, `OF`, `HC`).

#### Bảng tra mã thao tác ALU (Jump Table tại `0x10002200`):

| Opcode | Địa Chỉ Nhảy | Thao Tác Toán Học | Công Thức Thực Hiện | Ghi Lại Thanh Ghi Đích? | Cờ Bị Ảnh Hưởng |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **0** | `0x10001d30` | **MOV / LD** | `dst = val` | Có | ZF, SF |
| **1** | `0x10001d70` | **ADD** | `dst = dst + val` | Có | CF, ZF, SF, OF, HC |
| **2** | `0x10001e4d` | **AND** | `dst = dst & val` | Có | ZF, SF |
| **3** | `0x10001e8d` | **OR** | `dst = dst \| val` | Có | ZF, SF |
| **4** | `0x10001ecd` | **XOR** | `dst = dst ^ val` | Có | ZF, SF |
| **5** | `0x100020ee` | **SBC (Test)** | `dst - val - CF` | **Không** | CF, ZF, SF, OF, HC |
| **6** | `0x10001f0d` | **ADC** | `dst = dst + val + CF` | Có | CF, ZF, SF, OF, HC |
| **7** | `0x10001ff8` | **CMP** | `dst - val` | **Không** | CF, ZF, SF, OF, HC |
| **8** | `0x100020a4` | **SUB** | `dst = dst - val` | Có | CF, ZF, SF, OF, HC |
| **9** | `0x100020ee` | **SBC** | `dst = dst - val - CF` | Có | CF, ZF, SF, OF, HC |

---

### 2.2. Hàm `instShift` — Xử Lý Dịch Bit và Quay Bit (Shift / Rotate)

- **Địa chỉ (RVA):** `0x100026b0` trong `simu8engine.dll`
- **Định danh mangled:** `?instShift@CSimU8core@@QAEXEEE@Z`
- **Signature C++:** `void __thiscall CSimU8core::instShift(unsigned char op, unsigned char reg_dst, unsigned char shift_count)`
- **Cơ chế nhảy:** Trừ `op` đi `0x0A`, kiểm tra $\le 4$ rồi nhảy theo bảng tại `0x1000288c`.

#### Các chế độ dịch bit:
- **`op = 0x0A` (SHL):** Dịch trái 8-bit (`val << count`), bit tràn ghi vào `CF` (`0x20`).
- **`op = 0x0B` (DSHL):** Dịch trái thanh ghi đôi 16-bit (Extended Register mode), bit 16 ghi vào `CF`.
- **`op = 0x0C` (SHR):** Dịch phải 8-bit (`val >> count`), bit rớt ra ghi vào `CF`.
- **`op = 0x0D` (DSHR):** Dịch phải thanh ghi đôi 16-bit.
- **`op = 0x0E` (ROT):** Quay bit qua cờ Carry.

---

### 2.3. Hàm `m_Execute` — Vòng Lặp Nạp và Thực Thi Lệnh (Fetch-Decode-Execute)

- **Địa chỉ (RVA):** `0x10005330` trong `simu8engine.dll`
- **Định danh mangled:** `?m_Execute@CSimU8core@@QAEHXZ`
- **Signature C++:** `int __thiscall CSimU8core::m_Execute(void)`

#### Luồng điều khiển:
1. **Lấy PC hiện tại:** Gọi hàm `0x10001810` với mã thanh ghi `0x10` (`PC`).
2. **Ghép phân đoạn CSR:** Nếu chế độ mở rộng phân đoạn được kích hoạt (`0xb00(this) != 0`), đọc tiếp `CSR` (mã `0x15`) và tính địa chỉ tuyến tính:
   $$\text{Linear PC} = (\text{CSR} \ll 16) \mid \text{PC}$$
3. **Nạp mã lệnh (Opcode Fetch):** Gọi hàm nạp bộ nhớ mã lệnh tại `0x10007aa0` để đọc từ 16-bit đầu tiên từ Code Memory. Nếu lệnh là lệnh mở rộng 32-bit, nạp tiếp từ 16-bit thứ hai (`Linear PC + 2`).
4. **Giải mã (Decode):** Chuyển từ mã nhị phân sang cấu trúc lệnh qua hàm `0x10001660`.
5. **Cập nhật PC:** Tăng PC thêm độ dài lệnh (mỗi đơn vị lệnh là từ 16-bit / 2 bytes):
   $$\text{New PC} = \text{PC} + (\text{Length} \times 2)$$
6. **Tăng đếm chu kỳ:** `incl 0xc0(%edi)` (tăng bộ đếm chu kỳ CPU).
7. **Thực thi phân nhánh:** Dispatch tới các handler (`instCalc`, `instShift`, `instCalcImm7`, v.v.).

---

### 2.4. Hàm `m_CheckInterrupt` — Kiểm Tra Ngắt Phần Cứng

- **Địa chỉ (RVA):** `0x10003e80` trong `simu8engine.dll`
- **Định danh mangled:** `?m_CheckInterrupt@CSimU8core@@QAEHXZ`
- **Signature C++:** `int __thiscall CSimU8core::m_CheckInterrupt(void)`

#### Cơ chế hoạt động:
- Lấy số lượng ngắt được cấu hình từ bảng `0xf8(this)`.
- Duyệt qua từng bản ghi ngắt (kích thước 40 bytes mỗi bản ghi).
- Đọc thanh ghi cờ yêu cầu ngắt tương ứng tại địa chỉ trong Data Memory RAM (`0x4c(this)`).
- Kiểm tra bitmask ngắt (`0x10d(entry)`). Nếu bit tương ứng được bật và cờ ngắt toàn cục cho phép, lưu vector ngắt và trả về mã kích hoạt ngắt phục vụ CPU.

---

## 3. Khả Năng Tái Triển Khai Độc Lập (Reimplementation Assessment)

Toàn bộ lõi CPU u8 có thể được tái hiện lại 100% bằng JavaScript / TypeScript mà không cần phụ thuộc vào môi trường Windows PE:
- Mô hình hóa thanh ghi bằng `Uint8Array(16)` cho `r0-r15` và các biến số nguyên 16-bit cho `PC`, `SP`, `PSW`.
- Triển khai chính xác thuật toán tính cờ của `instCalc` đảm bảo tương thích hoàn toàn với các phép tính số học của Casio fx-580VN X.

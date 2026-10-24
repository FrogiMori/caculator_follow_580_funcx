# Kiến Trúc Bộ Nhớ và Bus Phần Cứng Casio fx-580VN X

**Các module liên quan:** `fx_580vn_x_emulator.exe`, `simu8.dll`, `simu8engine.dll`  
**Căn cứ bằng chứng:** Disassembly hàm khởi tạo tại VA `0x004bc6d6` và callback VRAM tại VA `0x004bc4c0`  
**Mức độ tin cậy:** 100% (bằng chứng assembly từ lệnh thực thi thực tế)

---

## 1. Bản Đồ Không Gian Địa Chỉ (Address Space Mapping)

Quá trình khởi tạo máy tính ảo fx-580VN X được thiết lập trong hàm `0x004bc6d6` của `fx_580vn_x_emulator.exe` thông qua các API của `SimU8.dll`:

```
0x00000 ┌───────────────────────────────────────────┐
        │                                           │
        │             CODE MEMORY (ROM)             │
        │               Dung lượng: 256 KB          │
        │        (0x000000 đến 0x03FFFF)            │
        │                                           │
0x3FFFF └───────────────────────────────────────────┘

0x00000 ┌───────────────────────────────────────────┐
        │  ROM WINDOW (Ánh xạ đọc từ Code Memory)   │  <-- SetRomWindowSize(0x0, 0xCFFF)
0x0CFFF └───────────────────────────────────────────┘
        │  VÙNG DỰ TRỮ (Reserved / I/O)             │
0x0D000 ┌───────────────────────────────────────────┐
        │                                           │
        │             DATA MEMORY (RAM)             │  <-- SetDataMemorySize(0xD000, 0x8FFFF)
        │                                           │
0x0F800 │  ┌─────────────────────────────────────┐  │
        │  │ LCD VRAM (Display Buffer - 2,048 B) │  │  <-- ReadDataMemory(0xF800, 0x800)
0x0FFFF │  └─────────────────────────────────────┘  │
        │                                           │
        │  I/O & Internal Hardware Registers        │
        │  - 0x0F014: Thanh ghi ngắt bàn phím       │  <-- WriteBitDataMemory(0xF014, bit=5, val=1)
        │  - 0x48E00: Cờ VSync / Refresh LCD        │  <-- Đọc kiểm tra = 1 trước khi vẽ lại
        │  - 0x48E01: Thanh ghi Hàng phím (Row)     │  <-- WriteDataMemory(0x48E01, 1, &row)
        │  - 0x48E02: Thanh ghi Cột phím (Col)      │  <-- WriteDataMemory(0x48E02, 1, &col)
        │                                           │
0x8FFFF └───────────────────────────────────────────┘
```

---

## 2. Chi Tiết Các Cấu Hình Bộ Nhớ (Memory Configurations)

### 2.1. Phân vùng mã lệnh (Code Memory)
- **Thiết lập:** `SetCodeMemorySize(0x00000, 0x03FFFF)` tại `0x004bc6ef`.
- **Dung lượng:** $262,144$ bytes ($256$ KB).
- **Thuộc tính:** Chỉ đọc đối với CPU (`Read-Only`). Chứa toàn bộ firmware hệ điều hành toán học, giải phương trình, ma trận, bảng tính spreadsheet của Casio fx-580VN X.
- **Nguồn nạp ROM:** Được `fx_580vn_x_emulator.exe` khởi tạo trực tiếp vào bộ nhớ thông qua chuỗi các lệnh `WriteCodeMemory` lúc nạp máy tính (không sử dụng file ROM nhị phân rời bên ngoài).

### 2.2. Phân vùng dữ liệu (Data Memory RAM)
- **Thiết lập:** `SetDataMemorySize(0x0D000, 0x08FFFF)` tại `0x004bc6ff`.
- **Dung lượng:** $520$ KB vùng RAM và thanh ghi I/O.
- **Thuộc tính:** Đọc/Ghi (`Read/Write`).
- Chứa các biến nhớ máy tính (`A, B, C, D, E, F, x, y, M, Ans`), bộ nhớ lịch sử phép tính (Calculation History), ngăn xếp hàm tính toán và dữ liệu tạm của ma trận/vector/bảng tính.

### 2.3. Cửa sổ ánh xạ ROM (ROM Window)
- **Thiết lập:** `SetRomWindowSize(0x00000, 0x0CFFF)` tại `0x004bc70c`.
- **Dung lượng cửa sổ:** $52$ KB ($0x0000$ đến $0xCFFF$).
- **Cơ chế hoạt động (đã xác thực qua hàm `ReadDMemory` và `WriteDMemory`):**
  - Khi CPU truy cập đọc (`ReadDMemory`) một địa chỉ nằm trong khoảng $[0x0000, 0xCFFF]$, hệ thống tự động ánh xạ đọc trực tiếp từ **Code Memory (ROM)**.
  - Khi CPU ghi (`WriteDMemory`) vào vùng này, hàm lập tức bỏ qua thao tác ghi (bảo vệ ROM không bị ghi đè dữ liệu).

---

## 3. Giao Tiếp Phần Cứng Màn Hình (LCD Display Interface)

Hàm cập nhật màn hình tại VA `0x004bc4c0`:

1. **Kiểm tra cờ sẵn sàng (VSync):**
   - Đọc 1 byte từ địa chỉ `0x48E00` trong Data Memory qua `ReadDataMemory(0x48E00, 1, &status)`.
   - Nếu `status == 1`: CPU u8 đã hoàn tất kết xuất một khung hình mới vào bộ đệm VRAM.
2. **Đọc bộ nhớ hiển thị (VRAM Read):**
   - Lệnh gọi: `ReadDataMemory(0x0F800, 0x0800, buffer)`
   - Vùng nhớ VRAM nằm tại khoảng địa chỉ **`0x0F800` – `0x0FFFF`**.
   - Kích thước: **$2,048$ bytes ($2$ KB)**.
3. **Quy cách hiển thị Casio ClassWiz fx-580VN X:**
   - Màn hình đồ họa ma trận chấm kích thước: **192 × 63 pixels** (cùng hàng biểu tượng trạng thái phía trên: `SHIFT`, `ALPHA`, `D`, `R`, `G`, `FIX`, `SCI`, `M`, `STO`, `Math`, biểu tượng pin/mặt trời).
   - $192 \text{ cột} \times 8 \text{ hàng byte} = 1,536 \text{ bytes}$.
   - Phần byte còn lại trong 2,048 bytes dùng lưu trạng thái các icon thông báo và cờ điều khiển phần cứng LCD.

---

## 4. Giao Tiếp Bàn Phím (Keyboard Hardware Matrix Interface)

Khi người dùng nhấn một phím trên bàn phím:

1. **Xác định tọa độ ma trận:**
   - Mỗi phím tương ứng với một cặp bitmask `(Row, Col)` (ví dụ phím `[7]` là `Row=0x04, Col=0x01`).
2. **Ghi vào thanh ghi phần cứng:**
   - Ghi mã hàng phím vào `0x48E01`: `WriteDataMemory(0x48E01, 1, &row)`
   - Ghi mã cột phím vào `0x48E02`: `WriteDataMemory(0x48E02, 1, &col)`
3. **Kích hoạt ngắt bàn phím (Keyboard Interrupt Request):**
   - Lệnh gọi: `WriteBitDataMemory(0x0F014, bit=5, val=1)` tại `0x004bc583`.
   - Bật bit thứ 5 của thanh ghi `0x0F014` lên `1` để báo cho lõi CPU u8 biết có sự kiện bấm phím.
   - Khi `m_CheckInterrupt` trong CPU quét qua, nó sẽ nhận ra ngắt bàn phím đang chờ xử lý và kích hoạt chương trình xử lý ngắt (Interrupt Handler) để đọc `0x48E01` và `0x48E02`.

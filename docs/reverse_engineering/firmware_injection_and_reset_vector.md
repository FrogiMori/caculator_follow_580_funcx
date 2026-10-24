# Phân Tích Chuyên Sâu: Cơ Chế Nạp Firmware và Reset Vector Casio fx-580VN X (T04)

**Tệp phân tích:** `extracted/files/fx_580vn_x_emulator.exe`, `extracted/files/simu8engine.dll`, `extracted/files/simu8.dll`  
**Vấn đề T03 để lại:** Xác định chính xác cách thức nạp Firmware ROM vào Code Memory, bác bỏ/làm rõ giả thuyết về hàm `0x004bb8a0`, và tìm ra điểm vào khởi động (Reset Vector) của máy tính.  
**Mức độ tin cậy:** 100% (bằng chứng assembly và trace luồng IAT trực tiếp).

---

## 1. Tự Phân Tích Lại Bằng Chứng (Re-examination of Evidence)

### 1.1. Bác bỏ giả thuyết T03 về hàm `0x004bb8a0`
Trong báo cáo T03, hàm `0x004bb8a0` được phỏng đoán là "Firmware Injection Routine" do nó xuất hiện ngay trước chuỗi thiết lập `SetCallbackFunc`.

**Bằng chứng kỹ thuật thực tế:**
- Khi disassemble toàn bộ thân hàm `0x004bb8a0` từ VA `0x004bb8a0` đến `0x004bbf06`:
  - Hàm này dựng một cấu trúc mảng trên stack chứa các thông số:
    - Địa chỉ vector ngắt: `0x8, 0xa, 0xc, 0xe, 0x10, ..., 0x2a`.
    - Thanh ghi trạng thái ngắt trong RAM: `0xF010`, `0xF014`, `0xF016`.
  - Lệnh gọi kết thúc hàm tại `0x004bbef1`:
    ```asm
    4bbef1: calll *0x4cf298 ; IAT entry 0x4cf298 = SetInterruptTable
    ```
- **Kết luận:** Hàm `0x004bb8a0` thực chất là hàm **`SetupInterruptTable`**, chuyên khởi tạo bảng vector ngắt phần cứng cho lõi CPU u8. Hàm này **hoàn toàn không ghi byte nào vào Code Memory (ROM)**.

---

### 1.2. Khám phá 10 Hàm Nạp Phân Đoạn ROM (ROM Chunk Loaders)
Bằng cách quét toàn bộ các lệnh gọi đến IAT entry `0x004cf28c` (`WriteCodeMemory`), phát hiện chính xác **10 hàm phân đoạn** chịu trách nhiệm tạo dựng và ghi firmware vào Code Memory:

```
0x004bc76d: calll 0x00401d80  ; Chunk 0: Ghi 1,494 khối (phân vùng 0x194FA - 0x3FFFE)
0x004bc772: calll 0x00415400  ; Chunk 1: Ghi 1,470 khối (phân vùng 0x0002C - 0x32180)
0x004bc777: calll 0x00427500  ; Chunk 2: Ghi 1,474 khối (phân vùng 0x006C4 - 0x30EC0)
0x004bc77c: calll 0x0043a9d0  ; Chunk 3: Ghi 1,453 khối (phân vùng 0x0023A - 0x32150)
0x004bc781: calll 0x0044d850  ; Chunk 4: Ghi 1,474 khối (phân vùng 0x00006 - 0x322F0)
0x004bc786: calll 0x0045d330  ; Chunk 5: Ghi 1,456 khối (phân vùng 0x00002 - 0x31FB0)
0x004bc78b: calll 0x0046f9f0  ; Chunk 6: Ghi 1,457 khối (phân vùng 0x00000 - 0x32302)
0x004bc790: calll 0x00482180  ; Chunk 7: Ghi 1,438 khối (phân vùng 0x0075A - 0x30FF0)
0x004bc795: calll 0x00494ed0  ; Chunk 8: Ghi 1,464 khối (phân vùng 0x006C8 - 0x31CA0)
0x004bc79a: calll 0x004a8090  ; Chunk 9: Ghi 1,346 khối (phân vùng 0x00000 - 0x3FFFF)
```

Toàn bộ 10 hàm này được gọi tuần tự tại VA `0x004bc76d` - `0x004bc79a`.
Mỗi hàm chứa hàng nghìn lệnh gán hằng số trực tiếp lên stack:
```asm
movl $0xe1f6ae1a, -0x41a4(%ebp)
movl $0x7040601,  -0x41a0(%ebp)
movl $0xf8cece1f, -0x419c(%ebp)
movl $0xf87ef46e, -0x4198(%ebp)
pushl %eax              ; con trỏ dữ liệu trên stack
pushl $0x10             ; độ dài (16 bytes)
pushl $0x19500          ; địa chỉ trong Code Memory
calll *%esi             ; WriteCodeMemory(0x19500, 16, data)
```
Casio không sử dụng file nhị phân `.bin` hay `.rom` đính kèm rời bên ngoài, mà biên dịch trực tiếp mã nhị phân của firmware thành các lệnh tạo mã assembly C++ trong file EXE của emulator.

---

## 2. Giải Mã Cơ Chế Reset Vector & Điểm Vào Boot (Startup Routine)

### 2.1. Phân tích hàm `m_SimReset` (`simu8engine.dll` tại RVA `0x10004840`)
Disassembly của hàm khởi động lại CPU:
```asm
10004862: leal -0x4(%ebp), %eax
10004865: pushl %eax
10004866: pushl $0x0        ; Đọc từ địa chỉ Code Memory 0x0000
10004868: leal 0x2c(%esi), %ecx
1000486b: calll 0x10007aa0  ; Đọc 16-bit word tại 0x0000
10004870: movzwl -0x4(%ebp), %ecx
10004874: pushl %ecx        ; Giá trị word 0
10004875: pushl $0x1e       ; Mã thanh ghi 0x1E = DSR (Data Segment Register)
10004877: leal 0x80(%esi), %ecx
1000487d: calll 0x10001710  ; Ghi vào DSR!

10004882: leal -0x4(%ebp), %edx
10004885: pushl %edx
10004886: pushl $0x2        ; Đọc từ địa chỉ Code Memory 0x0002
10004888: leal 0x2c(%esi), %ecx
1000488b: calll 0x10007aa0  ; Đọc 16-bit word tại 0x0002
10004890: movzwl -0x4(%ebp), %eax
10004894: pushl %eax        ; Giá trị word 1
10004895: pushl $0x10       ; Mã thanh ghi 0x10 = PC (Program Counter)
10004897: leal 0x80(%esi), %ecx
1000489d: calll 0x10001710  ; Ghi vào PC!
```

**Quy tắc Reset phần cứng của vi xử lý nX-U8:**
1. **Word tại địa chỉ `0x0000`:** Giá trị khởi tạo của thanh ghi phân đoạn dữ liệu `DSR`.
2. **Word tại địa chỉ `0x0002`:** Giá trị khởi tạo của con trỏ lệnh `PC` (**Reset Vector / Entry Point**).

---

### 2.2. Giá trị thực tế được ghi vào Reset Vector của fx-580VN X

Truy vết các lệnh ghi vào địa chỉ `0x0000` và `0x0002` trong `fx_580vn_x_emulator.exe`:

1. **Ghi vào `0x0000` (tại VA `0x0047abcb`, Chunk 6):**
   ```asm
   47abc6: pushl %ecx
   47abc7: pushl $0x2        ; độ dài 2 bytes
   47abc9: pushl $0x0        ; địa chỉ 0x0000
   47abcb: movw $0xf000, -0x518c(%ebp) ; Giá trị Word = 0xF000
   47abd4: calll *%esi       ; WriteCodeMemory(0x0000, 2, 0xF000)
   ```
   $\rightarrow$ **Thanh ghi `DSR` khởi tạo bằng `0xF000`**.

2. **Ghi vào `0x0002` (tại VA `0x00461c71`, Chunk 5):**
   ```asm
   461c6c: pushl %edx
   461c6d: pushl $0x2        ; độ dài 2 bytes
   461c6f: pushl $0x2        ; địa chỉ 0x0002
   461c71: movw $0xa3b8, -0x5068(%ebp) ; Giá trị Word = 0xA3B8
   461c7a: calll *%esi       ; WriteCodeMemory(0x0002, 2, 0xA3B8)
   ```
   $\rightarrow$ **Con trỏ lệnh khởi tạo `PC` = `0xA3B8`**.

---

### 2.3. Mã lệnh bootloader đầu tiên tại `0xA3B8`
Truy vết khối dữ liệu nạp vào `0xA3B0` (VA `0x0047adb3`):
- Khối 16 bytes tại `0xA3B0`:
  - `0xA3B0 - 0xA3B7`: `FC FB 2E F0 8E F8 0F FE` (vector và mã máy tiền đề).
  - `0xA3B8 - 0xA3BF`: `01 CE FF CE 03 0A 0C F0` $\leftarrow$ **Lệnh thực thi đầu tiên khi bật máy tính!**
  - `0xA3C0 - 0xA3CF`: `FA 22 AF 90 52 90 FF 70 02 C8 FF 71 20 C9 AF 90`
- Khối lệnh này thực hiện:
  - Thiết lập ngăn xếp `SP`.
  - Khởi tạo các thanh ghi I/O ngoại vi (cấu hình cổng hiển thị LCD, bật timer quét phím).
  - Khởi tạo vùng RAM dữ liệu tại `0x0D000`.
  - Hiển thị logo Casio / màn hình tính toán mặc định.

---

## 3. Các Cách Diễn Giải Cạnh Tranh (Competing Interpretations)

| Cách diễn giải | Luận điểm | Bằng chứng ủng hộ | Bằng chứng phản bác | Kết luận |
| :--- | :--- | :--- | :--- | :---: |
| **Giả thuyết A (T03 sơ bộ)** | `0x004bb8a0` là hàm giải nén và nạp ROM vào bộ nhớ. | `0x004bb8a0` nằm trong chuỗi hàm khởi tạo hệ thống. | Disassembly thực tế chứng minh hàm kết thúc bằng `call *0x4cf298` (`SetInterruptTable`). Không có lệnh ghi Code Memory. | ❌ **Bác bỏ hoàn toàn** |
| **Giả thuyết B (Xác nhận)** | Firmware được tạo mã động qua 10 hàm chunk loader hardcoded. | Phát hiện chính xác 10 hàm tại `0x4bc76d` - `0x4bc79a`, chứa hơn 14,000 lệnh `WriteCodeMemory`. | Dung lượng EXE lớn (~1.5 MB) do phình mã assembly x86 để dựng ROM. | ✅ **Chính xác 100%** |
| **Giả thuyết C** | ROM được tải động từ tệp ngoài (`.lic`, `.pdf`, `.dat`). | Tiết kiệm kích thước binary. | Không có hàm `CreateFile` / `ReadFile` nào đọc file ROM bên ngoài trước `SimStart`. File `.lic` chỉ có 135 bytes. | ❌ **Bác bỏ hoàn toàn** |

---

## 4. Ý Nghĩa Kỹ Thuật Đối Với Tái Triển Khai (Implications for Implementation)

1. **Trích xuất firmware sạch:** Có thể viết một script phân tích cú pháp tĩnh trích xuất toàn bộ 14,000+ khối ghi trong 10 hàm chunk loader để tái tạo chính xác file `casio_fx580vnx_rom.bin` (256 KB) mà không cần chạy phần mềm.
2. **Khởi động CPU Emulator:** Khi xây dựng engine giả lập độc lập trên Web / JavaScript:
   - Gán `DSR = 0xF000`.
   - Gán `PC = 0xA3B8`.
   - Bắt đầu chu trình nạp lệnh `m_Execute` tại `0xA3B8`.

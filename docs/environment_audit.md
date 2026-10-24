# Báo Cáo Kiểm Kê Môi Trường & Project (T00)

**Dự án:** Phân tích / Reverse Engineering `ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`  
**Ngày thực hiện:** 23/10/2026  
**Trạng thái T00:** Hoàn thành kiểm kê (Completed)

---

## 1. Thông Tin Môi Trường Thực Thi

| Thành phần | Thông tin xác minh thực tế | Ghi chú |
| :--- | :--- | :--- |
| **Thư mục làm việc** | `/Users/nam/rea_casio580vnx` | Đã xác minh bằng `pwd` |
| **Hệ điều hành** | macOS 26.6.2 (Darwin Kernel 25.6.0) | Đã xác minh bằng `sw_vers`, `uname -a` |
| **Kiến trúc CPU** | `arm64` (Apple Silicon) | Đã xác minh bằng `arch` |
| **Shell** | `zsh` | Shell mặc định |
| **Quản lý gói** | Homebrew 7.0.10 (`/opt/homebrew/bin/brew`) | Sẵn sàng để cài công cụ khi cần |

---

## 2. Kiểm Kê Binary Gốc

### 2.1. Vị trí & Thuộc tính file
- **Đường dẫn tuyệt đối:** `/Users/nam/rea_casio580vnx/ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`
- **Kích thước file:** `19,717,566` bytes (~18.80 MB)
- **Định dạng nhận diện:** `PE32 executable (GUI) Intel 80386, for MS Windows` (x86 32-bit PE GUI)
- **Ngày sửa đổi cuối (mtime):** 15/08/2018

### 2.2. Bằng chứng Hash
- **SHA-256:** `4fcb5bb4dfea08d98aabea74394257854dee1fa64dab95d9b5d4fe9826478a54`
- **MD5:** `a7aece6bacd95fc271f6bc1d3f5504df`

> **Cam kết:** Binary gốc được giữ nguyên vẹn 100%, không bị sửa đổi, đổi tên, ghi đè hoặc thực thi trong suốt quá trình thực hiện T00.

---

## 3. Kiểm Kê Công Cụ Phân Tích

### 3.1. Công cụ đã có sẵn (Verified Present)
| Công cụ | Đường dẫn | Phiên bản / Chi tiết | Khả năng ứng dụng |
| :--- | :--- | :--- | :--- |
| `file` | `/usr/bin/file` | `file-5.41` | Kiểm tra signature & file header |
| `strings` | `/usr/bin/strings` | Apple BSD strings | Trích xuất chuỗi ASCII / UTF-8 |
| `xxd` | `/usr/bin/xxd` | `xxd 2025-08-24 by Juergen Weigert` | Hex dump, hex inspection |
| `hexdump` / `od` | `/usr/bin/hexdump`, `/usr/bin/od` | BSD utilities | Kiểm tra raw byte offset |
| `python3` | `/opt/homebrew/bin/python3` | Python 3.14.7 | Viết script phân tích, giải mã, parse binary |
| `pip3` | `/opt/homebrew/bin/pip3` | pip 26.2.1 | Quản lý thư viện Python |
| `node` / `npm` | `/opt/homebrew/bin/node` | Node v26.7.0 / npm 11.19.0 | Viết tooling hoặc runtime giả lập nếu cần |
| `objdump` | `/usr/bin/objdump` | Apple LLVM 21.0.0 | LLVM objdump (chủ yếu tối ưu cho Mach-O) |
| `otool` / `nm` | `/usr/bin/otool`, `/usr/bin/nm` | Apple cctools-1040 / llvm-nm | Kiểm tra symbols (chủ yếu cho Mach-O) |
| `lldb` | `/usr/bin/lldb` | LLDB debugger | Debugger native (không debug trực tiếp Windows PE32) |
| Python standard: `struct`, `dis`, `zipfile`, `tarfile` | Built-in | Chuẩn Python 3.14 | Xử lý file cấu trúc nhị phân và archive cơ bản |

### 3.2. Công cụ còn thiếu (Missing / Not Found)
| Phân nhóm | Công cụ | Trạng thái | Ghi chú & Đề xuất |
| :--- | :--- | :--- | :--- |
| **PE Parser** | `pefile` (Python) | Chưa cài đặt | Cần thiết để bóc tách PE headers, sections, imports, resources bằng Python. Có thể cài qua `pip` hoặc dùng script parser tự viết. |
| **Trích xuất Archive / Installer** | `7z` / `7za` / `p7zip` | Chưa cài đặt | Hữu ích để kiểm tra xem file EXE có phải dạng installer / self-extracting archive (SFX, Inno, InstallShield, Wise, MSI wrap). |
| | `innoextract`, `cabextract`, `unshield` | Chưa cài đặt | Hữu ích nếu EXE là một trình cài đặt đóng gói các file bên trong. |
| **Disassembler / Decompiler** | `ghidra` | Chưa cài đặt | Decompiler x86 32-bit mạnh mẽ. |
| | `radare2` / `r2` | Chưa cài đặt | CLI disassembler/analyzer. |
| | `capstone` (Python) | Chưa cài đặt | Thư viện disassembly phục vụ script tự động. |
| **Giả lập / Runtime** | `wine` / `wine64` | Chưa cài đặt | Cần thiết nếu muốn chạy thử nghiệm môi trường Windows PE trên macOS arm64. |

---

## 4. Phân Biệt Thông Tin & Giới Hạn Môi Trường

### 4.1. Thông tin đã xác minh (Verified Facts)
1. Thư mục dự án chỉ chứa 1 file duy nhất ban đầu: `ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`.
2. File là định dạng Windows PE32 x86 GUI (Intel 80386).
3. Host máy phát triển là macOS `arm64`.
4. Không có công cụ phân tích ngược PE32 chuyên dụng chuyên sâu (như `pefile`, `ghidra`, `radare2`, `7z`) được cài sẵn; tuy nhiên môi trường có đầy đủ Python 3.14, Node.js, `brew`, và các công cụ Unix cơ bản (`file`, `strings`, `xxd`).

### 4.2. Thông tin chưa xác minh (Unverified Info)
1. **Bản chất file EXE:** Đây là file thực thi độc lập (standalone executable), hay là bộ cài đặt (installer: InstallShield / Inno Setup / NSIS / WiX), hay là PE đóng gói kèm engine/ROM? (Sẽ xác minh ở các task tiếp theo).
2. **Cơ chế bảo vệ:** File có sử dụng packer/protector (như UPX, Themida, VMProtect) hay kiểm tra license subscription hay không.

### 4.3. Giới hạn môi trường (Environment Constraints)
- **Kiến trúc chéo (Cross-Architecture & Cross-OS):** Chạy trực tiếp file PE32 Windows trên macOS ARM64 không khả thi nếu không có layer chuyển đổi (như Wine + Rosetta2 hoặc VM Windows x86/ARM).
- **Quy tắc an toàn T00:** Tuyệt đối không cài đặt hàng loạt công cụ ngoài luồng và không thay đổi binary khi chưa có phê duyệt kế hoạch từng bước.

---

## 5. Kết Luận & Đề Xuất Bước Kế Tiếp

- **Nhiệm vụ T00:** Đạt mục tiêu kiểm kê dự án và môi trường, lưu trữ hashes xác thực.
- **Đề xuất cho bước tiếp theo (T01):**
  - Tận dụng Python (`struct` / script tự viết) hoặc cài đặt tối giản thư viện `pefile` / `7z` để phân tích headers, xác định loại installer / packer mà không cần chạy binary.

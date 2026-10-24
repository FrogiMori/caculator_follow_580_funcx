# Báo Cáo Phân Tích Tĩnh Binary (T01)

**Tệp mục tiêu:** `ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`  
**Đường dẫn tuyệt đối:** `/Users/nam/rea_casio580vnx/ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`  
**Dung lượng:** `19,717,566` bytes (~18.80 MB)  
**SHA-256:** `4fcb5bb4dfea08d98aabea74394257854dee1fa64dab95d9b5d4fe9826478a54`  
**Ngày phân tích:** 23/10/2026  
**Trạng thái:** Hoàn thành (Không sửa đổi, không thực thi binary)

---

## 1. Bản Chất Của Tệp Mục Tiêu (Core Finding)

> [!IMPORTANT]
> **Phát hiện cốt lõi:** Tệp `ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe` **KHÔNG PHẢI** là binary chạy trực tiếp của phần mềm giả lập máy tính, mà là một **trình cài đặt tự bung (InstallShield Setup Launcher / MSI Bootstrapper)**.
> - **Phần PE executable (stub):** Chiếm khoảng `919,552` bytes (~898 KB).
> - **Phần dữ liệu đóng gói đính kèm (Overlay):** Chiếm tới `18,798,014` bytes (~17.93 MB, chiếm 95.3% dung lượng tệp).
> - **Nội dung bên trong Overlay:** Chứa 48 tệp dữ liệu được mã hóa/nén, trong đó tệp payload chính là gói cài đặt Windows Installer: **`ClassWiz Emulator Subscription for fx-580VN X.msi`** (kích thước nén ~16.98 MB).

---

## 2. Thông Số Kỹ Thuật Định Dạng PE (PE Header Analysis)

### 2.1. Cấu trúc tổng quát & Kiến trúc
- **Định dạng:** PE32 (Portable Executable 32-bit).
- **Kiến trúc CPU mục tiêu (Machine):** `0x014c` -> **Intel 80386 (x86 32-bit)**.
- **PE Magic:** `0x010b` (PE32 chuẩn).
- **Subsystem:** `2` (`IMAGE_SUBSYSTEM_WINDOWS_GUI` - Ứng dụng đồ họa Windows).
- **ImageBase:** `0x00400000`.
- **AddressOfEntryPoint:** RVA `0x00056683` (VA `0x00456683`).
- **Section Alignment:** `0x1000` (4096 bytes).
- **File Alignment:** `0x0200` (512 bytes).
- **TimeDateStamp:** `1253595570` (`2009-09-22 04:59:30 UTC`).
- **Characteristics:** `0x010f` (`RELOCS_STRIPPED | EXECUTABLE_IMAGE | LINE_NUMS_STRIPPED | LOCAL_SYMS_STRIPPED | 32BIT_MACHINE`).
- **DllCharacteristics:** `0x8000` (`IMAGE_DLLCHARACTERISTICS_TERMINAL_SERVER_AWARE`).

### 2.2. Trình biên dịch & Chuỗi công cụ (Compiler / Toolchain)
- **Linker Version:** `6.0` (Microsoft Visual Studio C++ Linker).
- **Debug Record (CodeView NB10):**
  - **Định dạng PDB:** `NB10` (CodeView format).
  - **Đường dẫn PDB gốc (Original PDB Path):**  
    `C:\CodeBases\isdev\src\Runtime\MSI\Shared\Setup\Setup___Win32_Release_Unicode\setupW.pdb`
  - **Chỉ dấu toolchain:** Mã nguồn thuộc hệ thống phát triển **InstallShield Developer (isdev)** của Acresso / Flexera Software (`setupW.exe` - Unicode release).

### 2.3. Bảng phân vùng (PE Sections)
Tệp PE stub gồm đúng 4 sections chuẩn:

| Tên Section | Virtual Address | Virtual Size | Raw Data Ptr | Raw Data Size | Flags (Characteristics) | Ý nghĩa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `.text` | `0x00001000` | `0x000745b0` | `0x00000400` | `0x00074600` | `0x60000020` | Mã máy thực thi (Code, Executable, Readable) |
| `.rdata` | `0x00076000` | `0x0001342c` | `0x00074a00` | `0x00013600` | `0x40000040` | Dữ liệu chỉ đọc (Import tables, string constants, RTTI) |
| `.data` | `0x0008a000` | `0x0000ff48` | `0x00088000` | `0x0000a800` | `0xc0000040` | Biến toàn cục đọc/ghi (Initialized data) |
| `.rsrc` | `0x0009a000` | `0x0004de54` | `0x00092800` | `0x0004e000` | `0x40000040` | Tài nguyên nhúng (Icons, dialogs, manifest, version) |

- **Điểm kết thúc của các PE Sections trên đĩa:** `0x000e0800` (919,552 bytes).
- **Vùng Overlay (Appended Data):** Từ offset `0x000e0800` đến hết tệp `0x012cddbe` (`18,798,014` bytes).

---

## 3. Phân Tích Thư Viện Liên Kết & Runtime (Imports)

Thư mục `COM_DESCRIPTOR (.NET Runtime)` có RVA = `0x0` và Size = `0x0`.  
-> **Xác nhận 100%:** PE launcher stub là **Native Win32**, hoàn toàn không sử dụng runtime .NET Managed.

Các thư viện Windows API được import trực tiếp:
1. **`KERNEL32.dll` (174 hàm):** Quản lý bộ nhớ (`GlobalAlloc`, `GlobalLock`), tài nguyên (`FindResourceW`, `LoadResource`), tệp tin & thư mục tạm (`GetTempPathW`, `GetTempFileNameW`), command line (`GetCommandLineW`), đồng bộ hóa thread.
2. **`USER32.dll` (65 hàm):** Giao diện Win32 dialogs (`CreateDialogParamW`, `MessageBoxW`, `SetDlgItemTextW`, `EnableWindow`).
3. **`GDI32.dll` (22 hàm):** Bảng màu, hiển thị hình ảnh (`CreatePalette`, `RealizePalette`, `CreateFontW`, `SetTextColor`).
4. **`ADVAPI32.dll` (26 hàm):** Registry (`RegOpenKeyExA`, `RegQueryValueExA`, `RegDeleteKeyW`) và token bảo mật/quyền hệ thống (`OpenProcessToken`, `AdjustTokenPrivileges`).
5. **`SHELL32.dll` (7 hàm):** `ShellExecuteExW`, `SHBrowseForFolderW`, `CommandLineToArgvW`.
6. **`ole32.dll` (12 hàm):** Quản lý COM/OLE (`CoCreateInstance`, `CoInitializeSecurity`, `CLSIDFromProgID`).
7. **`OLEAUT32.dll` (12 hàm):** OLE Automation & BSTR handling.
8. **`VERSION.dll` (3 hàm):** Đọc phiên bản tệp (`GetFileVersionInfoW`, `VerQueryValueW`).
9. **`COMCTL32.dll` (1 hàm):** Common controls.
10. **`RPCRT4.dll` (4 hàm):** Tạo GUID (`UuidCreate`, `UuidToStringW`).

---

## 4. Tài Nguyên & Metadata (Resources, Version, Manifest)

### 4.1. Version Info (RT_VERSION)
- **Tên sản phẩm (ProductName):** `ClassWiz Emulator Subscription for fx-580VN X`
- **Mô tả (FileDescription):** `ClassWiz Emulator Subscription for fx-580VN X`
- **Phiên bản tệp (FileVersion):** `2.00.0000`
- **Phiên bản sản phẩm (ProductVersion):** `2.00.0000`
- **Tên nội bộ (InternalName):** `Setup`
- **Tên tệp gốc (OriginalFilename):** `Setup.exe`
- **Công ty (CompanyName):** `CASIO COMPUTER CO., LTD.`
- **Bản quyền (LegalCopyright):** `Copyright (C) 2018 CASIO COMPUTER CO., LTD.`

### 4.2. Application Manifest (RT_MANIFEST)
- **Assembly Identity:**
  - `name`: `InstallShield.Setup`
  - `type`: `win32`
  - `processorArchitecture`: `X86`
  - `version`: `1.0.0.0`
- **Yêu cầu đặc quyền (requestedExecutionLevel):**
  - `level="requireAdministrator"`: Bộ cài đặt yêu cầu quyền Administrator ngay khi khởi chạy để có thể cài đặt MSI và ghi vào Program Files/Registry.
- **Tính tương thích hệ điều hành (supportedOS):**
  - Windows Vista: `{e2011457-1546-43c5-a5fe-008deee3d3f0}`
  - Windows 7: `{35138b9a-5d96-4fbd-8e2d-a2440225f93a}`

---

## 5. Phân Tích Cấu Trúc Gói Đóng Gói (Overlay Architecture)

### 5.1. Cấu trúc đóng gói của InstallShield Setup Launcher
Tại offset `0x000e0869` xuất hiện header của bộ đóng gói InstallShield:
- **Marker / Signature:** `InstallShield\0` (14 bytes)
- **Số lượng tệp được nhúng:** `48` tệp.
- **Định dạng bản ghi mỗi tệp:**
  - `Filename`: 260 bytes (mảng ký tự kết thúc bằng null).
  - `Metadata`: 52 bytes (chứa cờ, kích thước nén, offset).
  - `Compressed Stream`: Dữ liệu stream tương ứng với kích thước nén.

### 5.2. Cơ chế giải mã và giải nén (Verified Deobfuscation & Decompression)
Đã xác minh bằng chứng kỹ thuật về thuật toán InstallShield áp dụng lên từng stream tệp:
1. **Giải mã (Deobfuscation):** Dữ liệu được mã hóa dạng xoay bit (nibble swap) kết hợp XOR với khóa suy dẫn từ tên tệp (seed là chuỗi `filename`):
   ```python
   magic = [0x13, 0x35, 0x86, 0x07]
   key = [seed[i] ^ magic[i % 4] for i in range(len(seed))]
   # Mở rộng key thành block 1024 bytes
   decoded_byte = (~(k ^ ((b << 4 | b >> 4) & 0xFF))) & 0xFF
   ```
2. **Giải nén (Decompression):** Sau khi giải mã, khối dữ liệu có signature `0x78 0x9c` (chuẩn RFC 1950 **zlib Deflate**) và giải nén thành dữ liệu gốc hoàn chỉnh.

### 5.3. Danh sách các thành phần nhúng chính (48 tệp)
| Nhóm thành phần | Số lượng | Chi tiết đáng chú ý |
| :--- | :--- | :--- |
| **Gói cài đặt chính (MSI Package)** | 1 tệp | **`ClassWiz Emulator Subscription for fx-580VN X.msi`** (17,806,504 bytes nén tại offset `0x1d2261`). Header giải nén được xác thực: `D0 CF 11 E0 A1 B1 1A E1` (Microsoft Compound File / OLE2). |
| **Cấu hình cài đặt** | 1 tệp | **`Setup.ini`** (1,405 bytes tại offset `0x12cd841`). |
| **Tệp ngôn ngữ (Transforms - `.mst`)** | 23 tệp | Bao gồm `1033.mst` (English), **`1066.mst` (Vietnamese - Tiếng Việt)**, `1041.mst` (Japanese), v.v. |
| **Tệp thiết lập ngôn ngữ (`.ini`)** | 23 tệp | `0x0409.ini` (English), `0x0401.ini` (Arabic), `0x0411.ini` (Japanese), v.v. |

### 5.4. Trích xuất thông tin cấu hình từ `Setup.ini` (Đã giải nén)
- `Product = ClassWiz Emulator Subscription for fx-580VN X`
- `PackageName = ClassWiz Emulator Subscription for fx-580VN X.msi`
- `ProductCode = {5B5E7480-A76F-4F03-84E9-4D1F34519FC3}`
- `PackageCode = {2BAAEAF6-31DC-4761-87E6-046548D87D78}`
- `ProductVersion = 2.00.0000`
- `LauncherName = ClassWiz Emulator Subscription for fx-580VN X Ver.2.00.exe`
- `ScriptDriven = 0` (Dự án thuộc loại **Basic MSI**, không dùng engine InstallScript tùy biến).
- `DotNetOptionalInstallIfSilent = N`

---

## 6. Phân Biệt Bằng Chứng Thực Tế và Giả Thuyết

| Nội dung | Phân loại | Căn cứ / Bằng chứng |
| :--- | :--- | :--- |
| **Bản chất tệp EXE** | **Bằng chứng trực tiếp** | Header PE32 x86 kết thúc ở byte `919,552`; overlay `18,798,014` bytes chứa bảng 48 tệp và header `InstallShield\0`. |
| **Stub Launcher là Native PE** | **Bằng chứng trực tiếp** | Thư mục `COM_DESCRIPTOR` (CLR Header) = 0; import trực tiếp KERNEL32, USER32, GDI32. |
| **Sự hiện diện của gói MSI** | **Bằng chứng trực tiếp** | Đã giải mã byte đầu của tệp nhúng tại offset `0x1d2261` và xác thực magic OLE Compound File `\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1`. |
| **Cấu hình & Phiên bản** | **Bằng chứng trực tiếp** | Đã giải mã hoàn chỉnh nội dung `Setup.ini` và cấu trúc `RT_VERSION`. |
| **Framework của ứng dụng giả lập cuối** | **Giả thuyết (Chưa có bằng chứng trực tiếp)** | Chưa thể kết luận chương trình giả lập Casio (bên trong MSI) viết bằng C++, MFC, hay C#/.NET, do binary thực sự của emulator nằm trong gói `.msi` (chưa bóc tách các tệp DLL/EXE bên trong MSI). Tuy nhiên việc `Setup.ini` đánh dấu `ScriptDriven=0` và không liệt kê .NET prerequisite gợi ý nhiều khả năng là Win32 Native C++. |

---

## 7. Các Lệnh & Kỹ Thuật Đã Sử Dụng

1. **Python `struct` & `io`:**
   - Xây dựng script phân tích PE header (`scratch/pe_analyzer.py`), bóc tách DOS, COFF, Optional Header, Data Directories, Section Table, Import Table.
2. **Python Resource Parser (`scratch/parse_resources.py`):**
   - Đọc cây thư mục `.rsrc`, bóc tách manifest XML (`RT_MANIFEST`) và thông tin phiên bản Unicode (`RT_VERSION`).
3. **Phân tích Overlay & Nghiên cứu định dạng InstallShield:**
   - Script quét signature (`scratch/scan_overlay.py`), tìm thấy bảng 48 file.
   - Script giải mã cipher nibble-swap + XOR (`scratch/test_decode.py`, `scratch/test_zlib_decomp.py`) và nén Deflate zlib, giải mã thành công `Setup.ini`.
   - Xác thực header MSI (`scratch/test_msi_header.py`).
4. **Unix Utilities:**
   - `shasum -a 256`: Kiểm tra tính toàn vẹn trước và sau phân tích (SHA-256 không đổi).
   - `file`: Xác nhận phân loại ban đầu.

---

## 8. Hạn Chế Của Môi Trường & Bước Phân Tích Tiếp Theo

### 8.1. Hạn chế hiện tại
- File EXE mục tiêu mới chỉ là "vỏ bọc" (wrapper/bootstrapper). Mọi chuỗi, hàm import, và metadata phân tích được ở bước T01 này phản ánh **trình cài đặt InstallShield**, chưa phải là mã nguồn hay thuật toán giả lập máy tính fx-580VN X.
- Môi trường macOS ARM64 không có sẵn công cụ Windows Installer SDK (`msiexec`, `lessmsi`).

### 8.2. Đề xuất bước tiếp theo (T02)
- **Bóc tách gói MSI:** Viết script Python (sử dụng OLE/Compound File parser chuẩn) hoặc công cụ unpack để trích xuất tệp `ClassWiz Emulator Subscription for fx-580VN X.msi` từ overlay mà không cần chạy binary.
- **Phân tích cấu trúc MSI Database:** Đọc các bảng `File`, `Component`, `Binary`, và `Media` bên trong tệp MSI để xác định chính xác danh sách binary của ứng dụng giả lập (tên file `.exe`, các file `.dll`, tài nguyên ROM / firmware của Casio fx-580VN X).

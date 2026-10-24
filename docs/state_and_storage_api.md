# Tài Liệu Kỹ Thuật API: Quản Lý Trạng Thái, Bộ Nhớ & Lịch Sử (T13)
**Thiết bị mục tiêu:** Casio fx-580VN X (ClassWiz Emulator Ver.2.00)  
**Phạm vi:** Tầng 7 - State Management, MemoryStore, HistoryRingBuffer & Persistent Storage

---

## 1. Tổng Quan Kiến Trúc Nguồn Trạng Thái Thống Nhất

Tuân thủ nghiêm ngặt nguyên tắc của T13:
1. **Nguồn trạng thái thống nhất (Single Source of Truth):** Lớp [`StateManager`](file:///Users/nam/rea_casio580vnx/src/state/StateManager.ts) chịu trách nhiệm điều phối toàn bộ vòng đời trạng thái của máy tính: biểu thức, con trỏ, kết quả, cờ biểu tượng màn hình, bộ nhớ biến và lịch sử tính toán.
2. **Tách biệt hoàn toàn bộ nhớ tính toán khỏi giao diện UI:** [`MemoryStore`](file:///Users/nam/rea_casio580vnx/src/state/MemoryStore.ts) lưu trữ các biến nhớ dưới dạng đối tượng toán học [`CalculationResult`](file:///Users/nam/rea_casio580vnx/src/engine/result.ts) (chính xác cả phân số và số thập phân), hoàn toàn không phụ thuộc vào DOM, Canvas hay chuỗi hiển thị.
3. **Phòng chống tấn công XSS (Cross-Site Scripting):** Mọi dữ liệu nhập từ người dùng hoặc khôi phục từ `localStorage` đều được kiểm tra, lọc sạch control characters, null bytes và escape ký tự nguy hiểm qua [`security.ts`](file:///Users/nam/rea_casio580vnx/src/state/security.ts). Dữ liệu vẽ lên màn hình LCD thông qua HTML5 Canvas API (`fillText`), tuyệt đối không dùng `innerHTML` với chuỗi người dùng.
4. **Cơ chế lưu trữ có khả năng phục hồi (Resilient Storage):** [`StorageManager`](file:///Users/nam/rea_casio580vnx/src/state/StorageAdapter.ts) tự động bắt lỗi `SecurityError` (khi cookie/storage bị chặn ở chế độ ẩn danh) và `QuotaExceededError`, tự động fallback về bộ nhớ RAM (`MemoryStorageBackend`) mà không làm crash ứng dụng.

---

## 2. Đặc Tả Chi Tiết Các Module

### 2.1. Quản Lý Bộ Nhớ Biến (`MemoryStore`)
- **Danh mục biến nhớ đã xác minh:** Gồm 9 biến do người dùng gán: `A, B, C, D, E, F, x, y, M` và biến kết quả gần nhất `Ans`.
- **Cơ chế hoạt động của biến nhớ M (Memory):**
  - Phím `M+`: Cộng giá trị biểu thức hiện tại (hoặc `Ans`) vào `M` ($M = M + \text{val}$).
  - Phím `M-` (`SHIFT` + `M+`): Trừ giá trị khỏi `M` ($M = M - \text{val}$).
  - Biểu tượng `M` trên thanh trạng thái: Tự động kích hoạt (`statusFlags.hasMemory = true`) khi $M \ne 0$; tự động tắt khi $M = 0$.
- **Phân loại xóa bộ nhớ:**
  - `resetVariablesOnly()`: Đưa các biến $A \dots F, X, Y, M$ về 0, giữ nguyên `Ans`.
  - `resetAll()`: Xóa sạch toàn bộ biến kể cả `Ans`.

```typescript
export class MemoryStore {
  public setVariable(name: string, value: CalculationResult | number | string): void;
  public getVariable(name: string): CalculationResult;
  public addToM(value: CalculationResult): CalculationResult;
  public subtractFromM(value: CalculationResult): CalculationResult;
  public hasMemory(): boolean;
  public exportRecord(): Record<string, string>;
  public importRecord(record: Record<string, string>): void;
  public toMap(): Map<string, CalculationResult>;
}
```

### 2.2. Lịch Sử Tính Toán Replay (`HistoryManager`)
- **Cơ chế hàng đợi vòng (Ring Buffer):** Mặc định lưu trữ tối đa 50 phép tính gần nhất. Khi vượt quá dung lượng, tự động loại bỏ mục cũ nhất.
- **Điều hướng hai chiều chuẩn Casio ClassWiz:**
  - Phím `▲` (`navigateUp`): Duyệt ngược về các phép tính trước đó. Biểu thức và kết quả cũ được đưa lên màn hình để người dùng có thể xem lại hoặc chỉnh sửa tiếp.
  - Phím `▼` (`navigateDown`): Duyệt xuôi về các phép tính mới hơn. Khi duyệt qua mục mới nhất, máy tự động quay về màn hình đệm nhập liệu trống.
- **Điều khiển biểu tượng cuộn LCD:**
  - `canScrollUp()`: Điều khiển icon `▲` trên LCD (`statusFlags.scrollUp`).
  - `canScrollDown()`: Điều khiển icon `▼` trên LCD (`statusFlags.scrollDown`).
- **Phím AC:** Xóa vùng đệm nhập hiện tại nhưng **giữ nguyên lịch sử Replay** (bấm `▲` sau AC vẫn gọi lại phép tính trước).

```typescript
export class HistoryManager {
  public addEntry(expression: string, result: string): HistoryEntry;
  public navigateUp(): HistoryEntry | null;
  public navigateDown(): HistoryEntry | null;
  public canScrollUp(): boolean;
  public canScrollDown(): boolean;
  public clear(): void;
  public loadEntries(rawList: unknown): void;
}
```

### 2.3. Bộ Điều Phối Trạng Thái Thống Nhất (`StateManager`)
- Là đầu mối tập trung (Single Source of Truth) kết nối tất cả các thành phần:
  - Cập nhật biểu thức, con trỏ và kết quả.
  - Tự động đồng bộ cờ `shift`, `alpha`, `angleUnit`, `math`, `hasMemory`, `scrollUp`, `scrollDown`.
  - Hỗ trợ mô hình Observer (`subscribe`) cho UI và các bộ điều khiển.

```typescript
export class StateManager {
  public getAppState(): AppState;
  public subscribe(listener: (state: AppState) => void): () => void;
  public setExpression(expression: string, cursorPosition?: number): void;
  public recordCalculation(expression: string, result: string, calcResult?: CalculationResult): void;
  public navigateHistoryUp(): boolean;
  public navigateHistoryDown(): boolean;
  public resetAll(): void;
  public saveToStorage(): boolean;
  public loadFromStorage(): boolean;
}
```

### 2.4. Lưu Trữ Cố Định & Phòng Chống XSS (`StorageAdapter`, `security`)
- **Khóa lưu trữ:** `'casio_fx580vnx_state_v1'`
- **Xác thực Schema (Strict Schema Validation):**
  - Kiểm tra `version === 1`.
  - Kiểm tra tính hợp lệ của danh sách biến và giá trị cài đặt (`angleUnit`, `displayMode`).
  - Tự động phát hiện và hủy bỏ dữ liệu nếu phát hiện chuỗi payload lạ, thẻ `<script>`, `javascript:` hoặc thuộc tính HTML nguy hiểm (`onload=`, `onerror=`).
- **Khả năng hoạt động đa môi trường:** Hoạt động liền mạch cả trong môi trường trình duyệt (Browser LocalStorage) và môi trường kiểm thử/Node (MemoryStorageBackend).

---

## 3. Khác Biệt Giữa Hành Vi Đã Xác Minh và Hành Vi Chưa Kiểm Chứng (TODO)

Tuân thủ quy định: *Không tự tuyên bố đã tái hiện chính xác toàn bộ hành vi bộ nhớ của máy gốc nếu chưa kiểm chứng*:

| Thành phần bộ nhớ | Hành vi đã xác minh & Đã triển khai | Hành vi chưa biết / Cần giữ TODO |
| :--- | :--- | :--- |
| **Biến nhớ $A \dots F, X, Y$** | Gán giá trị, truy xuất trong biểu thức, lưu trữ độc lập qua session. | Địa chỉ byte cụ thể trong bản đồ SRAM vật lý máy gốc (`0x0D000`). |
| **Biến nhớ $M$** | $M+, M-$, kiểm tra $M \ne 0 \rightarrow$ hiện icon `M`. | Hành vi chính xác của tổ hợp phím `STO` + `M` vs `M+` khi gặp biểu thức lỗi. |
| **Lịch sử Replay** | Duyệt `▲/▼`, lưu biểu thức và kết quả, phím AC giữ nguyên lịch sử, RESET xóa sạch. | Giới hạn bộ nhớ động chính xác (tính theo số byte token hay số lượng phép tính cố định trên máy gốc). |
| **Độ bền lưu trữ** | Tự động lưu qua `localStorage` trình duyệt. | Hành vi xả tụ / giữ RAM khi máy tính tắt bằng phím `OFF` vs tự ngắt (Auto Power Off). |

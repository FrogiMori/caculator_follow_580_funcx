import { DisplayState, StatusFlags } from '../types/state';

/**
 * Component màn hình LCD mô phỏng ma trận điểm 192 × 63 dots của Casio ClassWiz fx-580VN X
 */
export class LcdScreen {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cursorBlink: boolean = true;
  private blinkInterval: number | null = null;
  private currentState: DisplayState | null = null;

  // Kích thước chuẩn từ VRAM và phần cứng ClassWiz
  private readonly DOTS_W = 192;
  private readonly DOTS_H = 63;
  private readonly SCALE = 3; // Tỷ lệ phóng to hiển thị sắc nét

  constructor(containerId: string) {
    const parent = document.getElementById(containerId);
    if (!parent) {
      throw new Error(`[LcdScreen] Container #${containerId} not found`);
    }
    this.container = parent;

    // Tạo Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.DOTS_W * this.SCALE;
    this.canvas.height = this.DOTS_H * this.SCALE;
    this.canvas.className = 'casio-lcd-canvas';
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Màn hình hiển thị LCD Casio fx-580VN X');
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('[LcdScreen] Failed to get 2D canvas context');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;

    this.container.appendChild(this.canvas);

    // Kích hoạt nhấp nháy con trỏ
    this.startCursorBlink();
  }

  public destroy(): void {
    if (this.blinkInterval !== null) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
  }

  private startCursorBlink(): void {
    if (typeof window !== 'undefined') {
      this.blinkInterval = window.setInterval(() => {
        this.cursorBlink = !this.cursorBlink;
        if (this.currentState) {
          this.render(this.currentState);
        }
      }, 500);
    }
  }

  /**
   * Kết xuất toàn bộ màn hình theo trạng thái DisplayState
   */
  public render(state: DisplayState): void {
    this.currentState = state;
    const ctx = this.ctx;

    // 1. Vẽ nền màn hình LCD ClassWiz (Màu xám xanh đặc trưng)
    ctx.fillStyle = '#c7d6c5'; // Màu nền LCD Casio tự nhiên
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Vẽ dải biểu tượng trạng thái phía trên (Status Bar)
    this.renderStatusBar(state.statusFlags, state.currentMode);

    // Nếu đang mở menu chọn mode, vẽ menu
    if (state.isMenuOpen) {
      this.renderMenu();
      return;
    }

    // 3. Vẽ dòng nhập biểu thức (Expression Line)
    this.renderExpression(state.expression, state.cursorPosition);

    // 4. Vẽ thông báo phụ hoặc kết quả góc dưới bên phải
    if (state.notification) {
      this.renderNotification(state.notification);
    } else if (state.result !== null) {
      this.renderResult(state.result);
    }
  }

  /**
   * Vẽ menu chọn chế độ tính toán khi bấm phím MENU
   */
  private renderMenu(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2920';
    ctx.font = `bold ${8.5 * this.SCALE}px monospace`;
    ctx.textBaseline = 'top';

    const col1X = 6 * this.SCALE;
    const startY = 16 * this.SCALE;
    const lineSpacing = 11 * this.SCALE;

    ctx.fillText('1: Calculate   2: Complex', col1X, startY);
    ctx.fillText('3: Base-N      4: Matrix', col1X, startY + lineSpacing);
    ctx.fillText('5: Vector      6: Statistics', col1X, startY + lineSpacing * 2);
    ctx.fillText('9: Table       A: Equation', col1X, startY + lineSpacing * 3);
  }

  /**
   * Vẽ thông báo tạm thời (ví dụ: 'Not Supported', 'Ans → A')
   */
  private renderNotification(msg: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2920';
    ctx.font = `bold ${12 * this.SCALE}px monospace`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';

    const x = this.canvas.width - (8 * this.SCALE);
    const y = this.canvas.height - (4 * this.SCALE);

    ctx.fillText(msg, x, y);
    ctx.textAlign = 'left';
  }

  /**
   * Vẽ các biểu tượng trạng thái trên cùng: S, A, D/R/G, FIX, SCI, Math, M
   */
  private renderStatusBar(flags: StatusFlags, currentMode?: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2920'; // Màu mực đen ma trận LCD
    ctx.font = `${8 * this.SCALE}px monospace`;
    ctx.textBaseline = 'top';

    const y = 2 * this.SCALE;

    // Icon 'S' (Shift)
    if (flags.shift) {
      ctx.fillText('S', 6 * this.SCALE, y);
    }

    // Icon 'A' (Alpha)
    if (flags.alpha) {
      ctx.fillText('A', 16 * this.SCALE, y);
    }

    // Icon đơn vị góc: D / R / G
    ctx.fillText(flags.angleUnit, 32 * this.SCALE, y);

    // Icon FIX / SCI
    if (flags.fix) ctx.fillText('FIX', 50 * this.SCALE, y);
    if (flags.sci) ctx.fillText('SCI', 70 * this.SCALE, y);

    // Icon Math (Chế độ hiển thị tự nhiên)
    if (flags.math) {
      ctx.fillText('Math', 130 * this.SCALE, y);
    }

    // Hiển thị tên Mode (nếu khác COMP)
    if (currentMode && currentMode !== 'COMP') {
      ctx.fillText(currentMode, 88 * this.SCALE, y);
    }

    // Icon 'M' (Bộ nhớ)
    if (flags.hasMemory) {
      ctx.fillText('M', 170 * this.SCALE, y);
    }

    // Mũi tên lịch sử ▲ ▼
    if (flags.scrollUp) ctx.fillText('▲', 182 * this.SCALE, y);
    if (flags.scrollDown) ctx.fillText('▼', 182 * this.SCALE, (y + 6 * this.SCALE));

    // Đường kẻ phân cách mờ dưới status bar
    ctx.strokeStyle = 'rgba(30, 41, 32, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 12 * this.SCALE);
    ctx.lineTo(this.canvas.width, 12 * this.SCALE);
    ctx.stroke();
  }

  /**
   * Vẽ biểu thức và con trỏ nhấp nháy
   */
  private renderExpression(expression: string, cursorPosition: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2920';
    ctx.font = `bold ${12 * this.SCALE}px monospace`;
    ctx.textBaseline = 'top';

    const startX = 6 * this.SCALE;
    const startY = 16 * this.SCALE;

    // Tách phần trước và sau con trỏ
    const textBefore = expression.slice(0, cursorPosition);
    const textAfter = expression.slice(cursorPosition);

    // Vẽ phần trước con trỏ
    ctx.fillText(textBefore, startX, startY);
    const widthBefore = ctx.measureText(textBefore).width;

    // Vẽ con trỏ nhấp nháy ▮
    if (this.cursorBlink) {
      ctx.fillRect(startX + widthBefore, startY, 2 * this.SCALE, 14 * this.SCALE);
    }

    // Vẽ phần sau con trỏ
    ctx.fillText(textAfter, startX + widthBefore + (2 * this.SCALE), startY);
  }

  /**
   * Vẽ kết quả căn phải ở góc dưới màn hình
   */
  private renderResult(result: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2920';
    ctx.font = `bold ${14 * this.SCALE}px monospace`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';

    const x = this.canvas.width - (8 * this.SCALE);
    const y = this.canvas.height - (4 * this.SCALE);

    ctx.fillText(result, x, y);
    ctx.textAlign = 'left'; // Trả lại canh lề trái
  }
}

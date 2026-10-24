import { InputDispatcher } from '../input/InputDispatcher';
import { LcdScreen } from './LcdScreen';
import { KeypadView } from './KeypadView';
import { DisplayState } from '../types/state';

/**
 * Ứng dụng Casio fx-580VN X tích hợp
 * Điều phối giữa màn hình LCD, bàn phím và hệ thống nhập liệu
 */
export class CalculatorApp {
  private rootElement: HTMLElement;
  private dispatcher: InputDispatcher;
  private lcdScreen: LcdScreen | null = null;
  private keypadView: KeypadView | null = null;

  constructor(rootElementId: string) {
    const root = document.getElementById(rootElementId);
    if (!root) {
      throw new Error(`[CalculatorApp] Root element #${rootElementId} not found`);
    }
    this.rootElement = root;
    this.dispatcher = new InputDispatcher();

    this.initLayout();
    this.initListeners();
  }

  public getDispatcher(): InputDispatcher {
    return this.dispatcher;
  }

  public getKeypad(): KeypadView | null {
    return this.keypadView;
  }

  public getScreen(): LcdScreen | null {
    return this.lcdScreen;
  }

  private initLayout(): void {
    this.rootElement.innerHTML = `
      <div class="casio-case">
        <!-- Khối đầu máy: Logo & Solar cell giả lập -->
        <div class="casio-header">
          <div class="casio-branding">
            <span class="casio-logo">CASIO</span>
            <span class="casio-model">fx-580VN X</span>
            <span class="casio-subtext">CLASSWIZ</span>
          </div>
          <div class="solar-panel" title="Tế bào quang điện kép giả lập">
            <div class="solar-grid"></div>
          </div>
        </div>

        <!-- Khung viền màn hình LCD -->
        <div class="casio-screen-frame">
          <div id="casio-lcd-container" class="casio-lcd-container"></div>
        </div>

        <!-- Bàn phím 50 phím -->
        <div id="casio-keypad-container"></div>

        <!-- Khối chân máy -->
        <div class="casio-footer">
          <span class="casio-edition">VIETNAM STANDARD EDITION</span>
        </div>
      </div>
    `;

    // Khởi tạo các component con
    this.lcdScreen = new LcdScreen('casio-lcd-container');
    this.keypadView = new KeypadView('casio-keypad-container', this.dispatcher);

    // Render trạng thái ban đầu
    this.lcdScreen.render(this.dispatcher.getState());
  }

  private initListeners(): void {
    // 1. Lắng nghe cập nhật từ InputDispatcher để vẽ lại LCD
    this.dispatcher.subscribe((_event, state: DisplayState) => {
      if (this.lcdScreen) {
        this.lcdScreen.render(state);
      }
    });

    // 2. Lắng nghe phím gõ từ bàn phím vật lý máy tính (PC Keyboard)
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        // Tránh can thiệp khi người dùng đang gõ vào input khác (nếu có)
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }

        // Bỏ qua các tổ hợp phím hệ điều hành như Cmd+R, Ctrl+Shift+I
        if (e.metaKey || e.ctrlKey || e.altKey) {
          return;
        }

        const handled = this.dispatcher.dispatchKeyboardEvent(e);
        if (handled) {
          e.preventDefault();
        }
      });
    }
  }
}

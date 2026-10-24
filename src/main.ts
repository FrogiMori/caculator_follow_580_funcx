import { CalculatorApp } from './ui/CalculatorApp';

if (typeof document !== 'undefined') {
  const init = () => {
    const root = document.getElementById('app');
    if (root) {
      new CalculatorApp('app');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

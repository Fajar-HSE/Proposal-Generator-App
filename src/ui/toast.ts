// src/ui/toast.ts
// Toast notification system

type ToastType = 'success' | 'error' | 'info' | '';

let toastEl: HTMLElement | null = null;

function getToastEl(): HTMLElement {
  if (!toastEl) {
    toastEl = document.getElementById('toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'toast';
      document.body.appendChild(toastEl);
    }
  }
  return toastEl;
}

export function toast(message: string, type: ToastType = ''): void {
  const el = getToastEl();
  el.textContent = message;
  el.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => el.classList.remove('show'), 3000);
}

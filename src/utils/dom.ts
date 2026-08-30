// src/utils/dom.ts
// DOM manipulation helpers

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $$(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string },
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props?.className) el.className = props.className;
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k !== 'className' && k !== 'children' && k !== 'innerHTML' && k !== 'textContent') {
      (el as Record<string, unknown>)[k] = v;
    }
  });
  return el;
}

export function escapeHtml(str: string): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br/>');
}

export function setDisplay(element: HTMLElement | null, display: 'block' | 'none'): void {
  if (!element) return;
  element.style.display = display;
}

export function toggle(el: HTMLElement, show: boolean): void {
  el.style.display = show ? '' : 'none';
}

export function delegate(
  parent: HTMLElement,
  selector: string,
  event: string,
  handler: (e: Event, target: HTMLElement) => void,
): void {
  parent.addEventListener(event, (e) => {
    const target = (e.target as HTMLElement).closest(selector);
    if (target) handler(e, target as HTMLElement);
  });
}
// src/ui/templates.ts
// Template card selection rendering

import { escapeHtml } from '../utils/dom';
import { proposalStore } from '../store/proposalStore';
import type { TemplateId } from '../types';

const TEMPLATES: Array<{ id: TemplateId; name: string; desc: string; color: string }> = [
  { id: 'classic',  name: 'Classic',   desc: 'Navy + serif heading, kesan korporat',         color: '#1E3A5F' },
  { id: 'modern',   name: 'Modern',    desc: 'Gradient ungu + accent warna, visual bold',    color: '#6366F1' },
  { id: 'minimal',  name: 'Minimal',   desc: 'Abu-abu soft + spacing longgar + dashed border', color: '#94A3B8' },
  { id: 'executive', name: 'Executive', desc: 'Navy + gold serif, untuk C-level / board',       color: '#1E3A5F' },
  { id: 'bold',     name: 'Bold',      desc: 'Orange-hitam geometric, untuk pitch growth',  color: '#EA5809' },
  { id: 'elegant',  name: 'Elegant',   desc: 'Burgundy + cream serif italic, refined',      color: '#991C18' },
  { id: 'corporate', name: 'Corporate', desc: 'Slate-biru konservatif, enterprise',          color: '#334159' },
];

export function renderTemplates(container: HTMLElement): void {
  container.innerHTML = '';
  const selected = proposalStore.template;

  TEMPLATES.forEach((t) => {
    const card = document.createElement('div');
    card.className = `template-card${t.id === selected ? ' selected' : ''}`;
    card.dataset.template = t.id;
    card.innerHTML = `
      <div class="template-swatch" style="background:${t.color}"></div>
      <div class="template-info">
        <div class="template-name">${escapeHtml(t.name)}</div>
        <div class="template-desc">${escapeHtml(t.desc)}</div>
      </div>
      <input type="radio" name="template" value="${t.id}" ${t.id === selected ? 'checked' : ''} />
    `;
    card.addEventListener('click', () => {
      proposalStore.template = t.id;
      document.querySelectorAll('.template-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    container.appendChild(card);
  });
}

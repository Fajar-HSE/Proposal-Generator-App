// src/ui/stepNavigation.ts
// Stepper + progress navigation

import type { StepId, StepConfig } from '../types';

export const STEPS: StepConfig[] = [
  { id: 1, title: 'Pilih Template Design' },
  { id: 2, title: 'Informasi Penting' },
  { id: 3, title: 'Brief Klien (Konteks Bisnis)' },
  { id: 4, title: 'Latar Belakang' },
  { id: 5, title: 'Deskripsi' },
  { id: 6, title: 'Tujuan' },
  { id: 7, title: 'Peserta' },
  { id: 8, title: 'Materi Pelatihan' },
  { id: 9, title: 'Persyaratan Peserta' },
  { id: 10, title: 'Tanggal & Venue' },
  { id: 11, title: 'Biaya' },
  { id: 12, title: 'Fasilitas' },
  { id: 13, title: 'Penutup' },
];

export function renderStepper(container: HTMLElement, currentStep: StepId): void {
  const steps = STEPS;
  let html = '<div class="stepper">';
  steps.forEach((s) => {
    const isActive = s.id === currentStep;
    const isCompleted = typeof currentStep === 'number' && s.id < currentStep;
    const cls = isActive ? 'active' : isCompleted ? 'completed' : '';
    const marker = isCompleted ? '✓' : s.id;
    html += `
      <div class="step-chip ${cls}" data-step="${s.id}">
        <span class="step-num">${marker}</span>
        <span class="step-label">${s.title}</span>
      </div>
    `;
  });
  const settingsCls = currentStep === 'settings' ? 'active' : '';
  html += `<div class="step-chip ${settingsCls}" data-step="settings"><span class="step-num">⚙</span><span class="step-label">Pengaturan AI & Generate</span></div>`;
  html += '</div>';
  container.innerHTML = html;

  // Attach click handlers
  container.querySelectorAll('.step-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (chip as HTMLElement).dataset.step;
      const event = new CustomEvent('step-change', {
        detail: { step: target === 'settings' ? 'settings' : Number(target) },
      });
      document.dispatchEvent(event);
    });
  });
}

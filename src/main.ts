import './styles/main.css';
import { initMonitoring } from './lib/monitoring';

initMonitoring();

// Legacy app is a non-module script; we load it after Vite has mounted styles.
// Import as side-effect — Vite will bundle it (preserve original 2508-line behavior)
// but now with sourcemaps + minification + chunk splitting.
import './legacy/app.legacy.js';

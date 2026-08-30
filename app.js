// Proposal Generator - UI Redesigned Version
// Stores: localStorage for user data + proposal state + AI settings

// ---------- Storage ----------
const Store = {
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } }
};

// ---------- Toast ----------
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ---------- Firebase Config & Init ----------
const firebaseConfig = {
  apiKey: "AIzaSyCe9rZzhE5t6bUgZTURiI6x2Y2ZvBlt_co",
  authDomain: "proposal-generator-c6bc8.firebaseapp.com",
  projectId: "proposal-generator-c6bc8",
  storageBucket: "proposal-generator-c6bc8.firebasestorage.app",
  messagingSenderId: "805030576451",
  appId: "1:805030576451:web:906302f39cae18f5736ff6"
};

// Initialize Firebase (guarded against double-init in case of reload)
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ---------- Auth ----------
let currentUser = null;

function switchAuthTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('registerFields').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('registerFields').style.flexDirection = 'column';
  document.getElementById('registerFields').style.gap = '6px';
  document.getElementById('registerFields').style.marginBottom = '16px';
  document.getElementById('passwordHint').style.display = tab === 'register' ? 'block' : 'none';
  // Update submit button label
  document.querySelector('#authForm button[type="submit"] span').textContent =
    tab === 'register' ? 'Daftar' : 'Masuk';
}
document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchAuthTab(b.dataset.tab)));

// Map Firebase auth errors to user-friendly Indonesian messages
function mapAuthError(code) {
  const map = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
    'auth/user-not-found': 'Email belum terdaftar.',
    'auth/wrong-password': 'Kata sandi salah.',
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/invalid-login-credentials': 'Email atau kata sandi salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar. Silakan masuk.',
    'auth/weak-password': 'Kata sandi terlalu lemah (minimal 6 karakter).',
    'auth/operation-not-allowed': 'Metode login belum diaktifkan. Hubungi admin.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/popup-closed-by-user': 'Popup ditutup sebelum selesai.',
    'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk login Google.',
    'auth/network-request-failed': 'Koneksi internet bermasalah.',
    'auth/cancelled-popup-request': 'Login dibatalkan.',
    'auth/account-exists-with-different-credential': 'Email sudah terdaftar dengan metode login lain.'
  };
  return map[code] || (`Error: ${code}`);
}

// Email/Password submit — sign in OR register based on active tab
document.getElementById('authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) {
    toast('Lengkapi email dan kata sandi', 'error'); return;
  }
  const nameField = document.getElementById('authName');
  const displayName = nameField && nameField.offsetParent !== null ? nameField.value.trim() : '';
  const isRegister = document.querySelector('.tab-btn.active').dataset.tab === 'register';
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalLabel = submitBtn.querySelector('span').textContent;
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = isRegister ? '⏳ Mendaftar...' : '⏳ Masuk...';
  try {
    if (isRegister) {
      if (password.length < 6) {
        toast('Kata sandi minimal 6 karakter', 'error');
        throw { code: 'auth/weak-password' };
      }
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      if (displayName) {
        await cred.user.updateProfile({ displayName });
      }
      toast('Akun berhasil dibuat!', 'success');
    } else {
      await auth.signInWithEmailAndPassword(email, password);
      toast('Login berhasil', 'success');
    }
    // onAuthStateChanged will pick up the change and call enterApp()
  } catch (err) {
    console.error(err);
    toast(mapAuthError(err.code || 'auth/unknown'), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = originalLabel;
  }
});

// Google Sign-In — popup flow
document.getElementById('googleSignInBtn').addEventListener('click', async () => {
  const btn = document.getElementById('googleSignInBtn');
  const originalLabel = btn.querySelector('span').textContent;
  btn.disabled = true;
  btn.querySelector('span').textContent = '⏳ Membuka popup Google...';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await auth.signInWithPopup(provider);
    toast('Login dengan Google berhasil', 'success');
    // onAuthStateChanged will pick up
  } catch (err) {
    console.error(err);
    toast(mapAuthError(err.code || 'auth/unknown'), 'error');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = originalLabel;
  }
});

// Build currentUser object from Firebase user (requires email per user preference)
function userFromFirebase(fbUser) {
  if (!fbUser) return null;
  const email = fbUser.email;
  const name = fbUser.displayName || fbUser.providerData?.[0]?.displayName || (email ? email.split('@')[0] : '');
  return {
    uid: fbUser.uid,
    name,
    email: email || '',
    photoURL: fbUser.photoURL || fbUser.providerData?.[0]?.photoURL || null,
    provider: fbUser.providerData?.[0]?.providerId || 'firebase'
  };
}

function enterApp() {
  if (!currentUser || !currentUser.email) {
    // Per requirement: tolak login kalau email kosong
    toast('Login ditolak: email wajib tersedia', 'error');
    auth.signOut().catch(() => {});
    return;
  }
  Store.set('pg_user', currentUser);
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('appScreen').classList.add('active');
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userAvatar').textContent = (currentUser.name || '?')[0].toUpperCase();
  loadProposalState();
  loadAiSettings();
  showStep(currentStep);
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  }
  Store.set('pg_user', null);
  location.reload();
});

// Single source of truth for auth state — replaces both manual localStorage check and demo mode
auth.onAuthStateChanged(fbUser => {
  // Skip if we're still on initial demo boot — let the demo block below handle it
  const params = new URLSearchParams(location.search);
  if (!fbUser) {
    // Not logged in via Firebase. If demo flag is present, run demo flow.
    if (params.has('demo')) {
      const demoUser = { uid: 'demo', name: 'Ahmad Fauzi', email: 'ahmad@team.id', photoURL: null, provider: 'demo' };
      currentUser = demoUser;
      enterApp();
      if (params.has('sample')) {
        const sample = {
          template: 'modern',
          companyName: 'PT Maju Bersama Sentosa',
          organizerName: 'Lembaga Pelatihan Nusantara',
          proposalTitle: 'Pelatihan Digital Marketing Strategis untuk UMKM',
          competencyUnit: 'M.731000.001.01 - Mengelola Kampanye Digital',
          cta: 'Daftarkan tim Anda hari ini dan dapatkan diskon 15%.',
          startDate: '2026-09-15',
          endDate: '2026-09-17',
          venue: 'Hotel Grand Hyatt Jakarta',
          pricePerPerson: 'Rp 2.500.000',
          minParticipants: '10',
          priceNotes: 'Termasuk makan siang, sertifikat, dan modul.',
          facilities: ['Sertifikat kelulusan','Modul hardcopy & softcopy','Makan siang & coffee break','Penginapan hotel','Konsultasi pascapelatihan'],
          background: 'Di era transformasi digital yang semakin pesat, UMKM dituntut untuk memiliki kemampuan pemasaran yang adaptif dan terukur. Sayangnya, banyak pelaku UMKM masih mengandalkan metode konvensional dan belum mengoptimalkan kanal digital untuk pertumbuhan bisnis mereka. Pelatihan ini menjadi kebutuhan strategis untuk menjawab tantangan tersebut.',
          description: 'Pelatihan ini dirancang secara komprehensif selama 3 hari untuk memberikan pemahaman mendalam tentang digital marketing. Peserta akan belajar strategi SEO, social media marketing, content marketing, hingga Paid Ads. Setiap sesi dilengkapi dengan studi kasus nyata dan latihan praktis yang dapat langsung diterapkan di bisnis masing-masing.',
          objectives: 'Meningkatkan pemahaman peserta tentang digital marketing secara holistik\nMampu menyusun strategi digital marketing yang terukur\nMampu mengelola kampanye SEO dan SEM secara mandiri\nMampu menganalisis performa kampanye melalui data analytics\nMampu mengkonversi leads menjadi pelanggan setia',
          audience: 'Pelatihan ini ditujukan untuk pemilik usaha, marketing manager, dan staf pemasaran di perusahaan UMKM. Disarankan peserta memiliki basic komputer dan akses internet untuk latihan langsung. Peserta dari berbagai industri akan saling berbagi pengalaman dan memperluas jejaring.',
          requirements: 'Memiliki laptop pribadi dengan koneksi internet\nPengetahuan dasar media sosial\nBersedia mengikuti seluruh sesi hingga akhir\nMembawa studi kasus bisnis sendiri untuk latihan',
          closing: 'Kami mengundang Anda untuk bergabung dalam pelatihan transformatif ini. Investasi waktu dan biaya yang Anda keluarkan akan menghasilkan kemampuan digital marketing yang dapat langsung diterapkan untuk mengakselerasi pertumbuhan bisnis Anda. Mari bersama-sama membangun UMKM Indonesia yang lebih tangguh di era digital.'
        };
        Store.set('pg_proposal', sample);
        loadProposalState();
        setTimeout(() => {
          showStep('settings');
          setTimeout(() => document.getElementById('generateBtn')?.click(), 300);
        }, 300);
      }
    }
    // Otherwise: stay on auth screen (default Firebase behavior)
    return;
  }

  // Firebase user detected
  currentUser = userFromFirebase(fbUser);
  enterApp();
});

// ---------- Navigation ----------
let currentStep = 1;
const stepTitles = {
  1: 'Pilih Template Design',
  2: 'Informasi Penting',
  3: 'Brief Klien (Konteks Bisnis)',
  4: 'Latar Belakang',
  5: 'Deskripsi',
  6: 'Tujuan',
  7: 'Peserta',
  8: 'Materi Pelatihan',
  9: 'Persyaratan Peserta',
  10: 'Tanggal & Venue',
  11: 'Biaya',
  12: 'Fasilitas',
  13: 'Penutup',
  settings: 'Pengaturan AI & Generate'
};

// AI-generated steps: now include clientBrief-related context (read clientBrief fields into context automatically).
// Penutup also pulls in CTA & decision-maker info.
const aiSteps = {
  4: { id: 'background', label: 'Latar Belakang', promptKey: 'background', framework: 'IIIP' },
  5: { id: 'description', label: 'Deskripsi', promptKey: 'description', framework: 'FAB' },
  6: { id: 'objectives', label: 'Tujuan', promptKey: 'objectives', framework: 'FAB' },
  7: { id: 'audience', label: 'Peserta', promptKey: 'audience', framework: 'PERSONA' },
  9: { id: 'requirements', label: 'Persyaratan Peserta', promptKey: 'requirements', framework: 'CHECKLIST' },
  13: { id: 'closing', label: 'Penutup', promptKey: 'closing', framework: 'ASSUMPTIVE_CLOSE' }
};

// Persuasion frameworks the prompts reference per section type.
const FRAMEWORKS = {
  IIIP: 'Gunakan struktur **Issue → Impact → Implication → Payoff**: (1) Issue = masalah aktual yang klien hadapi hari ini; (2) Impact = konsekuensi kuantitatif dari masalah tersebut; (3) Implication = risiko jika dibiarkan; (4) Payoff = bagaimana pelatihan ini mengubah status quo.',
  FAB: 'Gunakan kerangka **Feature → Advantage → Benefit** untuk setiap poin: Fitur konkret materi/metode, Keunggulan dibanding alternatif, Manfaat terukur yang dirasakan klien.',
  PERSONA: 'Gunakan kerangka **Persona → Pains → Gains → Channels**: deskripsikan profil ideal peserta, apa yang mereka keluhkan hari ini, apa yang mereka ingin capai, dan bagaimana pelatihan ini menjangkau mereka.',
  CHECKLIST: 'Setiap poin harus **dapat diverifikasi** oleh panitia (laptop, sertifikat, presensi, pre-test, dsb). Hindari poin generik seperti "bersedia belajar".',
  ASSUMPTIVE_CLOSE: 'Gunakan **assumptive close**: asumsikan klien akan lanjut, sebutkan **deadline konfirmasi**, **masa berlaku penawaran**, **satu aksi spesifik** yang klien lakukan berikutnya, plus **dua kontak** (penjualan & admin). Hindari "silakan hubungi kami jika berminat".',
  OUTLINE: 'Hasilkan **KURIKULUM TERSTRUKTUR** dalam JSON array (6-10 sesi). Tiap sesi: { "title", "duration" (mis. "2 jam" atau "90 menit"), "method" (salah satu: Ceramah, Diskusi, Studi Kasus, Latihan/Praktik, Workshop, e-Learning, Coaching), "description" (2-3 kalimat: sub-topik spesifik + output/artefak yang didapat peserta) }. Urutan harus logis: fondasi → pendalaman → studi kasus → implementasi.Industri klien wajib dimasukkan ke deskripsi agar kurikulum terasa relevan.'
};

// Banned phrases that kill persuasion (the AI replaces with specifics).
const BANNED_PHRASES = [
  'dalam era digital',
  'tidak dapat dipungkiri',
  'semoga bermanfaat',
  'semoga proposal ini',
  'kami berharap',
  'silakan menghubungi kami',
  'tidak ada salahnya',
  'saat ini kita berada di',
  'di era yang serba digital',
  'revolusi industri 4.0'
];

const METHOD_CHOICES = ['Ceramah', 'Diskusi', 'Studi Kasus', 'Latihan/Praktik', 'Workshop', 'e-Learning', 'Coaching', 'Presentasi'];

function totalSteps() { return 13; }

function updateProgress(step) {
  if (step === 'settings') {
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressText').textContent = '✓';
    document.getElementById('stepMeta').textContent = 'Langkah terakhir';
    return;
  }
  const s = Number(step);
  const total = totalSteps();
  const pct = (s / total) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${s}/${total}`;
  document.getElementById('stepMeta').textContent = `Langkah ${s} dari ${total}`;
}

function showStep(step) {
  currentStep = step;
  document.getElementById('stepTitle').textContent = stepTitles[step] || '';
  document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
  const el = document.querySelector(`.step[data-step="${step}"]`);
  if (el) el.style.display = 'block';

  // Highlight active chip and mark previously visited steps as completed
  const sNum = Number(step);
  document.querySelectorAll('.step-chip').forEach(c => {
    const cNum = Number(c.dataset.step);
    if (!Number.isNaN(cNum)) {
      c.classList.toggle('active', cNum === sNum);
      c.classList.toggle('completed', !Number.isNaN(sNum) && cNum < sNum);
    } else if (c.dataset.step === String(step)) {
      c.classList.add('active');
    }
  });

  // Auto-scroll active chip into view inside the horizontally scrolling stepper
  const activeChip = document.querySelector('.step-chip.active');
  if (activeChip) {
    activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  if (aiSteps[step]) buildAiStep(step);

  if (String(step) === '8') {
    // When entering Materi step, ensure rows exist + refresh count
    seedMaterialsIfEmpty();
    updateMaterialsCount();
  }

  document.getElementById('prevBtn').style.display = step === 'settings' ? 'none' : '';
  document.getElementById('nextBtn').style.display = step === 'settings' ? 'none' : '';
  updateProgress(step);

  saveProposalState();
}

// Step chips (top horizontal stepper) — click to jump
document.querySelectorAll('.step-chip').forEach(chip => {
  chip.addEventListener('click', e => {
    e.preventDefault();
    const target = chip.dataset.step;
    if (target) showStep(target);
  });
});

// Settings icon in top-right jumps to settings
document.getElementById('settingsBtn')?.addEventListener('click', () => {
  showStep('settings');
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentStep === 'settings') return;
  const s = Number(currentStep);
  if (s > 1) showStep(s - 1);
});
document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentStep === 'settings') return;
  const s = Number(currentStep);
  if (s === 2) {
    const need = ['companyName', 'organizerName', 'proposalTitle'];
    for (const id of need) if (!document.getElementById(id).value.trim()) {
      toast('Lengkapi field wajib di langkah ini', 'error'); return;
    }
  }
  if (s < totalSteps()) showStep(s + 1);
  else showStep('settings');
});

// ---------- Step 1: Templates ----------
document.querySelectorAll('.template-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const radio = card.querySelector('input');
    if (radio) radio.checked = true;
    saveProposalState();
  });
});

// ---------- Step 2: Info ----------
['companyName','organizerName','proposalTitle','competencyUnit','cta'].forEach(id => {
  document.getElementById(id).addEventListener('input', saveProposalState);
});
['startDate','endDate','venue','pricePerPerson','minParticipants','priceNotes'].forEach(id => {
  document.getElementById(id).addEventListener('input', saveProposalState);
});
document.getElementById('facilities').addEventListener('change', saveProposalState);

// ---------- Build AI Step dynamically ----------
function buildAiStep(step) {
  const cfg = aiSteps[step];
  const stepEl = document.querySelector(`.step[data-step="${step}"]`);
  if (!stepEl || stepEl.dataset.built === '1') return;
  stepEl.innerHTML = `
    <div class="step-hero">
      <span class="step-pill">${cfg.label}</span>
      <h1>${cfg.label}</h1>
      <p>AI menggunakan <strong>2 tahap</strong>: riset dulu, baru tulis. Hasil riset ditampilkan di panel di bawah — Anda bisa koreksi fakta sebelum AI menulis.</p>
      <p class="framework-hint">Framework: <em>${cfg.framework}</em></p>
    </div>
    <div class="form-card">
      <div class="ai-toolbar">
        <button class="btn btn-ai ai-suggest" data-target="${cfg.id}" data-action="chain">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z"/></svg>
          <span>Generate dengan AI</span>
        </button>
        <button class="btn btn-ghost btn-regen" data-target="${cfg.id}" data-action="rewrite" title="Tulis ulang pakai riset terakhir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span>Ulangi</span>
        </button>
        <button class="btn btn-ghost btn-research" data-target="${cfg.id}" data-action="research" title="Riset ulang dari awal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Riset ulang</span>
        </button>
      </div>

      <details class="insights-panel" data-target="${cfg.id}">
        <summary>
          <span class="insights-summary-icon">💡</span>
          <span class="insights-summary-label">Riset AI (klik untuk lihat)</span>
          <span class="insights-summary-empty">— belum ada —</span>
        </summary>
        <div class="insights-body"><em>Hasil riset akan muncul di sini setelah klik "Generate dengan AI".</em></div>
      </details>

      <div class="field-group">
        <label for="${cfg.id}">${cfg.label}</label>
        <textarea id="${cfg.id}" class="textarea tall" placeholder="Klik 'Generate dengan AI' atau tulis manual..."></textarea>
      </div>
    </div>
  `;
  stepEl.dataset.built = '1';
  document.getElementById(cfg.id).addEventListener('input', saveProposalState);
  const chainBtn  = stepEl.querySelector('[data-action="chain"]');
  const rewriteBtn = stepEl.querySelector('[data-action="rewrite"]');
  const researchBtn = stepEl.querySelector('[data-action="research"]');
  chainBtn.addEventListener('click', () => generateAi(cfg, { mode: 'chain' }));
  rewriteBtn.addEventListener('click', () => generateAi(cfg, { mode: 'rewrite' }));
  researchBtn.addEventListener('click', () => generateAi(cfg, { mode: 'research' }));
  const state = Store.get('pg_proposal', {});
  if (state[cfg.id]) document.getElementById(cfg.id).value = state[cfg.id];

  // Restore persisted insights panel if any
  const insightsForStep = Store.get(`pg_insights_${cfg.id}`, null);
  if (insightsForStep) renderInsightsPanel(cfg.id, insightsForStep);
}

// Persist + render the AI insights panel for a section
function renderInsightsPanel(targetId, payload) {
  const details = document.querySelector(`details.insights-panel[data-target="${targetId}"]`);
  if (!details) return;
  if (!payload || (!payload.headline && !Array.isArray(payload.differentiators))) {
    details.querySelector('.insights-body').innerHTML = '<em>(kosong)</em>';
    details.querySelector('.insights-summary-empty').textContent = '— belum ada —';
    return;
  }
  const blocks = [];
  if (payload.headline)            blocks.push(`<div class="ins-block"><div class="ins-label">Headline</div><div class="ins-val">${escapeHtml(payload.headline)}</div></div>`);
  if (Array.isArray(payload.hooks) && payload.hooks.length) blocks.push(`<div class="ins-block"><div class="ins-label">Opening Hooks</div><ul>${payload.hooks.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  if (Array.isArray(payload.differentiators) && payload.differentiators.length) blocks.push(`<div class="ins-block"><div class="ins-label">Pembeda</div><ul>${payload.differentiators.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  if (Array.isArray(payload.outcomes) && payload.outcomes.length) blocks.push(`<div class="ins-block"><div class="ins-label">Outcomes (terukur)</div><ul>${payload.outcomes.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  if (Array.isArray(payload.proofPoints) && payload.proofPoints.length) blocks.push(`<div class="ins-block"><div class="ins-label">Bukti Sosial</div><ul>${payload.proofPoints.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  if (Array.isArray(payload.objections) && payload.objections.length) blocks.push(`<div class="ins-block"><div class="ins-label">Antisipasi Keraguan</div><ul>${payload.objections.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  if (payload.ctaProposal)          blocks.push(`<div class="ins-block"><div class="ins-label">CTA yang Disarankan</div><div class="ins-val">${escapeHtml(payload.ctaProposal)}</div></div>`);
  if (Array.isArray(payload.personas) && payload.personas.length) blocks.push(`<div class="ins-block"><div class="ins-label">Persona Peserta</div><ul>${payload.personas.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`);
  details.querySelector('.insights-body').innerHTML = blocks.join('');
  details.querySelector('.insights-summary-empty').textContent = `— ${Object.keys(payload).filter(k => Array.isArray(payload[k]) ? payload[k].length : !!payload[k]).length} poin riset —`;
}

// Step 8 (Persyaratan) — also re-triggered by the in-HTML button since it's not built dynamically
const reqEl = document.getElementById('requirements');
if (reqEl) reqEl.addEventListener('input', saveProposalState);
document.querySelector('[data-target="requirements"][data-action="chain"]')?.addEventListener('click', () =>
  generateAi({ id: 'requirements', label: 'Persyaratan Peserta', promptKey: 'requirements', framework: 'CHECKLIST' }, { mode: 'chain' })
);

// ---------- Save / Load ----------
const CLIENT_BRIEF_FIELDS = [
  'clientIndustry', 'companySize', 'topPainPoints', 'businessGoals',
  'budgetRange', 'decisionTimeline', 'decisionMakers'
];

function saveProposalState() {
  const state = Store.get('pg_proposal', {});
  const selected = document.querySelector('.template-card.selected');
  state.template = selected ? selected.dataset.template : (state.template || 'classic');
  ['companyName','organizerName','proposalTitle','competencyUnit','cta','startDate','endDate','venue','pricePerPerson','minParticipants','priceNotes'].forEach(id => {
    const el = document.getElementById(id);
    state[id] = el ? el.value : '';
  });
  CLIENT_BRIEF_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    state[id] = el ? el.value : (state[id] || '');
  });
  ['background','description','objectives','audience','closing'].forEach(id => {
    const el = document.getElementById(id);
    state[id] = el ? el.value : (state[id] || '');
  });
  const rEl = document.getElementById('requirements');
  state.requirements = rEl ? rEl.value : (state.requirements || '');
  state.facilities = Array.from(document.querySelectorAll('#facilities input:checked')).map(i => i.value);
  state.materials = readMaterialsFromUI();
  Store.set('pg_proposal', state);
}

function loadProposalState() {
  const s = Store.get('pg_proposal', {});
  document.querySelectorAll('.template-card').forEach(c => {
    const isSel = c.dataset.template === s.template;
    c.classList.toggle('selected', isSel);
    const radio = c.querySelector('input');
    if (radio) radio.checked = isSel;
  });
  ['companyName','organizerName','proposalTitle','competencyUnit','cta','startDate','endDate','venue','pricePerPerson','minParticipants','priceNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el && s[id]) el.value = s[id];
  });
  CLIENT_BRIEF_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && s[id]) el.value = s[id];
  });
  ['background','description','objectives','audience','closing'].forEach(id => {
    const el = document.getElementById(id);
    if (el && s[id]) el.value = s[id];
  });
  if (s.facilities) document.querySelectorAll('#facilities input').forEach(i => i.checked = s.facilities.includes(i.value));
  if (s.requirements) {
    const el = document.getElementById('requirements');
    if (el) el.value = s.requirements;
  }
  if (Array.isArray(s.materials)) {
    renderMaterialsRows(s.materials);
  }
}

// ---------- Materials (Step 8) ----------
function readMaterialsFromUI() {
  const rows = Array.from(document.querySelectorAll('#materialsList .material-row'));
  return rows.map((row, i) => ({
    no: i + 1,
    title: (row.querySelector('[data-fld="title"]')?.value || '').trim(),
    duration: (row.querySelector('[data-fld="duration"]')?.value || '').trim(),
    method: (row.querySelector('[data-fld="method"]')?.value || '').trim(),
    description: (row.querySelector('[data-fld="description"]')?.value || '').trim()
  })).filter(m => m.title || m.description);
}

function renderMaterialsRows(materials) {
  const list = document.getElementById('materialsList');
  if (!list) return;
  list.innerHTML = '';
  materials.forEach(m => list.appendChild(buildMaterialRow(m)));
  updateMaterialsCount();
}

function buildMaterialRow(m) {
  m = m || { title: '', duration: '2 jam', method: 'Ceramah', description: '' };
  const row = document.createElement('div');
  row.className = 'material-row';
  row.innerHTML = `
    <input data-fld="title" type="text" class="input" placeholder="Topik sesi (cth: Funnel Analysis)" value="${escapeHtml(m.title || '')}" />
    <input data-fld="duration" type="text" class="input" placeholder="Durasi (cth: 2 jam)" value="${escapeHtml(m.duration || '')}" />
    <select data-fld="method" class="input">
      ${METHOD_CHOICES.map(opt => `<option value="${escapeHtml(opt)}"${(m.method || '').toLowerCase() === opt.toLowerCase() ? ' selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
    </select>
    <textarea data-fld="description" class="textarea" placeholder="Deskripsi sesi (sub-topik + output/artefak)">${escapeHtml(m.description || '')}</textarea>
    <button type="button" class="btn-icon material-remove" title="Hapus baris">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  row.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', () => { saveProposalState(); updateMaterialsCount(); }));
  row.querySelector('.material-remove').addEventListener('click', () => { row.remove(); saveProposalState(); updateMaterialsCount(); });
  return row;
}

function updateMaterialsCount() {
  const c = document.querySelectorAll('#materialsList .material-row').length;
  const el = document.getElementById('materialsCount');
  if (el) el.textContent = `${c} sesi`;
}

// Default starter rows
function seedMaterialsIfEmpty() {
  const list = document.getElementById('materialsList');
  if (!list || list.children.length > 0) return;
  const seed = [
    { no: 1, title: 'Pengantar & fondasi', duration: '1 jam', method: 'Ceramah', description: 'Tujuan, landasan konseptual, dan kaitan dengan masalah bisnis klien saat ini.' },
    { no: 2, title: 'Topik inti 1', duration: '2 jam', method: 'Diskusi', description: 'Diskusi interaktif, tanya jawab, dan latihan singkat.' },
    { no: 3, title: 'Studi kasus', duration: '2 jam', method: 'Studi Kasus', description: 'Studi kasus relevan industri klien dan rekomendasi tindakan.' },
    { no: 4, title: 'Latihan terapan', duration: '2 jam', method: 'Latihan/Praktik', description: 'Peserta latihan langsung menggunakan tools/framework yang dipelajari.' },
    { no: 5, title: 'Uji kompetensi & rencana aksi', duration: '1 jam', method: 'Workshop', description: 'Evaluasi individu serta rencana implementasi 30-60-90 hari.' }
  ];
  renderMaterialsRows(seed);
}

// Auto-save Client Brief inputs
['clientIndustry','companySize','topPainPoints','businessGoals','budgetRange','decisionTimeline','decisionMakers'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', saveProposalState);
  if (el) el.addEventListener('change', saveProposalState);
});

// ---------- Validity date helpers (used by Penutup / CTA) ----------
function offerValidityDate(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function fmtDateIndo(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt)) return '';
  return `${dt.getDate()} ${MONTH_ID[dt.getMonth()]} ${dt.getFullYear()}`;
}

// ---------- AI Settings ----------
function loadAiSettings() {
  const s = Store.get('pg_ai', { provider: 'openai', model: 'gpt-4o-mini', baseUrl: '', apiKey: '' });
  document.getElementById('aiProvider').value = s.provider;
  document.getElementById('aiModel').value = s.model;
  document.getElementById('aiBaseUrl').value = s.baseUrl || '';
  document.getElementById('aiApiKey').value = s.apiKey || '';
}
loadAiSettings();

// Toggle key visibility
document.getElementById('toggleKey')?.addEventListener('click', () => {
  const input = document.getElementById('aiApiKey');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// ---------- Materials UI bindings ----------
document.getElementById('addMaterialRowBtn')?.addEventListener('click', () => {
  const list = document.getElementById('materialsList');
  if (!list) return;
  list.appendChild(buildMaterialRow());
  saveProposalState(); updateMaterialsCount();
});

document.getElementById('generateMaterialsBtn')?.addEventListener('click', async () => {
  const state = Store.get('pg_proposal', {});
  if (!state.companyName || !state.proposalTitle) {
    toast('Lengkapi Info Penting dulu (Step 2)', 'error'); return;
  }
  const ai = Store.get('pg_ai', {});
  if (!ai.apiKey) { toast('Atur API Key dulu di Pengaturan AI', 'error'); showStep('settings'); return; }
  const btn = document.getElementById('generateMaterialsBtn');
  const original = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span>⏳ Riset...</span>';
  try {
    const insightsPrompt = `Tolong analisis konteks pelatihan ini lalu produksi JSON array "materials" berisi 6-8 sesi.

Konteks:
- Industri klien: ${state.clientIndustry || '-'}
- Ukuran klien: ${state.companySize || '-'}
- Pain points: ${state.topPainPoints || '-'}
- Target bisnis: ${state.businessGoals || '-'}
- Judul pelatihan: ${state.proposalTitle}
- Penyelenggara: ${state.organizerName || '-'}
- Unit kompetensi: ${state.competencyUnit || '-'}

Setiap sesi harus: { "title", "duration", "method", "description" }. method harus salah satu: ${METHOD_CHOICES.join(', ')}. duration realistis (1-3 jam). description sebutkan sub-topik + output/artefak yang peserta bawa pulang. Industri klien harus terasa di deskripsi.

Output HANYA JSON valid, tidak ada teks lain.`;

    let parsed = null;
    try {
      const res = await callAi(ai, [
        { role: 'system', content: 'Anda adalah perancang kurikulum senior. Output HANYA JSON valid.' },
        { role: 'user', content: insightsPrompt }
      ], { temperature: 0.5, response_format: ai.provider === 'openai' ? { type: 'json_object' } : undefined });
      const m = String(res).match(/\{"materials"\s*:\s*\[[\s\S]*\]\}/) || String(res).match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    } catch (_) {}

    // Fallback: try direct array
    if (!parsed || !Array.isArray(parsed.materials)) {
      try {
        const res2 = await callAi(ai, [
          { role: 'system', content: 'Anda adalah perancang kurikulum senior. Output HANYA JSON array valid (dimulai dengan [, diakhiri ]), tidak ada teks lain. Tiap item: {title, duration, method, description}.' },
          { role: 'user', content: insightsPrompt }
        ], { temperature: 0.5 });
        const m = String(res2).match(/\[[\s\S]*\]/);
        parsed = m ? { materials: JSON.parse(m[0]) } : null;
      } catch (e) {
        throw new Error('AI response tidak bisa diparse. Coba lagi.');
      }
    }
    if (!Array.isArray(parsed.materials) || parsed.materials.length === 0) throw new Error('Tidak ada sesi yang dihasilkan.');

    const normalized = parsed.materials.slice(0, 10).map((m, i) => ({
      no: i + 1,
      title: String(m.title || `Sesi ${i + 1}`),
      duration: String(m.duration || '2 jam'),
      method: METHOD_CHOICES.find(opt => (m.method || '').toLowerCase().includes(opt.toLowerCase())) || 'Ceramah',
      description: String(m.description || '')
    }));
    renderMaterialsRows(normalized);
    saveProposalState();
    toast(`${normalized.length} sesi materi dihasilkan`, 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = original;
  }
});

document.getElementById('saveAiBtn').addEventListener('click', () => {
  const cfg = {
    provider: document.getElementById('aiProvider').value,
    model: document.getElementById('aiModel').value,
    baseUrl: document.getElementById('aiBaseUrl').value.trim(),
    apiKey: document.getElementById('aiApiKey').value.trim()
  };
  Store.set('pg_ai', cfg);
  toast('Pengaturan AI disimpan', 'success');
});

document.getElementById('testAiBtn').addEventListener('click', async () => {
  const cfg = {
    provider: document.getElementById('aiProvider').value,
    model: document.getElementById('aiModel').value,
    baseUrl: document.getElementById('aiBaseUrl').value.trim(),
    apiKey: document.getElementById('aiApiKey').value.trim()
  };
  const status = document.getElementById('aiStatus');
  status.textContent = '⏳ Menguji...';
  try {
    const r = await callAi(cfg, [{ role: 'user', content: 'Balas dengan kata "OK".' }]);
    if (r) { status.textContent = '✅ Berhasil'; toast('Koneksi AI berhasil', 'success'); }
    else { status.textContent = '❌ Gagal'; toast('Gagal memanggil API', 'error'); }
  } catch (e) {
    status.textContent = '❌ ' + e.message;
    toast('Error: ' + e.message, 'error');
  }
});

// ---------- AI Caller ----------
function buildClientContext() {
  const s = Store.get('pg_proposal', {});
  const lines = [
    `Perusahaan klien: ${s.companyName || '-'}`,
    `Penyelenggara: ${s.organizerName || '-'}`,
    `Judul pelatihan: ${s.proposalTitle || '-'}`,
    `Unit kompetensi: ${s.competencyUnit || '-'}`,
    `Venue: ${s.venue || '-'}`,
    `Tanggal: ${s.startDate || '-'} s/d ${s.endDate || '-'}`,
    `Biaya per peserta: ${s.pricePerPerson || '-'}`,
    `Minimal peserta: ${s.minParticipants || '-'}`,
    s.clientIndustry ? `Industri klien: ${s.clientIndustry}` : null,
    s.companySize ? `Ukuran klien: ${s.companySize}` : null,
    s.topPainPoints ? `Pain points utama:\n${s.topPainPoints}` : null,
    s.businessGoals ? `Target bisnis:\n${s.businessGoals}` : null,
    s.budgetRange ? `Perkiraan budget: ${s.budgetRange}` : null,
    s.decisionTimeline ? `Timeline keputusan: ${s.decisionTimeline}` : null,
    s.decisionMakers ? `Pengambil keputusan: ${s.decisionMakers}` : null
  ].filter(Boolean);
  return lines.join('\n');
}

// Common system prompt. Includes persona, voice, banned phrases, format rules.
function buildSystemPrompt(cfg) {
  const framework = FRAMEWORKS[cfg.framework] || 'Gunakan prinsip copywriting profesional.';
  const banned = BANNED_PHRASES.map((p, i) => `${i+1}. "${p}"`).join('\n');
  return `Anda adalah konsultan senior penjualan Indonesia yang menulis proposal B2B bernilai tinggi (>Rp 50 juta). Gaya Anda: tajam, spesifik, percaya diri, FOKUS pada klien — bukan promosi vendor.

KERANGKA PERSUASI untuk bagian ini:
${framework}

PEDOMAN KERAS (WAJIB DIIKUTI):
- Tulis dalam bahasa Indonesia formal-korporat modern.
- Setiap klaim harus bisa diverifikasi atau diganti placeholder yang jelas (mis. "≥30%" bukan "meningkatkan penjualan").
- Lebih suka angka, rentang waktu, dan contoh industri spesifik daripada klaim generik.
- Hindari frasa klise dan basa-basi yang kosong. **JANGAN PERNAH** gunakan frasa berikut:
${banned}
- Output hanya BODY — jangan heading, jangan markdown code block, jangan instruksi pembuka/penutup.
- Panjangnya sesuai permintaan pada prompt user. Jika tidak ada, default 3 paragraf (≈ 120-180 kata) untuk naratif, atau 4-6 poin bullet untuk daftar.
- Jika informasi klien kosong, JANGAN mengarang angka — gunakan placeholder seperti "[X]%" atau "[industri klien]" yang mudah diedit user nanti.`;
}

// Stage-1 prompt: produce a structured insights JSON the writing stage will consume.
function buildInsightsPrompt(cfg) {
  const ctx = buildClientContext();
  return `Riset internal dulu sebelum menulis bagian "${cfg.label}".

Konteks:\n${ctx}

TUGAS:
Berdasarkan konteks di atas, hasilkan SATU objek JSON (TANPA teks di luar JSON) berisi:
- "headline": 1 kalimat sudut tajam yang membingkai masalah klien.
- "hooks": array 2 kalimat pembuka yang bisa dipakai di paragraf pertama.
- "differentiators": array 3-4 pembeda dibanding vendor lain.
- "outcomes": array 3 hasil terukur yang bisa diharapkan klien (boleh pakai placeholder seperti "[X]%" / "[N] hari").
- "proofPoints": array 1-2 bukti sosial (industri, klien, metric, atau asosiasi). Boleh placeholder.
- "objections": array 1-2 keraguan paling umum + counter 1 kalimat (untuk referensi tone, tidak harus masuk output).
- Untuk closing: "ctaProposal" = 1 kalimat CTA + "deadline" = tanggal konkret (mis. "15 November 2025") + "validity" = "14 hari sejak tanggal surat".
- Untuk peserta/audience: "personas": array 2-3 deskripsi persona singkat.

Pastikan setiap poin menggunakan konteks klien (industri, ukuran, pain points) bila tersedia. JSON harus valid dan bisa di-parse.`;
}

// Stage-2 prompt: write the actual section using the insights as ground truth.
function buildSectionPrompt(cfg, insightsJsonStr) {
  const lengthGuide = {
    background: '3 paragraf (≈ 150-200 kata).',
    description: '3-4 paragraf (≈ 180-240 kata) + sebutkan metode/metodologi.',
    objectives: '4-6 poin bullet, tiap poin 1 kalimat aktif yang ACTIONABLE.',
    audience: '2 paragraf (≈ 120-160 kata), persona + manifestasi kebutuhan mereka.',
    requirements: '4-6 poin bullet, tiap poin verifiable.',
    closing: '2 paragraf persuasif + 1 paragraf CTA assumptive (deadline + 2 kontak + tanda tangan).'
  };
  const base = `Riset internal (jangan tampilkan di output):\n${insightsJsonStr || '(riset tidak tersedia — gunakan inferensi dari konteks klien)'}\n\nTulis bagian "${cfg.label}" proposal.

Panjang target: ${lengthGuide[cfg.promptKey] || '2-3 paragraf.'}
Nada: percaya diri, spesifik, berorientasi klien.`;
  if (cfg.promptKey === 'closing') {
    return `${base}

PASTIKAN paragraf terakhir berisi:
1. Asumsi positif kerjasama ("Kami sudah准备...)
2. **Deadline konfirmasi**: sebutkan tanggal absolut (mis. "15 November 2025")
3. **Masa berlaku penawaran**: "14 hari sejak tanggal proposal"
4. **Dua kontak** (penjualan + admin) dengan nama & nomor WA/email
5. Tanda tangan digital di atas nama jelas`;
  }
  return base;
}

// Robust JSON extractor for LLM responses that may include prose around the JSON.
function extractJson(text) {
  if (!text) return null;
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

async function callAi(cfg, messages, opts = {}) {
  if (!cfg.apiKey) throw new Error('API Key belum diisi');
  const defaults = {
    openai: 'https://api.openai.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    anthropic: 'https://api.anthropic.com/v1',
    groq: 'https://api.groq.com/openai/v1',
    custom: ''
  };
  const baseUrl = (cfg.baseUrl || defaults[cfg.provider] || '').replace(/\/+$/, '');
  if (!baseUrl) throw new Error('Base URL belum diisi');
  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      ...(opts.response_format ? { response_format: opts.response_format } : {})
    })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`${r.status} ${t.slice(0, 120)}`);
  }
  const data = await r.json();
  return data?.choices?.[0]?.message?.content || '';
}

// 2-stage AI pipeline: research → write (or just rewrite using stored insights)
async function generateAi(cfg, options = {}) {
  const state = Store.get('pg_proposal', {});
  if (!state.companyName || !state.proposalTitle) {
    toast('Lengkapi Info Penting (Step 2) dulu', 'error'); return;
  }
  const ai = Store.get('pg_ai', {});
  if (!ai.apiKey) {
    toast('Atur API Key dulu di Pengaturan AI', 'error');
    showStep('settings'); return;
  }

  const mode = options.mode || 'chain'; // 'chain' | 'rewrite' | 'research'
  const chainBtn  = document.querySelector(`[data-target="${cfg.id}"][data-action="chain"]`);
  const rewriteBtn = document.querySelector(`[data-target="${cfg.id}"][data-action="rewrite"]`);
  const researchBtn = document.querySelector(`[data-target="${cfg.id}"][data-action="research"]`);
  const buttons = [chainBtn, rewriteBtn, researchBtn].filter(Boolean);
  const originalHtmlByBtn = new Map(buttons.map(b => [b, b.innerHTML]));
  const setBusy = (btn, label) => { if (btn) { btn.disabled = true; btn.innerHTML = `<span>${label}</span>`; } };
  buttons.forEach(b => setBusy(b, '⏳ ...'));

  try {
    let insights = Store.get(`pg_insights_${cfg.id}`, null);

    if (mode !== 'rewrite' && mode !== 'chain-no-research') {
      // Stage 1: research
      setBusy(researchBtn || chainBtn, '⏳ Riset...');
      const insightText = await callAi(ai, [
        { role: 'system', content: 'Anda adalah analis riset senior. Output HANYA JSON valid. Tidak ada teks lain.' },
        { role: 'user', content: buildInsightsPrompt(cfg) }
      ], { temperature: 0.4, response_format: ai.provider === 'openai' ? { type: 'json_object' } : undefined });
      const parsed = extractJson(insightText);
      if (parsed) {
        insights = parsed;
        Store.set(`pg_insights_${cfg.id}`, insights);
        renderInsightsPanel(cfg.id, insights);
      }
    }

    if (mode === 'research') {
      toast('Riset diperbarui', 'success');
      return;
    }

    // Stage 2: write
    setBusy(chainBtn || rewriteBtn, '⏳ Menulis...');
    const insightsJson = insights ? JSON.stringify(insights) : '';
    const sectionText = await callAi(ai, [
      { role: 'system', content: buildSystemPrompt(cfg) },
      { role: 'user', content: buildSectionPrompt(cfg, insightsJson) }
    ]);
    const ta = document.getElementById(cfg.id);
    if (ta) { ta.value = sectionText.trim(); saveProposalState(); }
    toast(`${cfg.label} diperbarui`, 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    buttons.forEach(b => { b.disabled = false; if (originalHtmlByBtn.has(b)) b.innerHTML = originalHtmlByBtn.get(b); });
  }
}

// ---------- Proposal Data Extractor ----------
function getProposalData() {
  const s = Store.get('pg_proposal', {});
  return {
    template: s.template || 'classic',
    title: s.proposalTitle || 'Proposal Pelatihan',
    company: s.companyName || '',
    organizer: s.organizerName || '',
    competency: s.competencyUnit || '',
    cta: s.cta || '',
    startDate: s.startDate || '',
    endDate: s.endDate || '',
    venue: s.venue || '',
    pricePerPerson: s.pricePerPerson || '',
    minParticipants: s.minParticipants || '',
    priceNotes: s.priceNotes || '',
    facilities: Array.isArray(s.facilities) ? s.facilities : [],
    // Client brief fields (used by Exec Summary + Closing CTA)
    clientIndustry: s.clientIndustry || '',
    companySize: s.companySize || '',
    topPainPoints: s.topPainPoints || '',
    businessGoals: s.businessGoals || '',
    budgetRange: s.budgetRange || '',
    decisionTimeline: s.decisionTimeline || '',
    decisionMakers: s.decisionMakers || '',
    body: {
      background: s.background || '',
      description: s.description || '',
      objectives: s.objectives || '',
      audience: s.audience || '',
      requirements: s.requirements || '',
      closing: s.closing || ''
    },
    materials: Array.isArray(s.materials) ? s.materials : []
  };
}

const MONTH_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return `${dt.getDate()} ${MONTH_ID[dt.getMonth()]} ${dt.getFullYear()}`;
}
function fmtDateRange(a, b) {
  const fa = fmtDate(a), fb = fmtDate(b);
  if (!fa && !fb) return '';
  if (!b || fa === fb) return fa;
  // try same-month merge: "5-7 September 2026"
  const da = new Date(a), db = new Date(b);
  if (!isNaN(da) && !isNaN(db) && da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()) {
    return `${da.getDate()}-${db.getDate()} ${MONTH_ID[da.getMonth()]} ${da.getFullYear()}`;
  }
  return `${fa} – ${fb}`;
}
function fmtYear() { return new Date().getFullYear(); }
function parseBullets(text) {
  if (!text) return [];
  return text.split(/\n+/).map(l => l.replace(/^[\u2022\-\*]\s*/, '').trim()).filter(Boolean);
}
function pad2(n) { return String(n).padStart(2, '0'); }

// ---------- Materials DOCX block ----------
function buildMaterialsDocx(data) {
  const mats = Array.isArray(data.materials) ? data.materials : [];
  if (mats.length === 0) return [];
  const rows = [new TableRow({
    tableHeader: true,
    children: ['No','Topik & Deskripsi','Durasi','Metode'].map(label =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: COL_PRIMARY, color: 'auto' },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 22 })] })]
      })
    )
  }),
  ...mats.map((m, i) => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), bold: true, size: 22 })] })] }),
      new TableCell({ children: [
        new Paragraph({ children: [new TextRun({ text: m.title || `Sesi ${i+1}`, bold: true, size: 22 })], spacing: { after: 60 } }),
        ...(m.description ? [new Paragraph({ children: [new TextRun({ text: m.description, size: 20, color: '475569' })] })] : [])
      ]}),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.duration || '—', size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.method || 'Ceramah', size: 22 })] })] })
    ]
  }))];

  return [
    new Paragraph({ children: [new TextRun({ text: '02A', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })], spacing: { after: 100 } }),
    new Paragraph({
      children: [new TextRun({ text: 'Materi Pelatihan', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    new Paragraph({
      children: [new TextRun({
        text: `${mats.length} sesi yang membahas aspek fundamental hingga implementasi — disusun dari pendalaman masalah spesifik ${data.company || 'klien'} agar peserta langsung bisa mempraktikkan di unit kerja masing-masing.`,
        size: 22
      })],
      spacing: { after: 200 }
    }),
    new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
    new Paragraph({ text: '', spacing: { after: 360 } })
  ];
}

// ---------- Proposal HTML Renderer ----------
function renderProposalHTML(data, opts = {}) {
  const tpl = data.template;
  const pdf = opts.cssMode === 'pdf';
  const dateRange = fmtDateRange(data.startDate, data.endDate);
  const facilityIcon = (i) => ['🎓','📚','🍽️','🏨','💻','💬','🏆','📜','✈️','🎯'][i % 10];

  const sectionBlocks = [
    {num:1, title:'Latar Belakang', body: nl2br(data.body.background || '—')},
    {num:2, title:'Deskripsi Pelatihan', body: nl2br(data.body.description || '—')},
    {num:3, title:'Tujuan', body: nl2br(data.body.objectives || '—'), list: parseBullets(data.body.objectives)},
    {num:4, title:'Peserta', body: nl2br(data.body.audience || '—')},
    {num:5, title:'Persyaratan Peserta', body: nl2br(data.body.requirements || '—'), list: parseBullets(data.body.requirements), isCheck:true},
  ].map(s => `
    <section class="section-block">
      <div class="section-num">${pad2(s.num)}</div>
      <div class="section-content">
        <h2 class="section-title">${s.title}</h2>
        ${s.list && s.list.length
          ? `<ul class="section-list${s.isCheck ? ' checklist' : ''}">${s.list.map((li,i) => s.isCheck
              ? `<li><span class="check-mark">✓</span><span>${escapeHtml(li)}</span></li>`
              : `<li><span class="bullet"></span><span>${escapeHtml(li)}</span></li>`).join('')}</ul>`
          : `<p class="section-body">${s.body}</p>`
        }
      </div>
    </section>
  `);

  // Insert Materials block right after Deskripsi (2nd item = index 1)
  const materialsBlockHTML = buildMaterialsSectionHTML(data);
  if (materialsBlockHTML) {
    sectionBlocks.splice(2, 0, materialsBlockHTML); // insert after Deskripsi (index 1)
  }
  const sectionsHTML = sectionBlocks.join('');

  // Schedule table (6) — dynamic rows based on start/end dates
  const scheduleRows = buildScheduleDays(data.startDate, data.endDate);
  const scheduleSection = `
    <section class="section-block">
      <div class="section-num">06</div>
      <div class="section-content">
        <h2 class="section-title">Jadwal Pelaksanaan</h2>
        ${dateRange ? `<p class="section-body"><strong>Tanggal:</strong> ${escapeHtml(dateRange)} (${scheduleRows.length} hari)</p>` : ''}
        ${data.venue ? `<p class="section-body"><strong>Lokasi:</strong> ${escapeHtml(data.venue)}</p>` : ''}
        <table class="proposal-table schedule-table">
          <thead><tr><th style="width:35%">Waktu</th><th>Agenda</th></tr></thead>
          <tbody>
            ${scheduleRows.map(label => `<tr><td><strong>${escapeHtml(label.split(' — ')[0])}</strong></td><td>${escapeHtml(label.split(' — ')[1] || 'Sesi inti & latihan terapan')}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  // Pricing table (7)
  const pricingSection = `
    <section class="section-block">
      <div class="section-num">07</div>
      <div class="section-content">
        <h2 class="section-title">Investasi</h2>
        <table class="proposal-table pricing-table">
          <thead><tr><th>Item</th><th style="width:40%">Keterangan</th></tr></thead>
          <tbody>
            ${data.pricePerPerson ? `<tr><td><strong>Biaya per Peserta</strong></td><td>${escapeHtml(data.pricePerPerson)}</td></tr>` : ''}
            ${data.minParticipants ? `<tr><td><strong>Minimal Peserta</strong></td><td>${escapeHtml(data.minParticipants)} orang</td></tr>` : ''}
            ${data.priceNotes ? `<tr><td><strong>Catatan</strong></td><td>${escapeHtml(data.priceNotes)}</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    </section>
  `;

  // Facilities (8)
  const facilitiesSection = `
    <section class="section-block">
      <div class="section-num">08</div>
      <div class="section-content">
        <h2 class="section-title">Fasilitas Peserta</h2>
        ${data.facilities.length ? `
          <div class="facility-grid">
            ${data.facilities.map((f, i) => `
              <div class="facility-card-doc">
                <div class="facility-doc-icon">${facilityIcon(i)}</div>
                <div class="facility-doc-label">${escapeHtml(f)}</div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="section-body">—</p>'}
      </div>
    </section>
  `;

  // Closing (9) — upgraded with assumptive close, deadline, validity, dua kontak, tanda tangan
  const validityDate = offerValidityDate(14);
  const deadlineStr = fmtDateIndo(validityDate);
  const ttdName = data.organizer || 'Tim Account Executive';
  const ctaText = data.cta || 'Mari wujudkan bersama.';
  const contactsHTML = `
    <div class="closing-contacts">
      <div class="closing-contact"><div class="cc-label">Penjualan</div><div class="cc-name">${escapeHtml(ttdName)}</div><div class="cc-info">WA: 08XX-XXXX-XXXX • email@vendor.co.id</div></div>
      <div class="closing-contact"><div class="cc-label">Administrasi</div><div class="cc-name">Tim Admin Proyek</div><div class="cc-info">WA: 08XX-XXXX-XXXX • admin@vendor.co.id</div></div>
    </div>
  `;
  const closingSection = `
    <section class="section-block closing-block">
      <div class="section-num">09</div>
      <div class="section-content">
        <h2 class="section-title">Penutup</h2>
        <p class="section-body">${nl2br(data.body.closing || '—')}</p>
        <div class="closing-cta-block">
          <div class="closing-cta-headline">${escapeHtml(ctaText)}</div>
          <div class="closing-cta-meta">
            <div class="closing-pill"><span class="cp-label">Masa berlaku</span><span class="cp-value">${deadlineStr}</span></div>
            <div class="closing-pill"><span class="cp-label">Deadline konfirmasi</span><span class="cp-value">${deadlineStr}</span></div>
          </div>
          ${contactsHTML}
          <div class="closing-signoff">
            <div class="sig-label">Hormat kami,</div>
            <div class="sig-space"></div>
            <div class="sig-name"><strong>${escapeHtml(ttdName)}</strong></div>
            <div class="sig-role">Account Executive • ${escapeHtml(data.organizer || '')}</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // ---------- New persuasion sections (used inside the proposal) ----------
  const execSummaryHTML = buildExecSummaryHTML(data, { pdf, dateRange });
  const whyUsSectionHTML = buildWhyUsSectionHTML(data);
  const roiSectionHTML = buildRoiSectionHTML();

  return `
    <article class="proposal tpl-${tpl}">
      <!-- COVER PAGE -->
      <section class="cover-page${pdf ? ' cover-pdf' : ''}">
        <div class="cover-decor">
          <div class="cover-block block-1"></div>
          <div class="cover-block block-2"></div>
          <div class="cover-block block-3"></div>
        </div>
        <div class="cover-content">
          <div class="cover-tag">PROPOSAL PELATIHAN</div>
          <h1 class="cover-title">${escapeHtml(data.title)}</h1>
          <p class="cover-sub">Disusun untuk peningkatan kapasitas & pengembangan sumber daya manusia</p>
          <div class="cover-meta">
            ${data.organizer ? `<div class="cover-meta-row"><span>Disusun Oleh</span><strong>${escapeHtml(data.organizer)}</strong></div>` : ''}
            ${data.company ? `<div class="cover-meta-row"><span>Untuk</span><strong>${escapeHtml(data.company)}</strong></div>` : ''}
            ${dateRange ? `<div class="cover-meta-row"><span>Tanggal</span><strong>${escapeHtml(dateRange)}</strong></div>` : ''}
            <div class="cover-meta-row"><span>Tahun</span><strong>${fmtYear()}</strong></div>
          </div>
          ${data.competency ? `<div class="cover-competency">Unit Kompetensi: ${escapeHtml(data.competency)}</div>` : ''}
        </div>
      </section>

      <!-- EXECUTIVE SUMMARY (NEW — right after cover) -->
      ${execSummaryHTML}

      <!-- TABLE OF CONTENTS PAGE -->
      <section class="proposal-page toc-page${pdf ? ' page-pdf' : ''}">
        <div class="page-header">
          <div class="page-eyebrow">Daftar Isi</div>
          <h2 class="page-title">Table of Contents</h2>
        </div>
        <ul class="toc-list">
          ${(() => {
            // Expanded TOC includes Exec Summary + Why Us + ROI
            return [
              ['ES','Ringkasan Eksekutif'],
              ['01','Latar Belakang'],
              ['02','Deskripsi Pelatihan'],
              ['02A','Materi Pelatihan'],
              ['03','Tujuan'],
              ['04','Peserta'],
              ['05','Persyaratan Peserta'],
              ['05A','Mengapa Memilih Kami'],
              ['05B','Dampak & ROI'],
              ['06','Jadwal Pelaksanaan'],
              ['07','Investasi'],
              ['08','Fasilitas'],
              ['09','Penutup']
            ].map(([n, t]) => `
              <li class="toc-item">
                <span class="toc-num">${n}</span>
                <span class="toc-label">${escapeHtml(t)}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">${pdf ? '' : ''}</span>
              </li>
            `).join('');
          })()}
        </ul>
      </section>

      <!-- HEADER / INFO PAGE -->
      <section class="proposal-page info-page${pdf ? ' page-pdf' : ''}">
        <div class="page-header">
          <div class="page-eyebrow">Informasi Proposal</div>
          <h2 class="page-title">${escapeHtml(data.title)}</h2>
        </div>
        <div class="info-grid">
          ${data.company ? `<div class="info-card"><div class="info-label">Untuk Perusahaan</div><div class="info-value">${escapeHtml(data.company)}</div></div>` : ''}
          ${data.organizer ? `<div class="info-card"><div class="info-label">Penyelenggara</div><div class="info-value">${escapeHtml(data.organizer)}</div></div>` : ''}
          ${dateRange ? `<div class="info-card"><div class="info-label">Tanggal</div><div class="info-value">${escapeHtml(dateRange)}</div></div>` : ''}
          ${data.venue ? `<div class="info-card"><div class="info-label">Venue</div><div class="info-value">${escapeHtml(data.venue)}</div></div>` : ''}
          ${data.competency ? `<div class="info-card info-card-wide"><div class="info-label">Unit Kompetensi</div><div class="info-value">${escapeHtml(data.competency)}</div></div>` : ''}
        </div>
      </section>

      <!-- SECTIONS PAGE (could be multiple) -->
      <section class="proposal-page sections-page${pdf ? ' page-pdf' : ''}">
        <div class="sections-wrap">
          ${sectionsHTML}
          ${whyUsSectionHTML}
          ${roiSectionHTML}
          ${scheduleSection}
          ${pricingSection}
          ${facilitiesSection}
          ${closingSection}
        </div>
        <div class="proposal-footer">
          <span class="proposal-footer-text">${escapeHtml(data.organizer || '—')} • ${escapeHtml(data.company || '—')}</span>
          <span class="proposal-footer-num">—  ${pdf ? '' : ''}  —</span>
        </div>
      </section>
    </article>
  `;
}

// ---------- Generate Proposal ----------
document.getElementById('generateBtn').addEventListener('click', () => {
  const data = getProposalData();
  if (!data.title || data.title === 'Proposal Pelatihan') {
    toast('Isi Judul Proposal dulu (Step 2)', 'error'); return;
  }
  const preview = document.getElementById('previewArea');
  preview.innerHTML = renderProposalHTML(data, { cssMode: 'screen' });
  document.getElementById('exportPdfBtn').style.display = 'inline-flex';
  document.getElementById('exportDocxBtn').style.display = 'inline-flex';
  preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('Proposal siap — tinggal di-export', 'success');
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}
function nl2br(str) { return escapeHtml(str).replace(/\n/g, '<br/>'); }

// Build Executive Summary bullets from the body + client brief + insights.
function buildExecSummaryHTML(data, opts = {}) {
  const pdf = !!opts.pdf;
  const dateRange = opts.dateRange || '';
  const insights = Store.get('pg_insights_background', null);
  const headline = insights?.headline || data.title;
  const diffs = Array.isArray(insights?.differentiators) && insights.differentiators.length
    ? insights.differentiators.slice(0, 3)
    : ['Tenaga pengajar tersertifikasi', 'Metodologi berbasis studi kasus industri Anda', 'Garansi pascapelatihan & konsultasi'];
  const outcomes = Array.isArray(insights?.outcomes) && insights.outcomes.length
    ? insights.outcomes.slice(0, 3)
    : ['Peserta memahami kerangka kerja', 'Peserta mampu mengaplikasikan di pekerjaan nyata', 'Perusahaan memiliki blueprint implementasi'];
  const investment = data.pricePerPerson || '—';
  const decisionMakers = data.decisionMakers || 'tim pengambil keputusan Anda';
  return `
    <section class="proposal-page exec-summary-page${pdf ? ' page-pdf' : ''}">
      <div class="page-header">
        <div class="page-eyebrow">Ringkasan Eksekutif</div>
        <h2 class="page-title">Satu Halaman untuk Pengambil Keputusan</h2>
      </div>
      <div class="exec-headline">${escapeHtml(headline)}</div>
      <p class="exec-meta">Disusun untuk <strong>${escapeHtml(data.company)}</strong> • oleh <strong>${escapeHtml(data.organizer)}</strong>${dateRange ? ' • ' + escapeHtml(dateRange) : ''}</p>

      <div class="exec-grid">
        <div class="exec-card exec-problem">
          <div class="exec-card-tag">Masalah</div>
          <div class="exec-card-body">${escapeHtml((Store.get('pg_proposal', {}).topPainPoints || 'Kesenjangan kompetensi inti yang menghambat pertumbuhan unit bisnis.').split('\n')[0])}</div>
        </div>
        <div class="exec-card exec-solution">
          <div class="exec-card-tag">Solusi</div>
          <div class="exec-card-body">${escapeHtml(data.title)} — intervensi pelatihan terstruktur dengan pendekatan "${(insights?.differentiators?.[0] || 'studi kasus industri').slice(0, 60)}".</div>
        </div>
      </div>

      <div class="exec-section">
        <div class="exec-section-title">Mengapa Kami (3 Pembeda)</div>
        <ul class="exec-diffs">${diffs.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
      </div>

      <div class="exec-section">
        <div class="exec-section-title">Hasil Terukur yang Diharapkan</div>
        <ul class="exec-outcomes">${outcomes.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
      </div>

      <div class="exec-bottom">
        <div class="exec-investment">
          <div class="exec-investment-label">Investasi</div>
          <div class="exec-investment-value">${escapeHtml(investment)}<span class="exec-investment-unit">/peserta</span></div>
        </div>
        <div class="exec-next">
          <div class="exec-next-label">Langkah Selanjutnya</div>
          <div class="exec-next-body">Konfirmasi dari <strong>${escapeHtml(decisionMakers)}</strong> via WhatsApp atau email di halaman Penutup.</div>
        </div>
      </div>
    </section>
  `;
}

// Build "Mengapa Memilih Kami" section — uses insights or sensible defaults.
function buildWhyUsSectionHTML(data) {
  const insights = Store.get('pg_insights_background', null) || Store.get('pg_insights_description', null);
  const diffs = Array.isArray(insights?.differentiators) && insights.differentiators.length
    ? insights.differentiators.slice(0, 5)
    : ['Tenaga pengajar tersertifikasi BNSP', 'Metodologi blended (live + e-learning)', 'Studi kasus dari industri klien', 'Garansi pascapelatihan 30 hari', 'Sertifikat & laporan evaluasi'];
  const icons = ['🏅','🧪','📚','🛡️','📊','💬'];
  return `
    <section class="section-block">
      <div class="section-num">05A</div>
      <div class="section-content">
        <h2 class="section-title">Mengapa Memilih Kami</h2>
        <p class="section-body">Lima alasan ${escapeHtml(data.organizer || 'kami')} adalah mitra yang tepat untuk kebutuhan ${escapeHtml(data.company || 'klien Anda')}:</p>
        <div class="whyus-grid">
          ${diffs.map((d, i) => `
            <div class="whyus-card">
              <div class="whyus-icon">${icons[i % icons.length]}</div>
              <div class="whyus-text">${escapeHtml(d)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

// Build ROI / Expected Outcomes section.
function buildRoiSectionHTML() {
  const insights = Store.get('pg_insights_description', null) || Store.get('pg_insights_background', null);
  const outcomes = Array.isArray(insights?.outcomes) && insights.outcomes.length
    ? insights.outcomes.slice(0, 5)
    : [
        'Penurunan waktu onboarding karyawan baru dari 3 bulan ke 1 bulan',
        'Peningkatan produktivitas tim sebesar 15-20% dalam 90 hari pertama',
        'Standarisasi SOP dan blueprint yang siap di-rollout ke seluruh unit',
        'Penghematan biaya rekrutmen akibat retensi yang lebih baik',
        'Persiapan audit / sertifikasi selesai lebih cepat'
      ];
  const proof = Array.isArray(insights?.proofPoints) && insights.proofPoints.length
    ? insights.proofPoints.slice(0, 2)
    : ['Diselenggarakan untuk 30+ perusahaan manufaktur & FMCG', 'NPS rata-rata 4,7/5 dari 200+ peserta'];
  return `
    <section class="section-block">
      <div class="section-num">05B</div>
      <div class="section-content">
        <h2 class="section-title">Dampak & ROI yang Diharapkan</h2>
        <p class="section-body">Berinvestasi pada pelatihan terstruktur biasanya menghasilkan payback period 3-6 bulan melalui kombinasi efisiensi, retensi, dan revenue:</p>
        <div class="roi-grid">
          ${outcomes.map(o => `<div class="roi-card"><div class="roi-mark">↗</div><div class="roi-text">${escapeHtml(o)}</div></div>`).join('')}
        </div>
        ${proof.length ? `<div class="roi-proof"><strong>Bukti:</strong> ${proof.map(escapeHtml).join(' • ')}</div>` : ''}
      </div>
    </section>
  `;
}

// Dynamic schedule rows based on date range (falls back to 3 days).
function buildScheduleDays(startDate, endDate) {
  const defaults = ['Hari 1', 'Hari 2', 'Hari 3'];
  if (!startDate) return defaults;
  const a = new Date(startDate); const b = new Date(endDate || startDate);
  if (isNaN(a) || isNaN(b)) return defaults;
  const days = Math.max(1, Math.round((b - a) / 86400000) + 1);
  const labels = ['Pembukaan & fondasi', 'Pendalaman & latihan terapan', 'Studi kasus & presentasi', 'Uji kompetensi & rencana aksi', 'Coaching & konsolidasi', 'Workshop lanjutan', 'Implementasi & monitoring'];
  const out = [];
  for (let i = 0; i < days; i++) {
    out.push(`Hari ${i + 1}${labels[i] ? ' — ' + labels[i] : ''}`);
  }
  return out;
}

// Materials section — appears in the proposal after Deskripsi (before Persyaratan)
function buildMaterialsSectionHTML(data) {
  const mats = Array.isArray(data.materials) ? data.materials : [];
  if (mats.length === 0) return '';
  const rows = mats.map((m, i) => `
    <tr class="material-row-tr">
      <td class="mat-no"><div class="mat-no-badge">${i + 1}</div></td>
      <td class="mat-title">
        <div class="mat-title-text">${escapeHtml(m.title || `Sesi ${i + 1}`)}</div>
        ${m.description ? `<div class="mat-desc">${escapeHtml(m.description)}</div>` : ''}
      </td>
      <td class="mat-dur"><span class="mat-pill">${escapeHtml(m.duration || '—')}</span></td>
      <td class="mat-method"><span class="mat-method-tag">${escapeHtml(m.method || 'Ceramah')}</span></td>
    </tr>
  `).join('');
  const totalHours = mats.length; // rough estimate
  return `
    <section class="section-block materials-block">
      <div class="section-num">03A</div>
      <div class="section-content">
        <h2 class="section-title">Materi Pelatihan</h2>
        <p class="section-body">Kurikulum <strong>${mats.length} sesi</strong> yang membahas aspek fundamental hingga implementasi — disusun dari pendalaman masalah spesifik <strong>${escapeHtml(data.company || 'klien')}</strong> agar peserta langsung bisa mempraktikkan di unit kerja masing-masing.</p>
        <table class="proposal-table materials-table">
          <thead>
            <tr>
              <th style="width:6%">No</th>
              <th>Topik & Deskripsi Sesi</th>
              <th style="width:14%">Durasi</th>
              <th style="width:16%">Metode</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="materials-totals">
          <div class="materials-total-item"><span class="mti-label">Total Sesi</span><span class="mti-value">${mats.length}</span></div>
          <div class="materials-total-item"><span class="mti-label">Metode Campuran</span><span class="mti-value">${new Set(mats.map(m => m.method || 'Ceramah')).size}</span></div>
          <div class="materials-total-item"><span class="mti-label">Estimasi Durasi</span><span class="mti-value">± ${totalHours * 2} jam</span></div>
        </div>
      </div>
    </section>
  `;
}

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const data = getProposalData();
  const html = renderProposalHTML(data, { cssMode: 'pdf' });
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(data.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
    <style>${getPrintCss()}</style>
    </head><body>${html}</body></html>`);
  win.document.close();
  // wait fonts then trigger print
  setTimeout(() => { try { win.focus(); } catch(e){} win.print(); }, 700);
});

// ---------- Export DOCX ----------
document.getElementById('exportDocxBtn').addEventListener('click', async () => {
  if (!window.docx) {
    toast('Library DOCX belum termuat. Periksa koneksi internet.', 'error'); return;
  }
  const btn = document.getElementById('exportDocxBtn');
  btn.disabled = true;
  try {
    const doc = buildProposalDocx(getProposalData());
    const blob = await window.docx.Packer.toBlob(doc);
    const data = getProposalData();
    const safe = (data.title || 'proposal').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').toLowerCase();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `proposal-${safe}.docx`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    toast('File DOCX berhasil diunduh', 'success');
  } catch (e) {
    console.error(e);
    toast('Error buat DOCX: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ---------- Print CSS ----------
function getPrintCss() {
  return `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: 'Inter', sans-serif; color: #0f172a; background: white; }
    ${getProposalCssString()}
    /* Page sizing for PDF */
    .proposal { background: white; }
    .cover-page { page-break-after: always; height: 297mm; padding: 24mm; }
    .proposal-page { page-break-after: always; padding: 24mm 22mm; min-height: 240mm; }
    .proposal-page:last-child { page-break-after: auto; }
    .proposal-footer { page-break-before: avoid; }
  `;
}

// ---------- Proposal CSS (shared string, also injected into preview via styles.css) ----------
function getProposalCssString() {
  return `
    .proposal { font-family: 'Inter', sans-serif; color: #0f172a; }
    .proposal * { box-sizing: border-box; }

    /* Cover Page */
    .cover-page {
      position: relative;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .cover-page.tpl-modern { background: linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%); }
    .cover-page.tpl-minimal { background: #fafafa; color: #0f172a; }
    .cover-page.tpl-minimal .cover-tag { color: #475569; }
    .cover-page.tpl-minimal .cover-title { color: #0f172a; }
    .cover-page.tpl-minimal .cover-sub { color: #475569; }
    .cover-page.tpl-minimal .cover-meta-row { border-bottom-color: rgba(15,23,42,0.08); }
    .cover-page.tpl-minimal .cover-meta-row span { color: #64748b; }
    .cover-decor { position: absolute; inset: 0; pointer-events: none; }
    .cover-block { position: absolute; border-radius: 50%; }
    .cover-page:not(.tpl-minimal) .cover-block { background: rgba(255,255,255,0.08); }
    .cover-page.tpl-minimal .cover-block { background: #6366f1; opacity: 0.12; }
    .block-1 { width: 400px; height: 400px; top: -120px; right: -100px; }
    .block-2 { width: 280px; height: 280px; bottom: -80px; left: -60px; }
    .block-3 { width: 200px; height: 200px; top: 35%; left: 50%; }
    .cover-content { position: relative; z-index: 2; max-width: 720px; }
    .cover-tag { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; opacity: 0.7; margin-bottom: 18px; }
    .cover-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 56px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 18px; }
    .cover-page.tpl-classic .cover-title { font-family: 'Plus Jakarta Sans', serif; letter-spacing: -0.02em; }
    .cover-page.tpl-minimal .cover-title { font-weight: 300; }
    .cover-sub { font-size: 16px; opacity: 0.85; margin-bottom: 32px; line-height: 1.55; max-width: 540px; }
    .cover-meta { display: grid; gap: 6px 24px; grid-template-columns: auto 1fr; margin-bottom: 28px; }
    .cover-meta-row {
      display: contents;
    }
    .cover-meta-row span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.6; padding-top: 8px; }
    .cover-meta-row strong { font-weight: 600; font-size: 14px; padding-top: 6px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.12); }
    .cover-page.tpl-minimal .cover-meta { display: block; }
    .cover-page.tpl-minimal .cover-meta-row { display: grid; grid-template-columns: 130px 1fr; padding: 10px 0; border-bottom: 1px solid rgba(15,23,42,0.08); }
    .cover-competency { display: inline-block; padding: 10px 18px; border-radius: 100px; background: rgba(255,255,255,0.12); font-size: 13px; font-weight: 500; }
    .cover-page.tpl-minimal .cover-competency { background: #f1f5f9; color: #475569; }

    /* Page header (TOC, INFO) */
    .page-header { margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px solid #0f172a; }
    .proposal.tpl-modern .page-header { border-color: #6366f1; }
    .proposal.tpl-minimal .page-header { border-color: #cbd5e1; border-bottom-style: dashed; }
    .page-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .proposal.tpl-modern .page-eyebrow { color: #6366f1; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
    .proposal.tpl-minimal .page-title { font-weight: 600; }

    /* TOC */
    .toc-list { list-style: none; padding: 0; margin: 24px 0; }
    .toc-item { display: grid; grid-template-columns: 60px 1fr 60px; align-items: center; gap: 16px; padding: 18px 0; border-bottom: 1px solid #e2e8f0; }
    .toc-num { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 700; color: #6366f1; }
    .proposal.tpl-classic .toc-num { color: #0f172a; }
    .proposal.tpl-minimal .toc-num { color: #64748b; font-weight: 600; }
    .toc-label { font-size: 16px; font-weight: 600; color: #0f172a; }
    .toc-dots {
      height: 1px;
      background-image: linear-gradient(to right, #cbd5e1 50%, transparent 50%);
      background-size: 6px 1px;
    }
    .toc-page { font-weight: 700; color: #64748b; font-size: 14px; text-align: right; }

    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px; }
    .info-card { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
    .info-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6366f1; margin-bottom: 6px; }
    .proposal.tpl-classic .info-label { color: #1e3a5f; }
    .proposal.tpl-minimal .info-label { color: #64748b; }
    .info-value { font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5; }
    .info-card-wide { grid-column: 1 / -1; }

    /* Section blocks */
    .sections-wrap { display: flex; flex-direction: column; gap: 36px; }
    .section-block { display: grid; grid-template-columns: 80px 1fr; gap: 20px; }
    .section-num {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 56px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.04em;
      color: #6366f1;
      background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .proposal.tpl-classic .section-num { background: linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .proposal.tpl-minimal .section-num { background: none; -webkit-text-fill-color: #cbd5e1; color: #cbd5e1; }
    .section-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0 0 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #6366f1;
      color: #0f172a;
    }
    .proposal.tpl-classic .section-title { border-bottom-color: #1e3a5f; }
    .proposal.tpl-minimal .section-title { border-bottom-style: dashed; border-bottom-color: #cbd5e1; font-weight: 600; }
    .section-body { font-size: 14px; line-height: 1.75; color: #334155; margin: 0 0 12px; }
    .section-list { list-style: none; padding: 0; margin: 8px 0; display: flex; flex-direction: column; gap: 8px; }
    .section-list li { display: grid; grid-template-columns: 20px 1fr; gap: 10px; align-items: flex-start; line-height: 1.6; color: #334155; font-size: 14px; }
    .section-list .bullet {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      background: #6366f1; margin-top: 8px;
    }
    .proposal.tpl-classic .section-list .bullet { background: #1e3a5f; }
    .section-list.checklist li .check-mark {
      width: 20px; height: 20px; border-radius: 50%;
      background: #10b981; color: white;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
    }

    /* Tables */
    .proposal-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    .proposal-table th, .proposal-table td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .proposal-table th {
      background: #f1f5f9;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #475569;
    }
    .proposal.tpl-modern .proposal-table th { background: #eef2ff; color: #4338ca; }
    .proposal.tpl-classic .proposal-table th { background: #1e3a5f; color: white; }
    .proposal.tpl-minimal .proposal-table th { background: transparent; border-bottom: 2px solid #0f172a; color: #0f172a; }
    .pricing-table tbody tr:nth-child(even) td { background: #f8fafc; }

    /* Facility grid */
    .facility-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .facility-card-doc {
      display: flex; gap: 12px; align-items: center;
      padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 10px;
      background: linear-gradient(135deg, #fafbff 0%, #f8fafc 100%);
    }
    .proposal.tpl-modern .facility-card-doc { background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); }
    .facility-doc-icon { font-size: 22px; }
    .facility-doc-label { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.4; }

    /* CTA box */
    .cta-box {
      margin-top: 16px;
      padding: 18px 22px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      border-radius: 12px;
      font-size: 15px;
      line-height: 1.5;
    }
    .proposal.tpl-classic .cta-box { background: #1e3a5f; }
    .proposal.tpl-minimal .cta-box { background: #0f172a; }

    /* Footer */
    .proposal-footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; color: #64748b; letter-spacing: 0.04em;
    }
    .proposal-footer-num { font-weight: 700; }
  `;
}

showStep(1);

// ---------- Build DOCX ----------
function buildProposalDocx(data) {
  const docx = window.docx;
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, AlignmentType,
    BorderStyle, ShadingType, PageBreak, PageNumber,
    Header, Footer, Tab, TabStopType, TabStopPosition,
    LevelFormat, AlignmentType: AlignType
  } = docx;

  const COL_PRIMARY = data.template === 'classic' ? '1E3A5F'
                     : data.template === 'minimal' ? '64748B'
                     : '6366F1';
  const COL_BG = data.template === 'minimal' ? 'F8FAFC' : 'F1F5F9';

  const fonts = {
    heading: data.template === 'minimal' ? 'Plus Jakarta Sans' : 'Plus Jakarta Sans',
    body: 'Inter'
  };

  // Helpers
  const H1 = (text, opts = {}) => new Paragraph({
    text,
    heading: opts.heading || HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 120 },
    ...opts
  });
  const P = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 120, line: 360 },
    ...opts
  });
  const PBold = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text, bold: true, ...opts })],
    spacing: { after: 120, line: 360 }
  });
  const PCell = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text: String(text || ''), ...opts })],
    spacing: { after: 60 }
  });

  // --- Cover Page ---
  const coverBlocks = [
    new Paragraph({ text: '', spacing: { after: 2400 } }),
    new Paragraph({
      children: [new TextRun({ text: 'PROPOSAL PELATIHAN', bold: true, size: 22, color: '94A3B8' })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title, bold: true, size: 72, color: '0F172A', font: fonts.heading })],
      spacing: { after: 400, line: 360 },
      alignment: AlignmentType.LEFT
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Disusun untuk peningkatan kapasitas & pengembangan sumber daya manusia.', size: 24, color: '475569' })],
      spacing: { after: 800, line: 360 },
      alignment: AlignmentType.LEFT
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Disusun Oleh  ', bold: false, size: 20, color: '64748B' }),
        new TextRun({ text: data.organizer || '-', bold: true, size: 24, color: '0F172A' })
      ],
      spacing: { after: 100 }, alignment: AlignmentType.LEFT
    }),
    ...(data.company ? [new Paragraph({
      children: [
        new TextRun({ text: 'Untuk            ', size: 20, color: '64748B' }),
        new TextRun({ text: data.company, bold: true, size: 24, color: '0F172A' })
      ],
      spacing: { after: 100 }, alignment: AlignmentType.LEFT
    })] : []),
    ...(data.startDate ? [new Paragraph({
      children: [
        new TextRun({ text: 'Tanggal       ', size: 20, color: '64748B' }),
        new TextRun({ text: fmtDateRange(data.startDate, data.endDate), bold: true, size: 24, color: '0F172A' })
      ],
      spacing: { after: 100 }, alignment: AlignmentType.LEFT
    })] : []),
    new Paragraph({
      children: [
        new TextRun({ text: 'Tahun           ', size: 20, color: '64748B' }),
        new TextRun({ text: String(fmtYear()), bold: true, size: 24, color: '0F172A' })
      ],
      spacing: { after: 400 }, alignment: AlignmentType.LEFT
    }),
    ...(data.competency ? [new Paragraph({
      children: [new TextRun({ text: 'Unit Kompetensi: ' + data.competency, italics: true, size: 22, color: '6366F1' })],
      spacing: { after: 200 }
    })] : [])
  ];

  // --- TOC Page ---
  const toc = [
    'ES Ringkasan Eksekutif',
    '01 Latar Belakang',
    '02 Deskripsi Pelatihan',
    '02A Materi Pelatihan',
    '03 Tujuan',
    '04 Peserta',
    '05 Persyaratan Peserta',
    '05A Mengapa Memilih Kami',
    '05B Dampak & ROI',
    '06 Jadwal Pelaksanaan',
    '07 Investasi',
    '08 Fasilitas',
    '09 Penutup'
  ].map((entry, i) => {
    const [num, ...rest] = entry.split(' ');
    const title = rest.join(' ');
    return new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9000, leader: 'dot' }],
      children: [
        new TextRun({ text: num + '   ', bold: true, size: 24, color: COL_PRIMARY, font: fonts.heading }),
        new TextRun({ text: title, size: 22, color: '0F172A' }),
        new TextRun({ text: '\t' + String(i + 2).padStart(2, '0'), size: 22, bold: true, color: '64748B' })
      ],
      spacing: { after: 160 }
    });
  });

  // --- Info Page ---
  const infoCards = [
    ['Untuk Perusahaan', data.company],
    ['Penyelenggara', data.organizer],
    ['Tanggal', fmtDateRange(data.startDate, data.endDate)],
    ['Venue', data.venue]
  ].filter(([_, v]) => v).map(([label, value]) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: label.toUpperCase() + '\n', bold: true, size: 20, color: COL_PRIMARY }),
        new TextRun({ text: value + '\n\n', bold: true, size: 24, color: '0F172A' })
      ]
    })
  );

  // --- Sections ---
  const sectionContent = (num, title, body, bullets, isCheck) => {
    const blocks = [
      new Paragraph({
        children: [
          new TextRun({ text: num, bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 32, color: '0F172A', font: fonts.heading })],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
      })
    ];
    if (bullets && bullets.length) {
      blocks.push(...bullets.map(b => new Paragraph({
        children: [
          new TextRun({ text: isCheck ? '✓  ' : '•  ', bold: true, color: isCheck ? '10B981' : COL_PRIMARY, size: 24 }),
          new TextRun({ text: b, size: 24, color: '334155' })
        ],
        spacing: { after: 120, line: 360 },
        indent: { left: 200 }
      })));
    } else {
      blocks.push(...String(body || '—').split(/\n+/).map(line =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 24, color: '334155' })],
          spacing: { after: 120, line: 360 }
        })
      ));
    }
    blocks.push(new Paragraph({ text: '', spacing: { after: 360 } }));
    return blocks;
  };

  // Tables
  const pricingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Item', 'Keterangan'].map(label =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COL_PRIMARY, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 22 })] })]
          })
        )
      }),
      ...[
        data.pricePerPerson ? ['Biaya per Peserta', data.pricePerPerson] : null,
        data.minParticipants ? ['Minimal Peserta', data.minParticipants + ' orang'] : null,
        data.priceNotes ? ['Catatan', data.priceNotes] : null
      ].filter(Boolean).map(([a, b], i) =>
        new TableRow({
          children: [
            new TableCell({ shading: { type: ShadingType.CLEAR, fill: i % 2 ? COL_BG : 'FFFFFF', color: 'auto' },
              children: [new Paragraph({ children: [new TextRun({ text: a, bold: true, size: 22, color: '0F172A' })] })] }),
            new TableCell({ shading: { type: ShadingType.CLEAR, fill: i % 2 ? COL_BG : 'FFFFFF', color: 'auto' },
              children: [new Paragraph({ children: [new TextRun({ text: String(b), size: 22, color: '334155' })] })] })
          ]
        })
      )
    ]
  });

  const scheduleTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Waktu', 'Agenda'].map(label =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COL_PRIMARY, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 22 })] })]
          })
        )
      }),
      ...buildScheduleDays(data.startDate, data.endDate).map(label => {
        const [day, agenda = ''] = String(label).split(' — ');
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: day, bold: true, size: 22 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: agenda || 'Sesi inti & latihan terapan', size: 22 })] })] })
          ]
        });
      })
    ]
  });

  // Build document
  const insights = Store.get('pg_insights_background', null) || {};
  const insightDiffs = Array.isArray(insights.differentiators) && insights.differentiators.length
    ? insights.differentiators.slice(0, 3) : ['Tenaga pengajar tersertifikasi', 'Metodologi berbasis studi kasus', 'Garansi pascapelatihan'];
  const insightOuts = Array.isArray(insights.outcomes) && insights.outcomes.length
    ? insights.outcomes.slice(0, 4) : ['Peserta memahami kerangka kerja', 'Peserta mampu mengaplikasikan', 'Perusahaan memiliki blueprint implementasi'];
  const execSummaryDocx = [
    new Paragraph({ children: [new PageBreak()] }),
    H1('Ringkasan Eksekutif'),
    new Paragraph({
      children: [new TextRun({ text: insights.headline || data.title, bold: true, size: 26, color: COL_PRIMARY, font: fonts.heading })],
      spacing: { after: 80 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Disusun untuk ${data.company || '-'} • oleh ${data.organizer || '-'}${fmtDateRange(data.startDate, data.endDate) ? ' • ' + fmtDateRange(data.startDate, data.endDate) : ''}`, italics: true, size: 20, color: '64748B' })],
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'MASALAH: ', bold: true, size: 22, color: 'DC2626' }), new TextRun({ text: ((Store.get('pg_proposal', {}).topPainPoints || 'Kesenjangan kompetensi inti yang menghambat pertumbuhan unit bisnis.')).split('\n')[0], size: 22 })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'SOLUSI: ', bold: true, size: 22, color: '059669' }), new TextRun({ text: `${data.title} — intervensi pelatihan terstruktur dengan pendekatan studi kasus industri.`, size: 22 })],
      spacing: { after: 200 }
    }),
    new Paragraph({ children: [new TextRun({ text: 'MENGAPA KAMI (3 Pembeda)', bold: true, size: 22, color: COL_PRIMARY })], spacing: { after: 80 } }),
    ...insightDiffs.map(d => new Paragraph({
      children: [new TextRun({ text: '✓ ', bold: true, color: '10B981', size: 22 }), new TextRun({ text: d, size: 22 })],
      spacing: { after: 80 }, indent: { left: 200 }
    })),
    new Paragraph({ children: [new TextRun({ text: 'HASIL TERUKUR YANG DIHARAPKAN', bold: true, size: 22, color: COL_PRIMARY })], spacing: { before: 200, after: 80 } }),
    ...insightOuts.map(o => new Paragraph({
      children: [new TextRun({ text: '• ', bold: true, color: COL_PRIMARY, size: 22 }), new TextRun({ text: o, size: 22 })],
      spacing: { after: 80 }, indent: { left: 200 }
    })),
    new Paragraph({
      children: [
        new TextRun({ text: 'INVESTASI: ', bold: true, size: 24, color: COL_PRIMARY }),
        new TextRun({ text: data.pricePerPerson || '-', bold: true, size: 24, color: '0F172A' }),
        new TextRun({ text: ' /peserta', size: 22, color: '64748B' })
      ],
      spacing: { before: 240, after: 80 }
    })
  ];

  const whyUsDocx = [
    new Paragraph({ children: [new TextRun({ text: '05A', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })], spacing: { after: 100 } }),
    new Paragraph({
      children: [new TextRun({ text: 'Mengapa Memilih Kami', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Lima pembeda yang membuat ${data.organizer || 'kami'} mitra pilihan ${data.company || 'klien'}:`, size: 22 })],
      spacing: { after: 200 }
    }),
    ...(Array.isArray(insights.differentiators) && insights.differentiators.length
      ? insights.differentiators.slice(0, 5)
      : ['Tenaga pengajar tersertifikasi BNSP', 'Metodologi blended (live + e-learning)', 'Studi kasus dari industri klien', 'Garansi pascapelatihan 30 hari', 'Sertifikat & laporan evaluasi']
    ).map((d, i) => new Paragraph({
      children: [
        new TextRun({ text: `${['🏅','🧪','📚','🛡️','📊'][i] || '✓'}  `, size: 24 }),
        new TextRun({ text: d, size: 22, color: '0F172A' })
      ],
      spacing: { after: 100 }, indent: { left: 200 }
    })),
    new Paragraph({ text: '', spacing: { after: 360 } })
  ];

  const roiDocx = [
    new Paragraph({ children: [new TextRun({ text: '05B', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })], spacing: { after: 100 } }),
    new Paragraph({
      children: [new TextRun({ text: 'Dampak & ROI yang Diharapkan', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Payback period investasi pelatihan biasanya 3-6 bulan melalui efisiensi, retensi, dan revenue:', size: 22 })],
      spacing: { after: 160 }
    }),
    ...(Array.isArray(insights.outcomes) && insights.outcomes.length
      ? insights.outcomes.slice(0, 5)
      : ['Penurunan waktu onboarding dari 3 bulan ke 1 bulan', 'Peningkatan produktivitas tim 15-20% dalam 90 hari', 'Standarisasi SOP dan blueprint', 'Penghematan biaya rekrutmen', 'Persiapan audit/sertifikasi lebih cepat']
    ).map((o, i) => new Paragraph({
      children: [
        new TextRun({ text: '↗ ', bold: true, color: '10B981', size: 24 }),
        new TextRun({ text: o, size: 22 })
      ],
      spacing: { after: 100 }, indent: { left: 200 }
    })),
    new Paragraph({ text: '', spacing: { after: 360 } })
  ];

  const children = [
    ...coverBlocks,
    new Paragraph({ children: [new PageBreak()] }),

    // Executive Summary
    ...execSummaryDocx,

    // TOC Page
    H1('Daftar Isi'),
    ...toc,
    new Paragraph({ children: [new PageBreak()] }),

    // Info Page
    H1('Informasi Proposal'),
    ...infoCards,
    new Paragraph({ children: [new PageBreak()] }),

    // Sections Page
    ...sectionContent('01', 'Latar Belakang', data.body.background),
    ...sectionContent('02', 'Deskripsi Pelatihan', data.body.description),
    ...buildMaterialsDocx(data),
    ...sectionContent('03', 'Tujuan', data.body.objectives, parseBullets(data.body.objectives)),
    ...sectionContent('04', 'Peserta', data.body.audience),
    ...sectionContent('05', 'Persyaratan Peserta', data.body.requirements, parseBullets(data.body.requirements), true),
    ...whyUsDocx,
    ...roiDocx,

    // Jadwal (6)
    new Paragraph({
      children: [new TextRun({ text: '06', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Jadwal Pelaksanaan', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    ...(data.venue ? [new Paragraph({ children: [new TextRun({ text: 'Lokasi: ' + data.venue, size: 24 })], spacing: { after: 200 } })] : []),
    scheduleTable,
    new Paragraph({ text: '', spacing: { after: 400 } }),

    // Investasi (7)
    new Paragraph({
      children: [new TextRun({ text: '07', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Investasi', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    pricingTable,
    new Paragraph({ text: '', spacing: { after: 400 } }),

    // Fasilitas (8)
    new Paragraph({
      children: [new TextRun({ text: '08', bold: true, size: 64, color: COL_PRIMARY, font: fonts.heading })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Fasilitas Peserta', bold: true, size: 32, color: '0F172A', font: fonts.heading })],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COL_PRIMARY, space: 1 } }
    }),
    ...(data.facilities.length ? data.facilities.map(f =>
      new Paragraph({
        children: [
          new TextRun({ text: '✓  ', bold: true, color: '10B981', size: 24 }),
          new TextRun({ text: f, size: 24, color: '334155' })
        ],
        spacing: { after: 120 }, indent: { left: 200 }
      })
    ) : [new Paragraph({ children: [new TextRun({ text: '—', size: 24 })] })]),
    new Paragraph({ text: '', spacing: { after: 400 } }),

    // Penutup (9)
    ...sectionContent('09', 'Penutup', data.body.closing),
    ...(data.cta ? [
      new Paragraph({
        children: [new TextRun({ text: data.cta || 'Mari wujudkan bersama.', bold: true, color: 'FFFFFF', size: 28 })],
        shading: { type: ShadingType.CLEAR, fill: COL_PRIMARY, color: 'auto' },
        spacing: { before: 200, after: 80 },
        indent: { left: 280, right: 280 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Masa berlaku penawaran: ', bold: true, size: 22, color: '0F172A' }),
          new TextRun({ text: fmtDateIndo(offerValidityDate(14)), bold: true, size: 22, color: 'DC2626' })
        ],
        spacing: { after: 80 }, indent: { left: 280, right: 280 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Kontak Penjualan: ', bold: true, size: 22, color: '0F172A' }),
          new TextRun({ text: `${data.organizer || 'Tim AE'} • WA 08XX-XXXX-XXXX • email@vendor.co.id`, size: 22 })
        ],
        spacing: { after: 80 }, indent: { left: 280, right: 280 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Kontak Administrasi: ', bold: true, size: 22, color: '0F172A' }),
          new TextRun({ text: 'Tim Admin Proyek • WA 08XX-XXXX-XXXX • admin@vendor.co.id', size: 22 })
        ],
        spacing: { after: 240 }, indent: { left: 280, right: 280 }
      }),
      new Paragraph({ children: [new TextRun({ text: 'Hormat kami,', size: 22 })], indent: { left: 280, right: 280 }, spacing: { after: 80 } }),
      new Paragraph({ text: '', spacing: { after: 600 } }),
      new Paragraph({ children: [new TextRun({ text: data.organizer || 'Account Executive', bold: true, size: 26, color: '0F172A' })], indent: { left: 280, right: 280 } }),
      new Paragraph({ children: [new TextRun({ text: `Account Executive • ${data.organizer || ''}`, italics: true, size: 20, color: '64748B' })], indent: { left: 280, right: 280 } })
    ] : [])
  ];

  return new Document({
    creator: 'Proposal Generator',
    title: data.title,
    styles: {
      default: {
        document: { run: { font: fonts.body, size: 24 } }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({ children: [new TextRun({ text: data.organizer || '', size: 18, color: '94A3B8' })], alignment: AlignmentType.RIGHT })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.CENTER, position: 4500 }, { type: TabStopType.RIGHT, position: 9000 }],
            children: [
              new TextRun({ text: data.title, size: 18, color: '94A3B8' }),
              new TextRun({ text: '\t' }),
              new TextRun({ children: ['Hal. ', PageNumber.CURRENT, ' dari ', PageNumber.TOTAL_PAGES], size: 18, color: '94A3B8' })
            ]
          })]
        })
      },
      children
    }]
  });
}

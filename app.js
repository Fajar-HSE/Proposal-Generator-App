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

// ---------- Sidebar mobile toggle ----------
document.getElementById('mobileToggle')?.addEventListener('click', () => {
  document.querySelector('.sidebar')?.classList.toggle('open');
});

// ---------- Navigation ----------
let currentStep = 1;
const stepTitles = {
  1: 'Pilih Template Design',
  2: 'Informasi Penting',
  3: 'Latar Belakang',
  4: 'Deskripsi',
  5: 'Tujuan',
  6: 'Peserta',
  7: 'Persyaratan Peserta',
  8: 'Tanggal & Venue',
  9: 'Biaya',
  10: 'Fasilitas',
  11: 'Penutup',
  settings: 'Pengaturan AI & Generate'
};

const aiSteps = {
  3: { id: 'background', label: 'Latar Belakang', promptKey: 'background' },
  4: { id: 'description', label: 'Deskripsi', promptKey: 'description' },
  5: { id: 'objectives', label: 'Tujuan', promptKey: 'objectives' },
  6: { id: 'audience', label: 'Peserta', promptKey: 'audience' },
  11: { id: 'closing', label: 'Penutup', promptKey: 'closing' }
};

function updateProgress(step) {
  if (step === 'settings') {
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressText').textContent = '✓';
    document.getElementById('stepMeta').textContent = 'Langkah terakhir';
    return;
  }
  const s = Number(step);
  const pct = (s / 11) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${s}/11`;
  document.getElementById('stepMeta').textContent = `Langkah ${s} dari 11`;
}

function showStep(step) {
  currentStep = step;
  document.getElementById('stepTitle').textContent = stepTitles[step] || '';
  document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
  const el = document.querySelector(`.step[data-step="${step}"]`);
  if (el) el.style.display = 'block';

  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', String(n.dataset.step) === String(step)));

  if (aiSteps[step]) buildAiStep(step);

  document.getElementById('prevBtn').style.display = step === 'settings' ? 'none' : '';
  document.getElementById('nextBtn').style.display = step === 'settings' ? 'none' : '';
  updateProgress(step);

  saveProposalState();
  // Close mobile sidebar
  document.querySelector('.sidebar')?.classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', e => {
  e.preventDefault();
  showStep(n.dataset.step);
}));

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
  if (s < 11) showStep(s + 1);
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
      <p>Gunakan AI untuk generate konten profesional, atau tulis manual dengan gaya Anda sendiri.</p>
    </div>
    <div class="form-card">
      <div class="ai-toolbar">
        <button class="btn btn-ai ai-suggest" data-target="${cfg.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z"/></svg>
          <span>Generate dengan AI</span>
        </button>
        <span class="toolbar-hint">AI akan menimpa konten di bawah ini.</span>
      </div>
      <div class="field-group">
        <label for="${cfg.id}">${cfg.label}</label>
        <textarea id="${cfg.id}" class="textarea tall" placeholder="Klik 'Generate dengan AI' atau tulis manual..."></textarea>
      </div>
    </div>
  `;
  stepEl.dataset.built = '1';
  document.getElementById(cfg.id).addEventListener('input', saveProposalState);
  stepEl.querySelector('.ai-suggest').addEventListener('click', () => generateAi(cfg));
  const state = Store.get('pg_proposal', {});
  if (state[cfg.id]) document.getElementById(cfg.id).value = state[cfg.id];
}

// Step 7
const reqEl = document.getElementById('requirements');
if (reqEl) reqEl.addEventListener('input', saveProposalState);
document.querySelector('[data-target="requirements"]')?.addEventListener('click', () =>
  generateAi({ id: 'requirements', label: 'Persyaratan Peserta', promptKey: 'requirements' })
);

// ---------- Save / Load ----------
function saveProposalState() {
  const state = Store.get('pg_proposal', {});
  const selected = document.querySelector('.template-card.selected');
  state.template = selected ? selected.dataset.template : (state.template || 'classic');
  ['companyName','organizerName','proposalTitle','competencyUnit','cta','startDate','endDate','venue','pricePerPerson','minParticipants','priceNotes'].forEach(id => {
    const el = document.getElementById(id);
    state[id] = el ? el.value : '';
  });
  ['background','description','objectives','audience','closing'].forEach(id => {
    const el = document.getElementById(id);
    state[id] = el ? el.value : (state[id] || '');
  });
  const rEl = document.getElementById('requirements');
  state.requirements = rEl ? rEl.value : (state.requirements || '');
  state.facilities = Array.from(document.querySelectorAll('#facilities input:checked')).map(i => i.value);
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
  ['background','description','objectives','audience','closing'].forEach(id => {
    const el = document.getElementById(id);
    if (el && s[id]) el.value = s[id];
  });
  if (s.facilities) document.querySelectorAll('#facilities input').forEach(i => i.checked = s.facilities.includes(i.value));
  if (s.requirements) {
    const el = document.getElementById('requirements');
    if (el) el.value = s.requirements;
  }
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
function buildPromptFor(cfg) {
  const s = Store.get('pg_proposal', {});
  const ctx = `Perusahaan: ${s.companyName || '-'}\nPenyelenggara: ${s.organizerName || '-'}\nJudul: ${s.proposalTitle || '-'}\nUnit Kompetensi: ${s.competencyUnit || '-'}\nVenue: ${s.venue || '-'}\nTanggal: ${s.startDate || '-'} s/d ${s.endDate || '-'}\nBiaya: ${s.pricePerPerson || '-'}`;
  const role = 'Anda adalah penulis proposal profesional berbahasa Indonesia.';
  const instructs = {
    background: `${role} Tulis "Latar Belakang" (3 paragraf, formal) untuk proposal pelatihan berikut. Jelaskan mengapa pelatihan ini penting.\n\nKonteks:\n${ctx}`,
    description: `${role} Tulis "Deskripsi" pelatihan (3-4 paragraf, formal) yang menjelaskan materi dan pendekatan pelatihan.\n\nKonteks:\n${ctx}`,
    objectives: `${role} Tulis "Tujuan" pelatihan dalam 4-6 poin singkat terukur. Awali tiap poin dengan "• ".\n\nKonteks:\n${ctx}`,
    audience: `${role} Tulis "Peserta" target dalam 2 paragraf (profil dan pihak yang diuntungkan).\n\nKonteks:\n${ctx}`,
    closing: `${role} Tulis "Penutup" (2 paragraf persuasif) yang diakhiri ajakan sesuai CTA: ${s.cta || 'Daftarkan segera.'}\n\nKonteks:\n${ctx}`,
    requirements: `${role} Tulis "Persyaratan Peserta" dalam 4-6 poin. Awali tiap poin dengan "• ".\n\nKonteks:\n${ctx}`
  };
  return instructs[cfg.promptKey] || instructs.background;
}

async function callAi(cfg, messages) {
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
    body: JSON.stringify({ model: cfg.model, messages, temperature: 0.7 })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`${r.status} ${t.slice(0, 120)}`);
  }
  const data = await r.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function generateAi(cfg) {
  const state = Store.get('pg_proposal', {});
  if (!state.companyName || !state.proposalTitle) {
    toast('Lengkapi Info Penting (Step 2) dulu', 'error'); return;
  }
  const ai = Store.get('pg_ai', {});
  if (!ai.apiKey) {
    toast('Atur API Key dulu di Pengaturan AI', 'error');
    showStep('settings'); return;
  }
  const btn = document.querySelector(`[data-target="${cfg.id}"]`);
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Generating...</span>';
  try {
    const text = await callAi(ai, [
      { role: 'system', content: buildPromptFor(cfg) },
      { role: 'user', content: 'Hasilkan sekarang.' }
    ]);
    const ta = document.getElementById(cfg.id);
    if (ta) { ta.value = text; saveProposalState(); }
    toast(`${cfg.label} dibuat`, 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
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
    body: {
      background: s.background || '',
      description: s.description || '',
      objectives: s.objectives || '',
      audience: s.audience || '',
      requirements: s.requirements || '',
      closing: s.closing || ''
    }
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

// ---------- Proposal HTML Renderer ----------
function renderProposalHTML(data, opts = {}) {
  const tpl = data.template;
  const pdf = opts.cssMode === 'pdf';
  const dateRange = fmtDateRange(data.startDate, data.endDate);
  const facilityIcon = (i) => ['🎓','📚','🍽️','🏨','💻','💬','🏆','📜','✈️','🎯'][i % 10];

  const toc = [
    ['01','Latar Belakang'],
    ['02','Deskripsi Pelatihan'],
    ['03','Tujuan'],
    ['04','Peserta'],
    ['05','Persyaratan Peserta'],
    ['06','Jadwal Pelaksanaan'],
    ['07','Investasi'],
    ['08','Fasilitas'],
    ['09','Penutup']
  ];

  const sectionsHTML = [
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
  `).join('');

  // Schedule table (6)
  const scheduleSection = `
    <section class="section-block">
      <div class="section-num">06</div>
      <div class="section-content">
        <h2 class="section-title">Jadwal Pelaksanaan</h2>
        ${dateRange ? `<p class="section-body"><strong>Tanggal:</strong> ${escapeHtml(dateRange)}</p>` : ''}
        ${data.venue ? `<p class="section-body"><strong>Lokasi:</strong> ${escapeHtml(data.venue)}</p>` : ''}
        <table class="proposal-table schedule-table">
          <thead><tr><th style="width:35%">Waktu</th><th>Agenda</th></tr></thead>
          <tbody>
            <tr><td>Hari 1</td><td>Pembukaan, pengenalan materi, sesi inti 1 & 2</td></tr>
            <tr><td>Hari 2</td><td>Sesi inti 3, latihan terapan, diskusi kelompok</td></tr>
            <tr><td>Hari 3</td><td>Studi kasus, presentasi, uji kompetensi, penutupan</td></tr>
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

  // Closing (9)
  const closingSection = `
    <section class="section-block">
      <div class="section-num">09</div>
      <div class="section-content">
        <h2 class="section-title">Penutup</h2>
        <p class="section-body">${nl2br(data.body.closing || '—')}</p>
        ${data.cta ? `<div class="cta-box"><strong>${escapeHtml(data.cta)}</strong></div>` : ''}
      </div>
    </section>
  `;

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

      <!-- TABLE OF CONTENTS PAGE -->
      <section class="proposal-page toc-page${pdf ? ' page-pdf' : ''}">
        <div class="page-header">
          <div class="page-eyebrow">Daftar Isi</div>
          <h2 class="page-title">Table of Contents</h2>
        </div>
        <ul class="toc-list">
          ${toc.map(([n, t]) => `
            <li class="toc-item">
              <span class="toc-num">${n}</span>
              <span class="toc-label">${escapeHtml(t)}</span>
              <span class="toc-dots"></span>
              <span class="toc-page">${pdf ? '' : ''}</span>
            </li>
          `).join('')}
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
    '01 Latar Belakang',
    '02 Deskripsi Pelatihan',
    '03 Tujuan',
    '04 Peserta',
    '05 Persyaratan Peserta',
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
        new TextRun({ text: num + '   ', bold: true, size: 28, color: COL_PRIMARY, font: fonts.heading }),
        new TextRun({ text: title, size: 24, color: '0F172A' }),
        new TextRun({ text: '\t' + String(i + 2).padStart(2, '0'), size: 24, bold: true, color: '64748B' })
      ],
      spacing: { after: 200 }
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
      ...[
        ['Hari 1', 'Pembukaan, pengenalan materi, sesi inti 1 & 2'],
        ['Hari 2', 'Sesi inti 3, latihan terapan, diskusi kelompok'],
        ['Hari 3', 'Studi kasus, presentasi, uji kompetensi, penutupan']
      ].map(([a, b]) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a, bold: true, size: 22 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b, size: 22 })] })] })
          ]
        })
      )
    ]
  });

  // Build document
  const children = [
    ...coverBlocks,
    new Paragraph({ children: [new PageBreak()] }),

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
    ...sectionContent('03', 'Tujuan', data.body.objectives, parseBullets(data.body.objectives)),
    ...sectionContent('04', 'Peserta', data.body.audience),
    ...sectionContent('05', 'Persyaratan Peserta', data.body.requirements, parseBullets(data.body.requirements), true),

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
    ...(data.cta ? [new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: COL_PRIMARY, color: 'auto' },
      children: [new TextRun({ text: data.cta, bold: true, color: 'FFFFFF', size: 26 })],
      spacing: { before: 200, after: 200 },
      indent: { left: 280, right: 280 }
    })] : [])
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

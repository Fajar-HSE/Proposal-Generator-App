(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[],t=null;function n(n={}){t=n.dsn||null,window.addEventListener(`error`,e=>r(e.error||e.message)),window.addEventListener(`unhandledrejection`,e=>r(e.reason));let i=console.error;console.error=(...t)=>{e.push({message:t.map(String).join(` `),level:`error`,timestamp:Date.now()}),e.length>20&&e.shift(),i(...t)},console.info(t?`[monitoring] Sentry enabled`:`[monitoring] Running in stub mode (set VITE_SENTRY_DSN to enable Sentry)`)}function r(n){let r=n instanceof Error?n.message:String(n),i=n instanceof Error?n.stack:void 0;e.push({message:r,level:`error`,timestamp:Date.now()}),t?fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({message:r,stack:i,breadcrumbs:e,timestamp:new Date().toISOString()})}).catch(()=>{}):console.warn(`[monitoring:capture]`,r,i)}var i={set(e,t){localStorage.setItem(e,JSON.stringify(t))},get(e,t){try{return JSON.parse(localStorage.getItem(e))??t}catch{return t}}};function a(e,t=``){let n=document.getElementById(`toast`);n.textContent=e,n.className=`toast show `+t,setTimeout(()=>n.classList.remove(`show`),3e3)}firebase.apps.length||firebase.initializeApp({apiKey:`AIzaSyCe9rZzhE5t6bUgZTURiI6x2Y2ZvBlt_co`,authDomain:`proposal-generator-c6bc8.firebaseapp.com`,projectId:`proposal-generator-c6bc8`,storageBucket:`proposal-generator-c6bc8.firebasestorage.app`,messagingSenderId:`805030576451`,appId:`1:805030576451:web:906302f39cae18f5736ff6`});var o=firebase.auth();o.setPersistence(firebase.auth.Auth.Persistence.LOCAL);var s=null;function c(e){document.querySelectorAll(`.tab-btn`).forEach(t=>t.classList.toggle(`active`,t.dataset.tab===e)),document.getElementById(`registerFields`).style.display=e===`register`?`flex`:`none`,document.getElementById(`registerFields`).style.flexDirection=`column`,document.getElementById(`registerFields`).style.gap=`6px`,document.getElementById(`registerFields`).style.marginBottom=`16px`,document.getElementById(`passwordHint`).style.display=e===`register`?`block`:`none`,document.querySelector(`#authForm button[type="submit"] span`).textContent=e===`register`?`Daftar`:`Masuk`}document.querySelectorAll(`.tab-btn`).forEach(e=>e.addEventListener(`click`,()=>c(e.dataset.tab)));function l(e){return{"auth/invalid-email":`Format email tidak valid.`,"auth/user-disabled":`Akun ini telah dinonaktifkan.`,"auth/user-not-found":`Email belum terdaftar.`,"auth/wrong-password":`Kata sandi salah.`,"auth/invalid-credential":`Email atau kata sandi salah.`,"auth/invalid-login-credentials":`Email atau kata sandi salah.`,"auth/email-already-in-use":`Email sudah terdaftar. Silakan masuk.`,"auth/weak-password":`Kata sandi terlalu lemah (minimal 6 karakter).`,"auth/operation-not-allowed":`Metode login belum diaktifkan. Hubungi admin.`,"auth/too-many-requests":`Terlalu banyak percobaan. Coba lagi nanti.`,"auth/popup-closed-by-user":`Popup ditutup sebelum selesai.`,"auth/popup-blocked":`Popup diblokir browser. Izinkan popup untuk login Google.`,"auth/network-request-failed":`Koneksi internet bermasalah.`,"auth/cancelled-popup-request":`Login dibatalkan.`,"auth/account-exists-with-different-credential":`Email sudah terdaftar dengan metode login lain.`}[e]||`Error: ${e}`}document.getElementById(`authForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`authEmail`).value.trim(),n=document.getElementById(`authPassword`).value;if(!t||!n){a(`Lengkapi email dan kata sandi`,`error`);return}let r=document.getElementById(`authName`),i=r&&r.offsetParent!==null?r.value.trim():``,s=document.querySelector(`.tab-btn.active`).dataset.tab===`register`,c=e.target.querySelector(`button[type="submit"]`),u=c.querySelector(`span`).textContent;c.disabled=!0,c.querySelector(`span`).textContent=s?`⏳ Mendaftar...`:`⏳ Masuk...`;try{if(s){if(n.length<6)throw a(`Kata sandi minimal 6 karakter`,`error`),{code:`auth/weak-password`};let e=await o.createUserWithEmailAndPassword(t,n);i&&await e.user.updateProfile({displayName:i}),a(`Akun berhasil dibuat!`,`success`)}else await o.signInWithEmailAndPassword(t,n),a(`Login berhasil`,`success`)}catch(e){console.error(e),a(l(e.code||`auth/unknown`),`error`)}finally{c.disabled=!1,c.querySelector(`span`).textContent=u}}),document.getElementById(`googleSignInBtn`).addEventListener(`click`,async()=>{let e=document.getElementById(`googleSignInBtn`),t=e.querySelector(`span`).textContent;e.disabled=!0,e.querySelector(`span`).textContent=`⏳ Membuka popup Google...`;try{let e=new firebase.auth.GoogleAuthProvider;e.setCustomParameters({prompt:`select_account`}),await o.signInWithPopup(e),a(`Login dengan Google berhasil`,`success`)}catch(e){console.error(e),a(l(e.code||`auth/unknown`),`error`)}finally{e.disabled=!1,e.querySelector(`span`).textContent=t}});function u(e){if(!e)return null;let t=e.email,n=e.displayName||e.providerData?.[0]?.displayName||(t?t.split(`@`)[0]:``);return{uid:e.uid,name:n,email:t||``,photoURL:e.photoURL||e.providerData?.[0]?.photoURL||null,provider:e.providerData?.[0]?.providerId||`firebase`}}function d(){if(!s||!s.email){a(`Login ditolak: email wajib tersedia`,`error`),o.signOut().catch(()=>{});return}i.set(`pg_user`,s),document.getElementById(`authScreen`).classList.remove(`active`),document.getElementById(`appScreen`).classList.add(`active`),document.getElementById(`userName`).textContent=s.name,document.getElementById(`userEmail`).textContent=s.email,document.getElementById(`userAvatar`).textContent=(s.name||`?`)[0].toUpperCase(),D(),W(),z();let e=document.getElementById(`saveDraftBtn`),t=document.getElementById(`draftNameInput`);e&&e.addEventListener(`click`,()=>N()),t&&t.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),N())});let n=document.getElementById(`draftsList`);n&&n.addEventListener(`click`,e=>{let t=e.target.closest(`[data-act]`);if(!t)return;let n=t.closest(`.draft-row`);if(!n)return;let r=n.dataset.id,i=t.dataset.act;i===`load`?P(r):i===`rename`?F(r):i===`delete`&&ne(r)}),b(f)}document.getElementById(`logoutBtn`).addEventListener(`click`,async()=>{try{await o.signOut()}catch(e){console.warn(`Firebase signOut error:`,e)}i.set(`pg_user`,null),location.reload()}),o.onAuthStateChanged(e=>{let t=new URLSearchParams(location.search);if(!e){t.has(`demo`)&&(s={uid:`demo`,name:`Ahmad Fauzi`,email:`ahmad@team.id`,photoURL:null,provider:`demo`},d(),t.has(`sample`)&&(i.set(`pg_proposal`,{template:`modern`,companyName:`PT Maju Bersama Sentosa`,organizerName:`Lembaga Pelatihan Nusantara`,proposalTitle:`Pelatihan Digital Marketing Strategis untuk UMKM`,competencyUnit:`M.731000.001.01 - Mengelola Kampanye Digital`,cta:`Daftarkan tim Anda hari ini dan dapatkan diskon 15%.`,startDate:`2026-09-15`,endDate:`2026-09-17`,venue:`Hotel Grand Hyatt Jakarta`,pricePerPerson:`Rp 2.500.000`,minParticipants:`10`,priceNotes:`Termasuk makan siang, sertifikat, dan modul.`,facilities:[`Sertifikat kelulusan`,`Modul hardcopy & softcopy`,`Makan siang & coffee break`,`Penginapan hotel`,`Konsultasi pascapelatihan`],background:`Di era transformasi digital yang semakin pesat, UMKM dituntut untuk memiliki kemampuan pemasaran yang adaptif dan terukur. Sayangnya, banyak pelaku UMKM masih mengandalkan metode konvensional dan belum mengoptimalkan kanal digital untuk pertumbuhan bisnis mereka. Pelatihan ini menjadi kebutuhan strategis untuk menjawab tantangan tersebut.`,description:`Pelatihan ini dirancang secara komprehensif selama 3 hari untuk memberikan pemahaman mendalam tentang digital marketing. Peserta akan belajar strategi SEO, social media marketing, content marketing, hingga Paid Ads. Setiap sesi dilengkapi dengan studi kasus nyata dan latihan praktis yang dapat langsung diterapkan di bisnis masing-masing.`,objectives:`Meningkatkan pemahaman peserta tentang digital marketing secara holistik
Mampu menyusun strategi digital marketing yang terukur
Mampu mengelola kampanye SEO dan SEM secara mandiri
Mampu menganalisis performa kampanye melalui data analytics
Mampu mengkonversi leads menjadi pelanggan setia`,audience:`Pelatihan ini ditujukan untuk pemilik usaha, marketing manager, dan staf pemasaran di perusahaan UMKM. Disarankan peserta memiliki basic komputer dan akses internet untuk latihan langsung. Peserta dari berbagai industri akan saling berbagi pengalaman dan memperluas jejaring.`,requirements:`Memiliki laptop pribadi dengan koneksi internet
Pengetahuan dasar media sosial
Bersedia mengikuti seluruh sesi hingga akhir
Membawa studi kasus bisnis sendiri untuk latihan`,closing:`Kami mengundang Anda untuk bergabung dalam pelatihan transformatif ini. Investasi waktu dan biaya yang Anda keluarkan akan menghasilkan kemampuan digital marketing yang dapat langsung diterapkan untuk mengakselerasi pertumbuhan bisnis Anda. Mari bersama-sama membangun UMKM Indonesia yang lebih tangguh di era digital.`}),D(),setTimeout(()=>{b(`settings`),setTimeout(()=>document.getElementById(`generateBtn`)?.click(),300)},300)));return}s=u(e),d()});var f=1,p={1:`Pilih Template Design`,2:`Informasi Penting`,3:`Brief Klien (Konteks Bisnis)`,4:`Latar Belakang`,5:`Deskripsi`,6:`Tujuan`,7:`Peserta & Persyaratan`,8:`Materi Pelatihan`,9:`Jadwal Pelatihan & Uji`,10:`Biaya`,11:`Fasilitas`,12:`Penutup & Generate`,settings:`Pengaturan AI & Draft`},m={4:{id:`background`,label:`Latar Belakang`,promptKey:`background`,framework:`IIIP`},5:{id:`description`,label:`Deskripsi`,promptKey:`description`,framework:`FAB`},6:{id:`objectives`,label:`Tujuan`,promptKey:`objectives`,framework:`FAB`},12:{id:`closing`,label:`Penutup`,promptKey:`closing`,framework:`ASSUMPTIVE_CLOSE`}},h={IIIP:`Gunakan struktur **Issue → Impact → Implication → Payoff**: (1) Issue = masalah aktual yang klien hadapi hari ini; (2) Impact = konsekuensi kuantitatif dari masalah tersebut; (3) Implication = risiko jika dibiarkan; (4) Payoff = bagaimana pelatihan ini mengubah status quo.`,FAB:`Gunakan kerangka **Feature → Advantage → Benefit** untuk setiap poin: Fitur konkret materi/metode, Keunggulan dibanding alternatif, Manfaat terukur yang dirasakan klien.`,PERSONA:`Gunakan kerangka **Persona → Pains → Gains → Channels**: deskripsikan profil ideal peserta, apa yang mereka keluhkan hari ini, apa yang mereka ingin capai, dan bagaimana pelatihan ini menjangkau mereka.`,CHECKLIST:`Setiap poin harus **dapat diverifikasi** oleh panitia (laptop, sertifikat, presensi, pre-test, dsb). Hindari poin generik seperti "bersedia belajar".`,ASSUMPTIVE_CLOSE:`Gunakan **assumptive close**: asumsikan klien akan lanjut, sebutkan **deadline konfirmasi**, **masa berlaku penawaran**, **satu aksi spesifik** yang klien lakukan berikutnya, plus **dua kontak** (penjualan & admin). Hindari "silakan hubungi kami jika berminat".`,OUTLINE:`Hasilkan **KURIKULUM TERSTRUKTUR** dalam JSON array (6-10 sesi). Tiap sesi: { "title", "duration" (mis. "2 jam" atau "90 menit"), "method" (salah satu: Ceramah, Diskusi, Studi Kasus, Latihan/Praktik, Workshop, e-Learning, Coaching), "description" (2-3 kalimat: sub-topik spesifik + output/artefak yang didapat peserta) }. Urutan harus logis: fondasi → pendalaman → studi kasus → implementasi.Industri klien wajib dimasukkan ke deskripsi agar kurikulum terasa relevan.`},g=[`dalam era digital`,`tidak dapat dipungkiri`,`semoga bermanfaat`,`semoga proposal ini`,`kami berharap`,`silakan menghubungi kami`,`tidak ada salahnya`,`saat ini kita berada di`,`di era yang serba digital`,`revolusi industri 4.0`,`akan meningkatkan sebesar`,`terbukti meningkatkan`,`dijamin`,`pasti akan`,`transformasi digital`,`solusi terdepan`,`best-in-class`,`world-class`,`cutting-edge`],_=`ATURAN ANTI-HALUSINASI (WAJIB):
1. DATA DARI USER = fakta yang boleh dinyatakan sebagai fakta.
2. INFERENCE = WAJIB pakai hedging: "berpotensi", "dapat membantu", "dirancang untuk mendukung", "diperkirakan", "perlu diukur berdasarkan baseline".
3. RECOMMENDATION = usulan, bukan klaim kondisi aktual perusahaan.
4. JANGAN mengarang masalah klien. Jika user tidak beri data masalah, tulis kebutuhan netral, jangan klaim "Perusahaan Anda bermasalah...".
5. JANGAN klaim angka spesifik tanpa baseline. Contoh benar: "Program dirancang untuk mendukung peningkatan efisiensi energi melalui standardisasi praktik HVAC. Besaran dampak aktual perlu diukur berdasarkan baseline konsumsi dan kondisi aset di lokasi." BUKAN "akan meningkatkan 15%".
6. Kurangi marketing jargon. Bahasa lugas, evidence-based.`;function v(){return 12}function y(e){if(e===`settings`){document.getElementById(`progressFill`).style.width=`100%`,document.getElementById(`progressText`).textContent=`✓`,document.getElementById(`stepMeta`).textContent=`Langkah terakhir`;return}let t=Number(e),n=v(),r=t/n*100;document.getElementById(`progressFill`).style.width=r+`%`,document.getElementById(`progressText`).textContent=`${t}/${n}`,document.getElementById(`stepMeta`).textContent=`Langkah ${t} dari ${n}`}function b(e){f=e,document.getElementById(`stepTitle`).textContent=p[e]||``,document.querySelectorAll(`.step`).forEach(e=>e.style.display=`none`);let t=document.querySelector(`.step[data-step="${e}"]`);t&&(t.style.display=`block`);let n=Number(e);document.querySelectorAll(`.step-chip`).forEach(t=>{let r=Number(t.dataset.step);Number.isNaN(r)?t.dataset.step===String(e)&&t.classList.add(`active`):(t.classList.toggle(`active`,r===n),t.classList.toggle(`completed`,!Number.isNaN(n)&&r<n))});let r=document.querySelector(`.step-chip.active`);r&&r.scrollIntoView({behavior:`smooth`,block:`nearest`,inline:`center`}),m[e]&&x(e),String(e)===`8`&&(se(),V()),document.getElementById(`prevBtn`).style.display=e===`settings`?`none`:``,document.getElementById(`nextBtn`).style.display=e===`settings`?`none`:``,y(e),E()}document.querySelectorAll(`.step-chip`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.dataset.step;n&&b(n)})}),document.getElementById(`settingsBtn`)?.addEventListener(`click`,()=>{b(`settings`)}),document.getElementById(`prevBtn`).addEventListener(`click`,()=>{if(f===`settings`)return;let e=Number(f);e>1&&b(e-1)}),document.getElementById(`nextBtn`).addEventListener(`click`,()=>{if(f===`settings`)return;let e=Number(f);if(e===2){for(let e of[`companyName`,`organizerName`,`proposalTitle`])if(!document.getElementById(e).value.trim()){a(`Lengkapi field wajib di langkah ini`,`error`);return}}if(e<v())b(e+1);else{let e=q();if(!e.title||e.title===`Proposal Pelatihan`){a(`Isi Judul Proposal dulu (Step 2)`,`error`),b(2);return}ke()}}),document.querySelectorAll(`.template-card`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.template-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`);let t=e.querySelector(`input`);t&&(t.checked=!0),E()})}),[`companyName`,`organizerName`,`proposalTitle`,`cta`,`cta2`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,E)}),[`venue`,`pricePerPerson`,`minParticipants`,`minParticipants2`,`priceNotes`,`trainingStartDate`,`trainingEndDate`,`trainingStartTime`,`trainingEndTime`,`examStartDate`,`examEndDate`,`examStartTime`,`examEndTime`,`audienceCount`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,E),t&&t.addEventListener(`change`,E)}),document.getElementById(`facilities`).addEventListener(`change`,E);function x(e){let t=m[e],n=document.querySelector(`.step[data-step="${e}"]`);if(!n||n.dataset.built===`1`||n.dataset.manual===`1`)return;n.innerHTML=`
    <div class="step-hero">
      <span class="step-pill">${t.label}</span>
      <h1>${t.label}</h1>
      <p>AI menggunakan <strong>2 tahap</strong>: riset dulu, baru tulis. Hasil riset ditampilkan di panel di bawah — Anda bisa koreksi fakta sebelum AI menulis.</p>
      <p class="framework-hint">Framework: <em>${t.framework}</em></p>
    </div>
    <div class="form-card">
      <div class="ai-toolbar">
        <button class="btn btn-ai ai-suggest" data-target="${t.id}" data-action="chain">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z"/></svg>
          <span>Generate dengan AI</span>
        </button>
        <button class="btn btn-ghost btn-regen" data-target="${t.id}" data-action="rewrite" title="Tulis ulang pakai riset terakhir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span>Ulangi</span>
        </button>
        <button class="btn btn-ghost btn-research" data-target="${t.id}" data-action="research" title="Riset ulang dari awal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Riset ulang</span>
        </button>
      </div>

      <details class="insights-panel" data-target="${t.id}">
        <summary>
          <span class="insights-summary-icon">💡</span>
          <span class="insights-summary-label">Riset AI (klik untuk lihat)</span>
          <span class="insights-summary-empty">— belum ada —</span>
        </summary>
        <div class="insights-body"><em>Hasil riset akan muncul di sini setelah klik "Generate dengan AI".</em></div>
      </details>

      <div class="field-group">
        <label for="${t.id}">${t.label}</label>
        <textarea id="${t.id}" class="textarea tall" placeholder="Klik 'Generate dengan AI' atau tulis manual..."></textarea>
      </div>
    </div>
  `,n.dataset.built=`1`,document.getElementById(t.id).addEventListener(`input`,E);let r=n.querySelector(`[data-action="chain"]`),a=n.querySelector(`[data-action="rewrite"]`),o=n.querySelector(`[data-action="research"]`);r.addEventListener(`click`,()=>K(t,{mode:`chain`})),a.addEventListener(`click`,()=>K(t,{mode:`rewrite`})),o.addEventListener(`click`,()=>K(t,{mode:`research`}));let s=i.get(`pg_proposal`,{});s[t.id]&&(document.getElementById(t.id).value=s[t.id]);let c=i.get(`pg_insights_${t.id}`,null);c&&S(t.id,c)}function S(e,t){let n=document.querySelector(`details.insights-panel[data-target="${e}"]`);if(!n)return;if(!t||!t.headline&&!Array.isArray(t.differentiators)){n.querySelector(`.insights-body`).innerHTML=`<em>(kosong)</em>`,n.querySelector(`.insights-summary-empty`).textContent=`— belum ada —`;return}let r=[];t.headline&&r.push(`<div class="ins-block"><div class="ins-label">Headline</div><div class="ins-val">${L(t.headline)}</div></div>`),Array.isArray(t.hooks)&&t.hooks.length&&r.push(`<div class="ins-block"><div class="ins-label">Opening Hooks</div><ul>${t.hooks.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),Array.isArray(t.differentiators)&&t.differentiators.length&&r.push(`<div class="ins-block"><div class="ins-label">Pembeda</div><ul>${t.differentiators.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),Array.isArray(t.outcomes)&&t.outcomes.length&&r.push(`<div class="ins-block"><div class="ins-label">Outcomes (terukur)</div><ul>${t.outcomes.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),Array.isArray(t.proofPoints)&&t.proofPoints.length&&r.push(`<div class="ins-block"><div class="ins-label">Bukti Sosial</div><ul>${t.proofPoints.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),Array.isArray(t.objections)&&t.objections.length&&r.push(`<div class="ins-block"><div class="ins-label">Antisipasi Keraguan</div><ul>${t.objections.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),t.ctaProposal&&r.push(`<div class="ins-block"><div class="ins-label">CTA yang Disarankan</div><div class="ins-val">${L(t.ctaProposal)}</div></div>`),Array.isArray(t.personas)&&t.personas.length&&r.push(`<div class="ins-block"><div class="ins-label">Persona Peserta</div><ul>${t.personas.map(e=>`<li>${L(e)}</li>`).join(``)}</ul></div>`),n.querySelector(`.insights-body`).innerHTML=r.join(``),n.querySelector(`.insights-summary-empty`).textContent=`— ${Object.keys(t).filter(e=>Array.isArray(t[e])?t[e].length:!!t[e]).length} poin riset —`}var C=document.getElementById(`requirements`);C&&C.addEventListener(`input`,E),document.querySelector(`[data-target="requirements"][data-action="chain"]`)?.addEventListener(`click`,()=>K({id:`requirements`,label:`Persyaratan Peserta`,promptKey:`requirements`,framework:`CHECKLIST`},{mode:`chain`})),document.querySelector(`[data-target="closing"][data-action="chain"]`)?.addEventListener(`click`,()=>K(m[12],{mode:`chain`})),[`audience`,`closing`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,E)});var w=[`clientIndustry`,`companySize`,`topPainPoints`,`businessGoals`,`budgetRange`,`decisionTimeline`,`decisionMakers`],T=!1;function E(){if(!T)return;let e=i.get(`pg_proposal`,{}),t=document.querySelector(`.template-card.selected`);e.template=t?t.dataset.template:e.template||`classic`,[`companyName`,`organizerName`,`proposalTitle`,`cta`,`venue`,`pricePerPerson`,`minParticipants`,`priceNotes`].forEach(t=>{let n=document.getElementById(t);n?e[t]=n.value:t===`cta`&&document.getElementById(`cta2`)&&(e[t]=document.getElementById(`cta2`).value)});let n=document.getElementById(`cta`),r=document.getElementById(`cta2`);n&&r&&(r.value?e.cta=r.value:n.value&&(e.cta=n.value)),e.competencyUnits=De(),e.competencyUnit=e.competencyUnits[0]||``,[`trainingStartDate`,`trainingEndDate`,`trainingStartTime`,`trainingEndTime`,`examStartDate`,`examEndDate`,`examStartTime`,`examEndTime`].forEach(t=>{let n=document.getElementById(t);e[t]=n?n.value:e[t]||``}),e.trainingStartDate&&(e.startDate=e.trainingStartDate),e.trainingEndDate&&(e.endDate=e.trainingEndDate),[`audienceCount`].forEach(t=>{let n=document.getElementById(t);e[t]=n?n.value:e[t]||``});let a=document.getElementById(`minParticipants`),o=document.getElementById(`minParticipants2`);a&&o&&(e.minParticipants=a.value||o.value||``),w.forEach(t=>{let n=document.getElementById(t);e[t]=n?n.value:e[t]||``}),[`background`,`description`,`objectives`,`audience`,`closing`].forEach(t=>{let n=document.getElementById(t);e[t]=n?n.value:e[t]||``});let s=document.getElementById(`requirements`);e.requirements=s?s.value:e.requirements||``,e.facilities=Array.from(document.querySelectorAll(`#facilities input:checked`)).map(e=>e.value),e.materials=ae(),i.set(`pg_proposal`,e)}function D(){let e=i.get(`pg_proposal`,{});document.querySelectorAll(`.template-card`).forEach(t=>{let n=t.dataset.template===e.template;t.classList.toggle(`selected`,n);let r=t.querySelector(`input`);r&&(r.checked=n)}),[`companyName`,`organizerName`,`proposalTitle`,`cta`,`venue`,`pricePerPerson`,`minParticipants`,`priceNotes`].forEach(t=>{let n=document.getElementById(t);n&&e[t]&&(n.value=e[t])});let t=document.getElementById(`cta2`);if(t&&e.cta&&(t.value=e.cta),e.organizerLogo&&$(e.organizerLogo),Array.isArray(e.competencyUnits)&&e.competencyUnits.length?Q(e.competencyUnits):e.competencyUnit?Q([e.competencyUnit]):(Q([]),Oe()),[`trainingStartDate`,`trainingEndDate`,`trainingStartTime`,`trainingEndTime`,`examStartDate`,`examEndDate`,`examStartTime`,`examEndTime`].forEach(t=>{let n=document.getElementById(t);n&&e[t]&&(n.value=e[t])}),!e.trainingStartDate&&e.startDate){let t=document.getElementById(`trainingStartDate`);t&&(t.value=e.startDate)}if(!e.trainingEndDate&&e.endDate){let t=document.getElementById(`trainingEndDate`);t&&(t.value=e.endDate)}[`audienceCount`].forEach(t=>{let n=document.getElementById(t);n&&e[t]&&(n.value=e[t])});let n=document.getElementById(`minParticipants2`);if(n&&e.minParticipants&&(n.value=e.minParticipants),w.forEach(t=>{let n=document.getElementById(t);n&&e[t]&&(n.value=e[t])}),[`background`,`description`,`objectives`,`audience`,`closing`].forEach(t=>{let n=document.getElementById(t);n&&e[t]&&(n.value=e[t])}),e.facilities&&document.querySelectorAll(`#facilities input`).forEach(t=>t.checked=e.facilities.includes(t.value)),e.requirements){let t=document.getElementById(`requirements`);t&&(t.value=e.requirements)}Array.isArray(e.materials)&&B(e.materials),T=!0}var O=`pg_drafts`,k=`pg_drafts_meta`,A={list(){return i.get(k,[])},saveMeta(e){i.set(k,e)},getPayload(e){return i.get(O,{})[e]||null},setPayload(e,t){let n=i.get(O,{});n[e]=t,i.set(O,n)},remove(e){let t=i.get(O,{});delete t[e],i.set(O,t);let n=A.list().filter(t=>t.id!==e);A.saveMeta(n)},storageSize(){let e=i.get(O,{}),t=A.list();return JSON.stringify(e).length+JSON.stringify(t).length}};function ee(){return`d_`+Date.now().toString(36)+`_`+Math.random().toString(36).slice(2,8)}function j(){let e=document.querySelector(`.template-card.selected`),t={};t.template=e?e.dataset.template:`classic`,[`companyName`,`organizerName`,`proposalTitle`,`competencyUnit`,`cta`,`startDate`,`endDate`,`venue`,`pricePerPerson`,`minParticipants`,`priceNotes`].forEach(e=>{let n=document.getElementById(e);t[e]=n?n.value:``}),w.forEach(e=>{let n=document.getElementById(e);t[e]=n?n.value:``}),[`background`,`description`,`objectives`,`audience`,`closing`].forEach(e=>{let n=document.getElementById(e);t[e]=n?n.value:``});let n=document.getElementById(`requirements`);return t.requirements=n?n.value:``,t.facilities=Array.from(document.querySelectorAll(`#facilities input:checked`)).map(e=>e.value),t.materials=ae(),t}function M(e,t){A.setPayload(e.id,t);let n=A.list(),r=n.findIndex(t=>t.id===e.id);r>=0?n[r]=e:n.unshift(e),A.saveMeta(n)}async function N(e){let t=document.getElementById(`draftNameInput`),n=(e??(t?t.value:``)).trim();if(!n){a(`Nama draft wajib diisi`,`error`),t&&t.focus();return}n.length>80&&(n=n.slice(0,80));let r=A.list().find(e=>e.name.toLowerCase()===n.toLowerCase());if(r){if(!await R({title:`Timpa Draft?`,message:`Draft dengan nama "${r.name}" sudah ada. Timpa dengan data saat ini?`,okText:`Timpa`}))return;let e=j();M({id:r.id,name:r.name,updatedAt:new Date().toISOString()},e),a(`Draft "${r.name}" diperbarui`,`success`)}else{let e=ee(),t=j();M({id:e,name:n,updatedAt:new Date().toISOString()},t),a(`Draft "${n}" disimpan`,`success`)}t&&(t.value=``),z()}function te(e){if(e){if(document.querySelectorAll(`.template-card`).forEach(t=>{let n=t.dataset.template===e.template;t.classList.toggle(`selected`,n);let r=t.querySelector(`input`);r&&(r.checked=n)}),[`companyName`,`organizerName`,`proposalTitle`,`competencyUnit`,`cta`,`startDate`,`endDate`,`venue`,`pricePerPerson`,`minParticipants`,`priceNotes`].forEach(t=>{let n=document.getElementById(t);n&&e[t]!=null&&(n.value=e[t])}),w.forEach(t=>{let n=document.getElementById(t);n&&e[t]!=null&&(n.value=e[t])}),[`background`,`description`,`objectives`,`audience`,`closing`].forEach(t=>{let n=document.getElementById(t);n&&e[t]!=null&&(n.value=e[t])}),e.requirements!=null){let t=document.getElementById(`requirements`);t&&(t.value=e.requirements)}Array.isArray(e.facilities)&&document.querySelectorAll(`#facilities input`).forEach(t=>{t.checked=e.facilities.includes(t.value)}),Array.isArray(e.materials)?B(e.materials):B([])}}async function P(e){let t=A.getPayload(e);if(!t){a(`Draft tidak ditemukan`,`error`);return}te(t),E();let n=A.list().find(t=>t.id===e),r=document.getElementById(`draftNameInput`);r&&n&&(r.value=n.name),a(`Draft "${n?n.name:``}" dimuat`,`success`)}async function ne(e){let t=A.list().find(t=>t.id===e);await R({title:`Hapus Draft?`,message:`Draft "${t?t.name:``}" akan dihapus permanen dari browser.`,okText:`Hapus`})&&(A.remove(e),a(`Draft dihapus`,`success`),z())}async function F(e){let t=A.list().find(t=>t.id===e);if(!t)return;let n=(prompt(`Nama baru untuk draft ini:`,t.name)||``).trim();if(!n||n===t.name)return;let r=n.slice(0,80);if(A.list().find(t=>t.id!==e&&t.name.toLowerCase()===r.toLowerCase())){a(`Nama sudah dipakai draft lain`,`error`);return}let i={...t,name:r,updatedAt:new Date().toISOString()},o=A.list().map(t=>t.id===e?i:t);A.saveMeta(o),a(`Draft diubah namanya`,`success`),z()}function I(){let e=A.list().length,t=document.getElementById(`draftsStorageHint`),n=document.getElementById(`draftsCount`);n&&(n.textContent=`${e} draft tersimpan`),t&&(t.classList.remove(`warn`,`danger`),e>=80?(t.textContent=`penuh — hapus beberapa`,t.classList.add(`danger`)):e>=50?(t.textContent=`mulai banyak`,t.classList.add(`warn`)):t.textContent=e>0?`${(A.storageSize()/1024).toFixed(1)} KB`:``)}function L(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function re(e){if(!e)return``;let t=new Date(e).getTime();if(isNaN(t))return``;let n=Date.now()-t,r=Math.floor(n/6e4);if(r<1)return`baru saja`;if(r<60)return`${r} menit lalu`;let i=Math.floor(r/60);if(i<24)return`${i} jam lalu`;let a=Math.floor(i/24);return a<7?`${a} hari lalu`:new Date(e).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`})}function ie(){let e=document.getElementById(`draftsList`),t=document.getElementById(`draftsEmpty`),n=A.list();if(e){if(e.innerHTML=``,n.length===0){t&&(t.hidden=!1),I();return}t&&(t.hidden=!0),n.forEach(t=>{let n=A.getPayload(t.id)||{};[`companyName`,`proposalTitle`,`organizerName`].filter(e=>(n[e]||``).trim()).length;let r=n.companyName||n.proposalTitle||n.organizerName||`(kosong)`,i=document.createElement(`div`);i.className=`draft-row`,i.dataset.id=t.id,i.innerHTML=`
      <div class="draft-row-info">
        <div class="draft-row-name">${L(t.name)}</div>
        <div class="draft-row-meta">${L(r)} · ${re(t.updatedAt)}</div>
      </div>
      <div class="draft-row-actions">
        <button class="btn-icon primary" data-act="load" title="Muat draft" aria-label="Muat draft">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
        </button>
        <button class="btn-icon" data-act="rename" title="Ubah nama" aria-label="Ubah nama">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </button>
        <button class="btn-icon danger" data-act="delete" title="Hapus" aria-label="Hapus">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    `,e.appendChild(i)}),I()}}function R({title:e,message:t,okText:n=`Ya, lanjut`}){return new Promise(r=>{let i=document.getElementById(`confirmModal`),a=document.getElementById(`confirmTitle`),o=document.getElementById(`confirmMessage`),s=document.getElementById(`confirmOk`),c=document.getElementById(`confirmCancel`);if(!i)return r(!1);a.textContent=e,o.textContent=t,s.textContent=n,i.classList.add(`is-open`),i.setAttribute(`aria-hidden`,`false`);let l=e=>{i.classList.remove(`is-open`),i.setAttribute(`aria-hidden`,`true`),s.removeEventListener(`click`,u),c.removeEventListener(`click`,d),p.removeEventListener(`click`,d),document.removeEventListener(`keydown`,f),r(e)},u=()=>l(!0),d=()=>l(!1),f=e=>{e.key===`Escape`&&d()},p=i.querySelector(`.modal-backdrop`);s.addEventListener(`click`,u),c.addEventListener(`click`,d),p&&p.addEventListener(`click`,d),document.addEventListener(`keydown`,f)})}function z(){ie()}function ae(){return Array.from(document.querySelectorAll(`#materialsList .material-row`)).map((e,t)=>({no:t+1,title:(e.querySelector(`[data-fld="title"]`)?.value||``).trim(),description:(e.querySelector(`[data-fld="description"]`)?.value||``).trim()})).filter(e=>e.title||e.description)}function B(e){let t=document.getElementById(`materialsList`);t&&(t.innerHTML=``,e.forEach(e=>t.appendChild(oe(e))),V())}function oe(e){e||={title:``,description:``};let t=document.createElement(`div`);return t.className=`material-row`,t.innerHTML=`
    <input data-fld="title" type="text" class="input" placeholder="Topik materi (cth: Funnel Analysis)" value="${L(e.title||``)}" />
    <textarea data-fld="description" class="textarea" placeholder="Deskripsi singkat (opsional)">${L(e.description||``)}</textarea>
    <button type="button" class="btn-icon material-remove" title="Hapus baris">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `,t.querySelectorAll(`input, textarea, select`).forEach(e=>e.addEventListener(`input`,()=>{E(),V()})),t.querySelector(`.material-remove`).addEventListener(`click`,()=>{t.remove(),E(),V()}),t}function V(){let e=document.querySelectorAll(`#materialsList .material-row`).length,t=document.getElementById(`materialsCount`);t&&(t.textContent=`${e} materi`)}function se(){let e=document.getElementById(`materialsList`);!e||e.children.length>0||B([{no:1,title:`Pengantar & fondasi`,description:`Tujuan, landasan konseptual, dan kaitan dengan masalah bisnis klien saat ini.`},{no:2,title:`Topik inti 1`,description:`Diskusi interaktif, tanya jawab, dan latihan singkat.`},{no:3,title:`Studi kasus`,description:`Studi kasus relevan industri klien dan rekomendasi tindakan.`},{no:4,title:`Latihan terapan`,description:`Peserta latihan langsung menggunakan tools/framework yang dipelajari.`},{no:5,title:`Uji kompetensi & rencana aksi`,description:`Evaluasi individu serta rencana implementasi 30-60-90 hari.`}])}[`clientIndustry`,`companySize`,`topPainPoints`,`businessGoals`,`budgetRange`,`decisionTimeline`,`decisionMakers`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,E),t&&t.addEventListener(`change`,E)});function H(e=14){let t=new Date;return t.setDate(t.getDate()+e),t}function U(e){if(!e)return``;let t=e instanceof Date?e:new Date(e);return isNaN(t)?``:`${t.getDate()} ${J[t.getMonth()]} ${t.getFullYear()}`}function W(){let e=i.get(`pg_ai`,{provider:`openai`,model:`gpt-4o-mini`,baseUrl:``,apiKey:``});document.getElementById(`aiProvider`).value=e.provider,document.getElementById(`aiModel`).value=e.model,document.getElementById(`aiBaseUrl`).value=e.baseUrl||``,document.getElementById(`aiApiKey`).value=e.apiKey||``}W(),document.getElementById(`toggleKey`)?.addEventListener(`click`,()=>{let e=document.getElementById(`aiApiKey`);e.type=e.type===`password`?`text`:`password`}),document.getElementById(`addMaterialRowBtn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`materialsList`);e&&(e.appendChild(oe()),E(),V())}),document.getElementById(`generateMaterialsBtn`)?.addEventListener(`click`,async()=>{try{E()}catch{}let e=i.get(`pg_proposal`,{}),t=document.getElementById(`companyName`)?.value?.trim()||``,n=document.getElementById(`proposalTitle`)?.value?.trim()||``;if(t&&(e.companyName=t),n&&(e.proposalTitle=n),!e.companyName||!e.proposalTitle){a(`Lengkapi Info Penting dulu (Step 2)`,`error`);return}let r=i.get(`pg_ai`,{});if(!r.apiKey){a(`Atur API Key dulu di Pengaturan AI`,`error`),b(`settings`);return}let o=document.getElementById(`generateMaterialsBtn`),s=o.innerHTML;o.disabled=!0,o.innerHTML=`<span>⏳ Riset...</span>`;try{let t=Array.isArray(e.competencyUnits)&&e.competencyUnits.length?e.competencyUnits.join(`
- `):e.competencyUnit||`-`,n=t&&t!==`-`,i=`Tolong analisis konteks pelatihan ini lalu produksi JSON array "materials" berisi 6-8 topik materi.

Konteks lengkap untuk riset:
- Judul/topik pelatihan: ${e.proposalTitle}
- Penyelenggara: ${e.organizerName||`-`} | Logo: ${e.organizerLogo?`tersedia`:`-`}
- Industri klien: ${e.clientIndustry||`-`} | Ukuran: ${e.companySize||`-`}
- Pain points: ${e.topPainPoints||`-`}
- Target bisnis: ${e.businessGoals||`-`}
- Profil peserta: ${(e.audience||`-`).substring(0,400)}
- Jumlah peserta: ${e.audienceCount||e.minParticipants||`-`}
- Persyaratan: ${(e.requirements||`-`).substring(0,200)}
- Tujuan pembelajaran: ${(e.objectives||`-`).substring(0,300)}
- Unit Kompetensi (${n?`TERSEDIA - WAJIB JADI ACUAN UTAMA`:`TIDAK ADA - GUNAKAN JUDUL & PROFIL`}):
  ${n?`- `+t:`- (tidak ada unit, riset berdasarkan judul & tujuan)`}

INSTRUKSI RISET (WAJIB sebelum susun materi):
1. Jika Unit Kompetensi tersedia: lakukan reasoning terhadap kompetensi, elemen kompetensi, kebutuhan materi, konteks pekerjaan, dan referensi relevan. Jangan sekadar kembangkan teks dari nama unit. Relevankan setiap topik dengan kompetensi yang akan dicapai dan sesuaikan dengan profil peserta.
2. Jika Unit Kompetensi tidak tersedia: tetap riset dulu berdasarkan topik/judul, tujuan, profil peserta, kebutuhan kompetensi, konteks pekerjaan/industri, tingkat pemahaman peserta. Jangan random generation atau asumsi umum.
3. Setiap topik harus mempertimbangkan: judul/topik, unit kompetensi (jika ada), profil & karakteristik peserta, tujuan, kebutuhan kompetensi, konteks pekerjaan/industri, referensi relevan, tingkat pemahaman.

Setiap topik: { "title", "description" }. description 1-2 kalimat singkat: sub-topik spesifik + kaitan dengan peserta/kompetensi. Industri klien harus terasa di deskripsi.

Output HANYA JSON valid, tidak ada teks lain.`,o=null;try{let e=await G(r,[{role:`system`,content:`Anda adalah perancang kurikulum senior. Output HANYA JSON valid.`},{role:`user`,content:i}],{temperature:.5,response_format:r.provider===`openai`?{type:`json_object`}:void 0}),t=String(e).match(/\{"materials"\s*:\s*\[[\s\S]*\]\}/)||String(e).match(/\{[\s\S]*\}/);o=t?JSON.parse(t[0]):null}catch{}if(!o||!Array.isArray(o.materials))try{let e=await G(r,[{role:`system`,content:`Anda adalah perancang kurikulum senior. Output HANYA JSON array valid (dimulai dengan [, diakhiri ]), tidak ada teks lain. Tiap item: {title, description}.`},{role:`user`,content:i}],{temperature:.5}),t=String(e).match(/\[[\s\S]*\]/);o=t?{materials:JSON.parse(t[0])}:null}catch{throw Error(`AI response tidak bisa diparse. Coba lagi.`)}if(!Array.isArray(o.materials)||o.materials.length===0)throw Error(`Tidak ada materi yang dihasilkan.`);let s=o.materials.slice(0,10).map((e,t)=>({no:t+1,title:String(e.title||`Materi ${t+1}`),description:String(e.description||``)}));B(s),E(),a(`${s.length} materi dihasilkan`,`success`)}catch(e){a(`Error: `+e.message,`error`)}finally{o.disabled=!1,o.innerHTML=s}}),document.getElementById(`saveAiBtn`).addEventListener(`click`,()=>{let e={provider:document.getElementById(`aiProvider`).value,model:document.getElementById(`aiModel`).value,baseUrl:document.getElementById(`aiBaseUrl`).value.trim(),apiKey:document.getElementById(`aiApiKey`).value.trim()};i.set(`pg_ai`,e),a(`Pengaturan AI disimpan`,`success`)}),document.getElementById(`testAiBtn`).addEventListener(`click`,async()=>{let e={provider:document.getElementById(`aiProvider`).value,model:document.getElementById(`aiModel`).value,baseUrl:document.getElementById(`aiBaseUrl`).value.trim(),apiKey:document.getElementById(`aiApiKey`).value.trim()},t=document.getElementById(`aiStatus`);t.textContent=`⏳ Menguji...`;try{await G(e,[{role:`user`,content:`Balas dengan kata "OK".`}])?(t.textContent=`✅ Berhasil`,a(`Koneksi AI berhasil`,`success`)):(t.textContent=`❌ Gagal`,a(`Gagal memanggil API`,`error`))}catch(e){t.textContent=`❌ `+e.message,a(`Error: `+e.message,`error`)}});function ce(){let e=i.get(`pg_proposal`,{}),t=Array.isArray(e.competencyUnits)&&e.competencyUnits.length?e.competencyUnits.join(`; `):e.competencyUnit||`-`;return[`Perusahaan klien: ${e.companyName||`-`}`,`Penyelenggara: ${e.organizerName||`-`}`,`Judul pelatihan: ${e.proposalTitle||`-`}`,`Unit kompetensi: ${t}`,`Venue: ${e.venue||`-`}`,`Jadwal Pelatihan: ${e.trainingStartDate||e.startDate||`-`} s/d ${e.trainingEndDate||e.endDate||`-`} ${e.trainingStartTime||``} ${e.trainingEndTime?` - `+e.trainingEndTime:``}`,e.examStartDate?`Jadwal Uji: ${e.examStartDate} ${e.examStartTime||``} s/d ${e.examEndDate||e.examStartDate} ${e.examEndTime||``}`:null,`Biaya per peserta: ${e.pricePerPerson||`-`}`,`Jumlah peserta: ${e.audienceCount||e.minParticipants||`-`}`,e.audience?`Profil peserta: ${e.audience.substring(0,300)}`:null,e.requirements?`Persyaratan: ${e.requirements.substring(0,200)}`:null,e.clientIndustry?`Industri klien: ${e.clientIndustry}`:null,e.companySize?`Ukuran klien: ${e.companySize}`:null,e.topPainPoints?`Pain points utama:\n${e.topPainPoints}`:null,e.businessGoals?`Target bisnis:\n${e.businessGoals}`:null,e.budgetRange?`Perkiraan budget: ${e.budgetRange}`:null,e.decisionTimeline?`Timeline keputusan: ${e.decisionTimeline}`:null,e.decisionMakers?`Pengambil keputusan: ${e.decisionMakers}`:null].filter(Boolean).join(`
`)}function le(e){return`Anda adalah konsultan senior Indonesia yang menulis proposal B2B faktual & lugas. Fokus pada kebutuhan nyata, bukan promosi berlebihan.

${_}

KERANGKA PERSUASI untuk bagian ini:
${h[e.framework]||`Gunakan prinsip copywriting profesional.`}

PEDOMAN KERAS (WAJIB DIIKUTI):
- Bahasa Indonesia formal-korporat, minim jargon marketing.
- DATA USER = fakta. INFERENCE = hedging (berpotensi/dapat membantu/diperkirakan). RECOMMENDATION = usulan.
- JANGAN klaim masalah klien jika user tidak beri data. Tulis kebutuhan netral.
- JANGAN klaim angka spesifik tanpa baseline — pakai "perlu diukur berdasarkan baseline di lokasi".
- Lebih suka proses/output yang terukur daripada klaim generik.
- Hindari frasa klise. **JANGAN PERNAH** gunakan:
${g.map((e,t)=>`${t+1}. "${e}"`).join(`
`)}
- Output hanya BODY — jangan heading, markdown code block, atau instruksi pembuka/penutup.
- Panjang: 3 paragraf (≈120-180 kata) untuk naratif, atau 4-6 bullet untuk daftar.
- Jika data kosong, JANGAN mengarang — pakai placeholder [isi di lokasi] yang mudah diedit.`}function ue(e){let t=ce();return`Riset internal dulu sebelum menulis bagian "${e.label}".

Konteks:\n${t}

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

Pastikan setiap poin menggunakan konteks klien (industri, ukuran, pain points) bila tersedia. JSON harus valid dan bisa di-parse.`}function de(e,t){let n=`Riset internal (jangan tampilkan di output):\n${t||`(riset tidak tersedia — gunakan inferensi dari konteks klien)`}\n\nTulis bagian "${e.label}" proposal.

Panjang target: ${{background:`3 paragraf (≈ 150-200 kata).`,description:`3-4 paragraf (≈ 180-240 kata) + sebutkan metode/metodologi.`,objectives:`4-6 poin bullet, tiap poin 1 kalimat aktif yang ACTIONABLE.`,audience:`2 paragraf (≈ 120-160 kata), persona + manifestasi kebutuhan mereka.`,requirements:`4-6 poin bullet, tiap poin verifiable.`,closing:`2 paragraf persuasif + 1 paragraf CTA assumptive (deadline + 2 kontak + tanda tangan).`}[e.promptKey]||`2-3 paragraf.`}
Nada: percaya diri, spesifik, berorientasi klien.`;return e.promptKey===`closing`?`${n}

PASTIKAN paragraf terakhir berisi:
1. Asumsi positif kerjasama ("Kami sudah准备...)
2. **Deadline konfirmasi**: sebutkan tanggal absolut (mis. "15 November 2025")
3. **Masa berlaku penawaran**: "14 hari sejak tanggal proposal"
4. **Dua kontak** (penjualan + admin) dengan nama & nomor WA/email
5. Tanda tangan digital di atas nama jelas`:n}function fe(e){if(!e)return null;let t=String(e).match(/\{[\s\S]*\}/);if(!t)return null;try{return JSON.parse(t[0])}catch{return null}}async function G(e,t,n={}){if(!e.apiKey)throw Error(`API Key belum diisi`);let r=(e.baseUrl||{openai:`https://api.openai.com/v1`,openrouter:`https://openrouter.ai/api/v1`,anthropic:`https://api.anthropic.com/v1`,groq:`https://api.groq.com/openai/v1`,custom:``}[e.provider]||``).replace(/\/+$/,``);if(!r)throw Error(`Base URL belum diisi`);let i=await fetch(`${r}/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,messages:t,temperature:n.temperature??.7,...n.response_format?{response_format:n.response_format}:{}})});if(!i.ok){let e=await i.text();throw Error(`${i.status} ${e.slice(0,120)}`)}return(await i.json())?.choices?.[0]?.message?.content||``}async function K(e,t={}){try{E()}catch{}let n=i.get(`pg_proposal`,{}),r=document.getElementById(`companyName`)?.value?.trim()||``,o=document.getElementById(`proposalTitle`)?.value?.trim()||``;if(r&&(n.companyName=r),o&&(n.proposalTitle=o),!n.companyName||!n.proposalTitle){a(`Lengkapi Info Penting (Step 2) dulu`,`error`);return}let s=i.get(`pg_ai`,{});if(!s.apiKey){a(`Atur API Key dulu di Pengaturan AI`,`error`),b(`settings`);return}let c=t.mode||`chain`,l=document.querySelector(`[data-target="${e.id}"][data-action="chain"]`),u=document.querySelector(`[data-target="${e.id}"][data-action="rewrite"]`),d=document.querySelector(`[data-target="${e.id}"][data-action="research"]`),f=[l,u,d].filter(Boolean),p=new Map(f.map(e=>[e,e.innerHTML])),m=(e,t)=>{e&&(e.disabled=!0,e.innerHTML=`<span>${t}</span>`)};f.forEach(e=>m(e,`⏳ ...`));try{let t=i.get(`pg_insights_${e.id}`,null);if(c!==`rewrite`&&c!==`chain-no-research`){m(d||l,`⏳ Riset...`);let n=fe(await G(s,[{role:`system`,content:`Anda adalah analis riset senior. Output HANYA JSON valid. Tidak ada teks lain.`},{role:`user`,content:ue(e)}],{temperature:.4,response_format:s.provider===`openai`?{type:`json_object`}:void 0}));n&&(t=n,i.set(`pg_insights_${e.id}`,t),S(e.id,t))}if(c===`research`){a(`Riset diperbarui`,`success`);return}m(l||u,`⏳ Menulis...`);let n=t?JSON.stringify(t):``,r=await G(s,[{role:`system`,content:le(e)},{role:`user`,content:de(e,n)}]),o=document.getElementById(e.id);o&&(o.value=r.trim(),E()),a(`${e.label} diperbarui`,`success`)}catch(e){a(`Error: `+e.message,`error`)}finally{f.forEach(e=>{e.disabled=!1,p.has(e)&&(e.innerHTML=p.get(e))})}}function q(){let e=i.get(`pg_proposal`,{}),t=Array.isArray(e.competencyUnits)&&e.competencyUnits.length?e.competencyUnits.join(`; `):e.competencyUnit||``,n=e.trainingStartDate||e.startDate||``,r=e.trainingEndDate||e.endDate||``;return{template:e.template||`classic`,title:e.proposalTitle||`Proposal Pelatihan`,company:e.companyName||``,organizer:e.organizerName||``,organizerLogo:e.organizerLogo||``,competency:t,competencyUnits:Array.isArray(e.competencyUnits)?e.competencyUnits:e.competencyUnit?[e.competencyUnit]:[],cta:e.cta||``,startDate:n,endDate:r,trainingStartDate:e.trainingStartDate||n,trainingEndDate:e.trainingEndDate||r,trainingStartTime:e.trainingStartTime||``,trainingEndTime:e.trainingEndTime||``,examStartDate:e.examStartDate||``,examEndDate:e.examEndDate||``,examStartTime:e.examStartTime||``,examEndTime:e.examEndTime||``,venue:e.venue||``,pricePerPerson:e.pricePerPerson||``,minParticipants:e.minParticipants||e.audienceCount||``,audienceCount:e.audienceCount||e.minParticipants||``,priceNotes:e.priceNotes||``,facilities:Array.isArray(e.facilities)?e.facilities:[],clientIndustry:e.clientIndustry||``,companySize:e.companySize||``,topPainPoints:e.topPainPoints||``,businessGoals:e.businessGoals||``,budgetRange:e.budgetRange||``,decisionTimeline:e.decisionTimeline||``,decisionMakers:e.decisionMakers||``,body:{background:e.background||``,description:e.description||``,objectives:e.objectives||``,audience:e.audience||``,requirements:e.requirements||``,closing:e.closing||``},materials:Array.isArray(e.materials)?e.materials:[]}}var J=[`Januari`,`Februari`,`Maret`,`April`,`Mei`,`Juni`,`Juli`,`Agustus`,`September`,`Oktober`,`November`,`Desember`];function pe(e){if(!e)return``;let t=new Date(e);return isNaN(t)?e:`${t.getDate()} ${J[t.getMonth()]} ${t.getFullYear()}`}function Y(e,t){let n=pe(e),r=pe(t);if(!n&&!r)return``;if(!t||n===r)return n;let i=new Date(e),a=new Date(t);return!isNaN(i)&&!isNaN(a)&&i.getMonth()===a.getMonth()&&i.getFullYear()===a.getFullYear()?`${i.getDate()}-${a.getDate()} ${J[i.getMonth()]} ${i.getFullYear()}`:`${n} – ${r}`}function me(){return new Date().getFullYear()}function X(e){return e?e.split(/\n+/).map(e=>e.replace(/^[\u2022\-\*]\s*/,``).trim()).filter(Boolean):[]}function he(e){return String(e).padStart(2,`0`)}function ge(e){let t=Array.isArray(e.materials)?e.materials:[];if(t.length===0)return[];let n=[new TableRow({tableHeader:!0,children:[`No`,`Materi`].map(e=>new TableCell({shading:{type:ShadingType.CLEAR,fill:COL_PRIMARY,color:`auto`},children:[new Paragraph({children:[new TextRun({text:e,bold:!0,color:`FFFFFF`,size:22})]})]}))}),...t.map((e,t)=>new TableRow({children:[new TableCell({children:[new Paragraph({children:[new TextRun({text:String(t+1),bold:!0,size:22})]})]}),new TableCell({children:[new Paragraph({children:[new TextRun({text:e.title||`Materi ${t+1}`,bold:!0,size:22})],spacing:{after:60}}),...e.description?[new Paragraph({children:[new TextRun({text:e.description,size:20,color:`475569`})]})]:[]]})]}))];return[new Paragraph({children:[new TextRun({text:`02A`,bold:!0,size:64,color:COL_PRIMARY,font:fonts.heading})],spacing:{after:100}}),new Paragraph({children:[new TextRun({text:`Materi Pelatihan`,bold:!0,size:32,color:`0F172A`,font:fonts.heading})],heading:HeadingLevel.HEADING_2,spacing:{after:200},border:{bottom:{style:BorderStyle.SINGLE,size:12,color:COL_PRIMARY,space:1}}}),new Paragraph({children:[new TextRun({text:`${t.length} materi yang membahas aspek fundamental hingga implementasi — disusun dari pendalaman masalah spesifik ${e.company||`klien`} agar peserta langsung bisa mempraktikkan di unit kerja masing-masing.`,size:22})],spacing:{after:200}}),new Table({rows:n,width:{size:100,type:WidthType.PERCENTAGE}}),new Paragraph({text:``,spacing:{after:360}})]}function _e(e,t={}){let n=e.template,r=t.cssMode===`pdf`,i=Y(e.startDate,e.endDate),a=e=>[`🎓`,`📚`,`🍽️`,`🏨`,`💻`,`💬`,`🏆`,`📜`,`✈️`,`🎯`][e%10],o=[{num:1,title:`Latar Belakang`,body:Z(e.body.background||`—`)},{num:2,title:`Deskripsi Pelatihan`,body:Z(e.body.description||`—`)},{num:3,title:`Tujuan`,body:Z(e.body.objectives||`—`),list:X(e.body.objectives)},{num:4,title:`Peserta`,body:Z(e.body.audience||`—`)},{num:5,title:`Persyaratan Peserta`,body:Z(e.body.requirements||`—`),list:X(e.body.requirements),isCheck:!0}].map(e=>`
    <section class="section-block">
      <div class="section-num">${he(e.num)}</div>
      <div class="section-content">
        <h2 class="section-title">${e.title}</h2>
        ${e.list&&e.list.length?`<ul class="section-list${e.isCheck?` checklist`:``}">${e.list.map((t,n)=>e.isCheck?`<li><span class="check-mark">✓</span><span>${L(t)}</span></li>`:`<li><span class="bullet"></span><span>${L(t)}</span></li>`).join(``)}</ul>`:`<p class="section-body">${e.body}</p>`}
      </div>
    </section>
  `),s=we(e);s&&o.splice(2,0,s);let c=o.join(``),l=Y(e.trainingStartDate||e.startDate,e.trainingEndDate||e.endDate),u=Ce(e.trainingStartDate||e.startDate,e.trainingEndDate||e.endDate),d=e.examStartDate?Y(e.examStartDate,e.examEndDate||e.examStartDate):``,f=e.trainingStartTime||e.trainingEndTime?`${L(e.trainingStartTime||``)} ${e.trainingEndTime?` - `+L(e.trainingEndTime):``}`:``,p=e.examStartTime||e.examEndTime?`${L(e.examStartTime||``)} ${e.examEndTime?` - `+L(e.examEndTime):``}`:``,m=`
    <section class="section-block">
      <div class="section-num">06</div>
      <div class="section-content">
        <h2 class="section-title">Jadwal Pelaksanaan</h2>
        <div style="margin-bottom:14px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
          <div style="font-weight:700;color:#0f172a;margin-bottom:6px">📚 Jadwal Pelatihan</div>
          ${l?`<p class="section-body"><strong>Tanggal:</strong> ${L(l)} (${u.length} hari) ${f?` • `+f:``}</p>`:`<p class="section-body">Jadwal pelatihan menyesuaikan kesepakatan</p>`}
          ${e.venue?`<p class="section-body"><strong>Lokasi:</strong> ${L(e.venue)}</p>`:``}
        </div>
        ${e.examStartDate?`<div style="padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px"><div style="font-weight:700;color:#92400e;margin-bottom:6px">🧪 Jadwal Uji Kompetensi</div><p class="section-body"><strong>Tanggal Uji:</strong> ${L(d)} ${p?` • `+p:``}</p></div>`:``}
        <table class="proposal-table schedule-table">
          <thead><tr><th style="width:35%">Waktu</th><th>Agenda</th></tr></thead>
          <tbody>
            ${u.map(e=>`<tr><td><strong>${L(e.split(` — `)[0])}</strong></td><td>${L(e.split(` — `)[1]||`Sesi inti & latihan terapan`)}</td></tr>`).join(``)}
          </tbody>
        </table>
      </div>
    </section>
  `,h=``;try{let t=parseInt(String(e.pricePerPerson||``).replace(/[^0-9]/g,``))||0,n=parseInt(String(e.minParticipants||e.audienceCount||``).replace(/[^0-9]/g,``))||0;if(t&&n){let r=t*n;h=`<tr style="background:#f0fdf4;font-weight:700"><td><strong>Total Investasi (estimasi)</strong><br/><span style="font-size:11px;color:#059669">${L(String(n))} × ${L(e.pricePerPerson)}</span></td><td style="color:#059669">Rp${r.toLocaleString(`id-ID`)}</td></tr>`}}catch{}let g=`
    <section class="section-block">
      <div class="section-num">06A</div>
      <div class="section-content">
        <h2 class="section-title">Alur Training → Assessment → Certification</h2>
        <div style="display:flex;align-items:stretch;gap:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;padding:14px;background:#0f172a;color:white;border-radius:12px;text-align:center">
            <div style="font-size:11px;letter-spacing:0.1em;opacity:0.7">TRAINING</div>
            <div style="font-weight:700;margin-top:6px">${L(Y(e.trainingStartDate||e.startDate,e.trainingEndDate||e.endDate)||`Sesuai jadwal`)}</div>
            <div style="font-size:11px;opacity:0.8;margin-top:4px">Pembelajaran + praktik + persiapan assessment</div>
          </div>
          <div style="display:flex;align-items:center;font-weight:800;color:#0f172a">→</div>
          <div style="flex:1;min-width:140px;padding:14px;background:#1e3a5f;color:white;border-radius:12px;text-align:center">
            <div style="font-size:11px;letter-spacing:0.1em;opacity:0.7">ASSESSMENT</div>
            <div style="font-weight:700;margin-top:6px">${L(e.examStartDate?Y(e.examStartDate,e.examEndDate||e.examStartDate):`Jadwal uji menyusul`)}</div>
            <div style="font-size:11px;opacity:0.8;margin-top:4px">Uji kompetensi oleh asesor</div>
          </div>
          <div style="display:flex;align-items:center;font-weight:800;color:#0f172a">→</div>
          <div style="flex:1;min-width:140px;padding:14px;background:#10b981;color:white;border-radius:12px;text-align:center">
            <div style="font-size:11px;letter-spacing:0.1em;opacity:0.9">CERTIFICATION</div>
            <div style="font-weight:700;margin-top:6px">Sertifikat</div>
            <div style="font-size:11px;opacity:0.9;margin-top:4px">Bagi yang dinyatakan kompeten</div>
          </div>
        </div>
      </div>
    </section>
  `,_=`
    <section class="section-block">
      <div class="section-num">10</div>
      <div class="section-content">
        <h2 class="section-title">Investasi</h2>
        <table class="proposal-table pricing-table">
          <thead><tr><th>Item</th><th style="width:40%">Keterangan</th></tr></thead>
          <tbody>
            ${e.pricePerPerson?`<tr><td><strong>Biaya per Peserta</strong></td><td>${L(e.pricePerPerson)}</td></tr>`:``}
            ${e.minParticipants?`<tr><td><strong>Minimal Peserta</strong></td><td>${L(e.minParticipants)} orang</td></tr>`:``}
            ${h}
            ${e.priceNotes?`<tr><td><strong>Catatan</strong></td><td>${L(e.priceNotes)}</td></tr>`:``}
          </tbody>
        </table>
        <p class="section-body" style="font-size:11px;color:#64748b;margin-top:8px">Harga belum termasuk akomodasi/tiket peserta (jika ada) — lihat Scope & Exclusion.</p>
      </div>
    </section>
  `,v=`
    <section class="section-block">
      <div class="section-num">09</div>
      <div class="section-content">
        <h2 class="section-title">Fasilitas</h2>
        ${e.facilities.length?`
          <div class="facility-grid">
            ${e.facilities.map((e,t)=>`
              <div class="facility-card-doc">
                <div class="facility-doc-icon">${a(t)}</div>
                <div class="facility-doc-label">${L(e)}</div>
              </div>
            `).join(``)}
          </div>
        `:`<p class="section-body">—</p>`}
      </div>
    </section>
  `,y=`
    <section class="section-block">
      <div class="section-num">10A</div>
      <div class="section-content">
        <h2 class="section-title">Ruang Lingkup & Exclusion</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div style="padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px">
            <div style="font-weight:700;color:#065f46;margin-bottom:8px">Ruang Lingkup (Termasuk)</div>
            <ul class="section-list">${[`Pelatihan sesuai materi`,`Modul & materi`,`Praktik & pendampingan`,`Uji kompetensi (jika ada)`,`Sertifikasi bagi yang kompeten`,`Fasilitas terpilih`].map(e=>`<li><span class="bullet" style="background:#10b981"></span><span>${L(e)}</span></li>`).join(``)}</ul>
          </div>
          <div style="padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px">
            <div style="font-weight:700;color:#991b1b;margin-bottom:8px">Tidak Termasuk</div>
            <ul class="section-list">${[`Akomodasi & tiket peserta`,`Spare part / alat praktik khusus`,`Pengadaan peralatan di lokasi`,`Biaya di luar venue yang disepakati`].map(e=>`<li><span class="bullet" style="background:#ef4444"></span><span>${L(e)}</span></li>`).join(``)}</ul>
          </div>
        </div>
      </div>
    </section>
  `,b=U(H(14)),x=e.organizer||`Tim Account Executive`,S=e.cta||`Mari wujudkan bersama.`,C=`
    <div class="closing-contacts">
      <div class="closing-contact"><div class="cc-label">Penjualan</div><div class="cc-name">${L(x)}</div><div class="cc-info">WA: 08XX-XXXX-XXXX • email@vendor.co.id</div></div>
      <div class="closing-contact"><div class="cc-label">Administrasi</div><div class="cc-name">Tim Admin Proyek</div><div class="cc-info">WA: 08XX-XXXX-XXXX • admin@vendor.co.id</div></div>
    </div>
  `,w=`
    <section class="section-block closing-block">
      <div class="section-num">09</div>
      <div class="section-content">
        <h2 class="section-title">Penutup</h2>
        <p class="section-body">${Z(e.body.closing||`—`)}</p>
        <div class="closing-cta-block">
          <div class="closing-cta-headline">${L(S)}</div>
          <div class="closing-cta-meta">
            <div class="closing-pill"><span class="cp-label">Masa berlaku</span><span class="cp-value">${b}</span></div>
            <div class="closing-pill"><span class="cp-label">Deadline konfirmasi</span><span class="cp-value">${b}</span></div>
          </div>
          ${C}
          <div class="closing-signoff">
            <div class="sig-label">Hormat kami,</div>
            <div class="sig-space"></div>
            <div class="sig-name"><strong>${L(x)}</strong></div>
            <div class="sig-role">Account Executive • ${L(e.organizer||``)}</div>
          </div>
        </div>
      </div>
    </section>
  `,T=ve(e,{pdf:r,dateRange:i}),E=Se(e);return`
    <article class="proposal tpl-${n}">
      <!-- COVER PAGE -->
      <section class="cover-page${r?` cover-pdf`:``}">
        <div class="cover-decor">
          <div class="cover-block block-1"></div>
          <div class="cover-block block-2"></div>
          <div class="cover-block block-3"></div>
        </div>
        <div class="cover-content">
          <div class="cover-tag">PROPOSAL PELATIHAN</div>
          ${e.organizerLogo?`<div class="cover-logo"><img src="${e.organizerLogo}" alt="Logo" style="max-height:64px;max-width:200px;object-fit:contain;margin-bottom:12px;background:white;padding:6px;border-radius:8px;"/></div>`:``}
          <h1 class="cover-title">${L(e.title)}</h1>
          <p class="cover-sub">Disusun untuk peningkatan kapasitas & pengembangan sumber daya manusia</p>
          <div class="cover-meta">
            ${e.organizer?`<div class="cover-meta-row"><span>Disusun Oleh</span><strong>${L(e.organizer)}</strong></div>`:``}
            ${e.company?`<div class="cover-meta-row"><span>Untuk</span><strong>${L(e.company)}</strong></div>`:``}
            ${i?`<div class="cover-meta-row"><span>Tanggal</span><strong>${L(i)}</strong></div>`:``}
            <div class="cover-meta-row"><span>Tahun</span><strong>${me()}</strong></div>
          </div>
          ${e.competencyUnits&&e.competencyUnits.length?`<div class="cover-competency">Unit Kompetensi (${e.competencyUnits.length}): ${L(e.competencyUnits.slice(0,3).join(` • `))}${e.competencyUnits.length>3?` • ...`:``}</div>`:e.competency?`<div class="cover-competency">Unit Kompetensi: ${L(e.competency)}</div>`:``}
        </div>
      </section>

      <!-- EXECUTIVE SUMMARY (NEW — right after cover) -->
      ${T}

      <!-- TABLE OF CONTENTS PAGE -->
      <section class="proposal-page toc-page${r?` page-pdf`:``}">
        <div class="page-header">
          <div class="page-eyebrow">Daftar Isi</div>
          <h2 class="page-title">Table of Contents</h2>
        </div>
        <ul class="toc-list">
          ${[[`CO`,`Cover`],[`01`,`Executive Summary`],[`02`,`Program Overview`],[`03`,`Competency Framework`],[`04`,`Learning & Training Design`],[`05`,`Participant`],[`06`,`Training & Assessment Schedule`],[`07`,`Deliverables`],[`08`,`Why Us`],[`09`,`Facilities`],[`10`,`Investment`],[`11`,`Implementation`],[`12`,`Closing`]].map(([e,t])=>`
              <li class="toc-item">
                <span class="toc-num">${e}</span>
                <span class="toc-label">${L(t)}</span>
                <span class="toc-dots"></span>
                <span class="toc-page"></span>
              </li>
            `).join(``)}
        </ul>
      </section>

      <!-- HEADER / INFO PAGE -->
      <section class="proposal-page info-page${r?` page-pdf`:``}">
        <div class="page-header">
          <div class="page-eyebrow">Informasi Proposal</div>
          <h2 class="page-title">${L(e.title)}</h2>
        </div>
        <div class="info-grid">
          ${e.company?`<div class="info-card"><div class="info-label">Untuk Perusahaan</div><div class="info-value">${L(e.company)}</div></div>`:``}
          ${e.organizer?`<div class="info-card"><div class="info-label">Penyelenggara</div><div class="info-value">${L(e.organizer)}</div></div>`:``}
          ${i?`<div class="info-card"><div class="info-label">Tanggal</div><div class="info-value">${L(i)}</div></div>`:``}
          ${e.venue?`<div class="info-card"><div class="info-label">Venue</div><div class="info-value">${L(e.venue)}</div></div>`:``}
          ${e.competency?`<div class="info-card info-card-wide"><div class="info-label">Unit Kompetensi</div><div class="info-value">${L(e.competency)}</div></div>`:``}
        </div>
      </section>

      <!-- SECTIONS PAGE (could be multiple) -->
      <section class="proposal-page sections-page${r?` page-pdf`:``}">
        <div class="sections-wrap">
          ${ye(e)}
          ${c}
          ${be(e)}
          ${m}
          ${g}
          ${xe(e)}
          ${E}
          ${v}
          ${y}
          ${_}
          
    <section class="section-block">
      <div class="section-num">11</div>
      <div class="section-content">
        <h2 class="section-title">Tahapan Pelaksanaan</h2>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <div style="padding:8px 12px;background:#0f172a;color:white;border-radius:20px;font-size:12px;font-weight:700">1. Persiapan</div><span>→</span>
          <div style="padding:8px 12px;background:#1e3a5f;color:white;border-radius:20px;font-size:12px;font-weight:700">2. Pelatihan</div><span>→</span>
          <div style="padding:8px 12px;background:#0f172a;color:white;border-radius:20px;font-size:12px;font-weight:700">3. Uji Kompetensi</div><span>→</span>
          <div style="padding:8px 12px;background:#10b981;color:white;border-radius:20px;font-size:12px;font-weight:700">4. Sertifikasi</div>
        </div>
        <p class="section-body">Pelaksanaan direncanakan kolaboratif antara tim penyelenggara dan peserta, dengan persiapan materi, pelaksanaan pembelajaran, dan asesmen sesuai jadwal yang disepakati.</p>
      </div>
    </section>
  
          ${w}
        </div>
        <div class="proposal-footer">
          <span class="proposal-footer-text">${L(e.organizer||`—`)} • ${L(e.company||`—`)}</span>
          <span class="proposal-footer-num">—    —</span>
        </div>
      </section>
    </article>
  `}document.getElementById(`generateBtn`).addEventListener(`click`,()=>{let e=q();if(!e.title||e.title===`Proposal Pelatihan`){a(`Isi Judul Proposal dulu (Step 2)`,`error`);return}let t=document.getElementById(`previewArea`);t.innerHTML=_e(e,{cssMode:`screen`}),document.getElementById(`exportPdfBtn`).style.display=`inline-flex`,document.getElementById(`exportDocxBtn`).style.display=`inline-flex`,t.scrollIntoView({behavior:`smooth`,block:`start`}),a(`Proposal siap — tinggal di-export`,`success`)});function Z(e){return L(e).replace(/\n/g,`<br/>`)}function ve(e,t={}){let n=!!t.pdf,r=t.dateRange||``,a=i.get(`pg_proposal`,{}),o=i.get(`pg_insights_background`,null),s=a.topPainPoints?a.topPainPoints.split(`
`).slice(0,2).join(` `):`Kebutuhan pengembangan kompetensi untuk mendukung target "${L(e.title)}" di ${L(e.company||`perusahaan`)}.`,c=e.competencyUnits&&e.competencyUnits.length?e.competencyUnits.slice(0,5):o?.outcomes?.slice(0,5)||[`Kompetensi teknis sesuai unit`,`Penerapan SOP di tempat kerja`,`Persiapan assessment`],l=e.materials&&e.materials.length?e.materials.slice(0,3).map(e=>e.title):[`Modul & materi terstruktur`,`Praktik & output kerja`,`Rencana tindak lanjut 30 hari`],u=e.pricePerPerson||`—`,d=e.minParticipants||e.audienceCount||`—`,f=``;try{let e=parseInt(String(u).replace(/[^0-9]/g,``))||0,t=parseInt(String(d).replace(/[^0-9]/g,``))||0;e&&t&&(f=`${t} peserta × ${L(u)} = Rp${(e*t).toLocaleString(`id-ID`)}`)}catch{}let p=e.venue||``;return`
    <section class="proposal-page exec-summary-page${n?` page-pdf`:``}">
      <div class="page-header">
        <div class="page-eyebrow">Executive Summary</div>
        <h2 class="page-title">Ringkasan untuk Pengambil Keputusan</h2>
      </div>
      <div class="exec-headline" style="border-left-color:#0f172a;background:linear-gradient(90deg,#f1f5f9 0%,transparent 100%)">${L(e.title)}</div>
      <p class="exec-meta">Untuk <strong>${L(e.company||`-`)}</strong> • Oleh <strong>${L(e.organizer||`-`)}</strong>${r?` • `+L(r):``}${p?` • `+L(p):``}</p>

      <div class="exec-section">
        <div class="exec-section-title">Kebutuhan</div>
        <p class="section-body">${L(s)} ${a.businessGoals?` Target bisnis: `+L(a.businessGoals.substring(0,180)):``}</p>
        <p class="section-body" style="font-size:12px;color:#64748b;font-style:italic">Catatan: Kebutuhan dirumuskan dari data yang Anda input. Jika data belum lengkap, bagian ini perlu validasi bersama tim terkait.</p>
      </div>

      <div class="exec-section">
        <div class="exec-section-title">Solusi</div>
        <p class="section-body"><strong>${L(e.title)}</strong> — pendekatan praktik berbasis kompetensi, disesuaikan dengan profil peserta. ${a.clientIndustry?`Konteks industri: `+L(a.clientIndustry)+`.`:``}</p>
      </div>

      <div class="exec-section">
        <div class="exec-section-title">Kompetensi yang Dibangun (3–5)</div>
        <ul class="exec-diffs">${c.map(e=>`<li>${L(e)}</li>`).join(``)}</ul>
      </div>

      <div class="exec-section">
        <div class="exec-section-title">Output Peserta</div>
        <ul class="exec-outcomes">${l.map(e=>`<li>${L(e)}</li>`).join(``)}</ul>
      </div>

      <div class="exec-section" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <div class="exec-section-title">Sertifikasi</div>
          <p class="section-body">Peserta yang dinyatakan <strong>kompeten</strong> pada asesmen akan memperoleh <strong>sertifikat kompetensi</strong> sesuai skema ${e.competencyUnits&&e.competencyUnits.length?L(e.competencyUnits[0].split(`-`)[0].trim()):`yang relevan`}.</p>
        </div>
        <div>
          <div class="exec-section-title">Investasi</div>
          <p class="section-body"><strong>${L(u)}</strong> / peserta • Min ${L(String(d))} peserta ${f?`<br/><span style="color:#059669;font-weight:700">`+f+`</span>`:``}</p>
        </div>
      </div>

      <div class="exec-bottom" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)">
        <div class="exec-next" style="grid-column:1/-1">
          <div class="exec-next-label">Next Step</div>
          <div class="exec-next-body">Konfirmasi keikutsertaan via kontak di halaman Penutup. Tim kami akan bantu cek kelengkapan persyaratan & jadwal.</div>
        </div>
      </div>
    </section>
  `}function ye(e){let t=e.competencyUnits&&e.competencyUnits.length?e.competencyUnits:e.competency?[e.competency]:[];return t.length?`
    <section class="section-block">
      <div class="section-num">03</div>
      <div class="section-content">
        <h2 class="section-title">Competency Framework</h2>
        <p class="section-body">Program dirancang mengacu pada unit kompetensi berikut — setiap unit dipetakan ke elemen, materi, aktivitas, output, bukti, dan asesmen.</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          ${t.map((e,t)=>`<div style="display:flex;gap:10px;align-items:center;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px"><div style="width:28px;height:28px;border-radius:8px;background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${t+1}</div><div style="font-weight:600;color:#0f172a">${L(e)}</div></div>`).join(``)}
        </div>
        <p class="section-body" style="font-size:11px;color:#64748b;margin-top:8px;font-style:italic">Pemetaan detail elemen → materi → aktivitas → output → bukti → assessment ada di bagian Learning & Training Design.</p>
      </div>
    </section>
  `:``}function be(e){let t=X(e.body.objectives||``);return`
    <section class="section-block">
      <div class="section-num">04A</div>
      <div class="section-content">
        <h2 class="section-title">Learning Outcome</h2>
        <p class="section-body"><strong>Setelah mengikuti program, peserta mampu:</strong></p>
        <ul class="section-list">${(t.length?t.slice(0,6):[`Memahami konsep dan prinsip sesuai unit kompetensi`,`Menerapkan prosedur di tempat kerja`,`Menunjukkan output sesuai indikator`]).map(e=>`<li><span class="bullet"></span><span>${L(e)}</span></li>`).join(``)}</ul>
        <p class="section-body" style="font-size:11px;color:#64748b;font-style:italic">Outcome dirumuskan dari tujuan pembelajaran dan profil peserta. Capaian aktual tergantung partisipasi dan kondisi di lokasi.</p>
      </div>
    </section>
  `}function xe(e){return`
    <section class="section-block">
      <div class="section-num">07</div>
      <div class="section-content">
        <h2 class="section-title">Deliverables</h2>
        <p class="section-body">Yang akan diterima klien/peserta setelah program:</p>
        <ul class="section-list">
          <li><span class="bullet"></span><span>Modul & materi pelatihan (softcopy & hardcopy sesuai fasilitas)</span></li>
          <li><span class="bullet"></span><span>Hasil praktik & output kerja selama pelatihan</span></li>
          <li><span class="bullet"></span><span>Laporan kegiatan & dokumentasi</span></li>
          <li><span class="bullet"></span><span>Sertifikat pelatihan (kehadiran) & sertifikat kompetensi (bagi yang dinyatakan kompeten)</span></li>
        </ul>
      </div>
    </section>
  `}function Se(e){let t=i.get(`pg_insights_background`,null)||i.get(`pg_insights_description`,null),n=Array.isArray(t?.differentiators)&&t.differentiators.length?t.differentiators.slice(0,5).map(e=>e.replace(/terbaik|terdepan|nomor 1|paling/gi,`berpengalaman`)):[`Instruktur tersertifikasi sesuai skema`,`Modul mengacu pada unit kompetensi`,`Metode praktik & studi kasus`,`Pendampingan persiapan asesmen`,`Dokumentasi & laporan kegiatan`],r=[`🏅`,`🧪`,`📚`,`🛡️`,`📊`,`💬`];return`
    <section class="section-block">
      <div class="section-num">08</div>
      <div class="section-content">
        <h2 class="section-title">Mengapa Memilih Kami</h2>
        <p class="section-body">Beberapa hal yang ${L(e.organizer||`kami`)} upayakan untuk mendukung kebutuhan ${L(e.company||`Anda`)}:</p>
        <div class="whyus-grid">
          ${n.map((e,t)=>`
            <div class="whyus-card">
              <div class="whyus-icon">${r[t%r.length]}</div>
              <div class="whyus-text">${L(e)}</div>
            </div>
          `).join(``)}
        </div>
        <p class="section-body" style="font-size:11px;color:#64748b;margin-top:10px;font-style:italic">Catatan: Informasi di atas berdasarkan layanan yang direncanakan. Detail bukti (portofolio, sertifikat asesor) dapat dilampirkan terpisah.</p>
      </div>
    </section>
  `}function Ce(e,t){let n=[`Hari 1`,`Hari 2`,`Hari 3`];if(!e)return n;let r=new Date(e),i=new Date(t||e);if(isNaN(r)||isNaN(i))return n;let a=Math.max(1,Math.round((i-r)/864e5)+1),o=[`Pembukaan & fondasi`,`Pendalaman & latihan terapan`,`Studi kasus & presentasi`,`Uji kompetensi & rencana aksi`,`Coaching & konsolidasi`,`Workshop lanjutan`,`Implementasi & monitoring`],s=[];for(let e=0;e<a;e++)s.push(`Hari ${e+1}${o[e]?` — `+o[e]:``}`);return s}function we(e){let t=Array.isArray(e.materials)?e.materials:[];if(t.length===0)return``;let n=t.map((e,t)=>`
    <tr class="material-row-tr">
      <td class="mat-no"><div class="mat-no-badge">${t+1}</div></td>
      <td class="mat-title">
        <div class="mat-title-text">${L(e.title||`Materi ${t+1}`)}</div>
        ${e.description?`<div class="mat-desc">${L(e.description)}</div>`:``}
      </td>
    </tr>
  `).join(``);return`
    <section class="section-block materials-block">
      <div class="section-num">03A</div>
      <div class="section-content">
        <h2 class="section-title">Materi Pelatihan</h2>
        <p class="section-body">Daftar <strong>${t.length} materi</strong> yang membahas aspek fundamental hingga implementasi — disusun dari pendalaman masalah spesifik <strong>${L(e.company||`klien`)}</strong> agar peserta langsung bisa mempraktikkan di unit kerja masing-masing.</p>
        <table class="proposal-table materials-table">
          <thead>
            <tr>
              <th style="width:8%">No</th>
              <th>Materi</th>
            </tr>
          </thead>
          <tbody>${n}</tbody>
        </table>
        <div class="materials-totals">
          <div class="materials-total-item"><span class="mti-label">Total Materi</span><span class="mti-value">${t.length}</span></div>
        </div>
      </div>
    </section>
  `}document.getElementById(`exportPdfBtn`).addEventListener(`click`,()=>{let e=q(),t=_e(e,{cssMode:`pdf`}),n=window.open(``,`_blank`);n.document.write(`<!DOCTYPE html><html><head><title>${L(e.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
    <style>${Te()}</style>
    </head><body>${t}</body></html>`),n.document.close(),setTimeout(()=>{try{n.focus()}catch{}n.print()},700)}),document.getElementById(`exportDocxBtn`).addEventListener(`click`,async()=>{if(!window.docx){a(`Library DOCX belum termuat. Periksa koneksi internet.`,`error`);return}let e=document.getElementById(`exportDocxBtn`);e.disabled=!0;try{let e=je(q()),t=await window.docx.Packer.toBlob(e),n=(q().title||`proposal`).replace(/[^a-zA-Z0-9-]/g,`-`).replace(/-+/g,`-`).toLowerCase(),r=document.createElement(`a`);r.href=URL.createObjectURL(t),r.download=`proposal-${n}.docx`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(r.href),a(`File DOCX berhasil diunduh`,`success`)}catch(e){console.error(e),a(`Error buat DOCX: `+e.message,`error`)}finally{e.disabled=!1}});function Te(){return`
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: 'Inter', sans-serif; color: #0f172a; background: white; }
    ${Ee()}
    /* Page sizing for PDF */
    .proposal { background: white; }
    .cover-page { page-break-after: always; height: 297mm; padding: 24mm; }
    .proposal-page { page-break-after: always; padding: 24mm 22mm; min-height: 240mm; }
    .proposal-page:last-child { page-break-after: auto; }
    .proposal-footer { page-break-before: avoid; }
  `}function Ee(){return`
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
  `}function De(){let e=Array.from(document.querySelectorAll(`#competencyList .competency-input`));return e.length?e.map(e=>e.value.trim()).filter(Boolean):[]}function Q(e){let t=document.getElementById(`competencyList`);t&&(t.innerHTML=``,(Array.isArray(e)&&e.length?e:[``]).forEach(e=>{let n=document.createElement(`div`);n.className=`competency-row`,n.style.cssText=`display:flex;gap:8px;margin-bottom:8px`,n.innerHTML=`<input type="text" class="input competency-input" placeholder="Contoh: M.731000.001.01 - Mengelola Kampanye Digital" value="${L(e)}" style="flex:1" /><button type="button" class="btn-icon danger competency-remove" title="Hapus">✕</button>`,n.querySelector(`.competency-input`).addEventListener(`input`,E),n.querySelector(`.competency-remove`).addEventListener(`click`,()=>{n.remove(),E(),document.querySelectorAll(`#competencyList .competency-input`).length||Q([``])}),t.appendChild(n)}))}function Oe(){let e=document.getElementById(`competencyList`);!e||e.children.length||Q([``])}function $(e){let t=document.getElementById(`logoPreviewWrap`),n=document.getElementById(`logoPreview`);!t||!n||(e?(n.src=e,t.style.display=`flex`,t.style.alignItems=`center`,t.style.gap=`8px`):(n.removeAttribute(`src`),t.style.display=`none`))}function ke(){let e=document.getElementById(`generateProgress`),t=document.getElementById(`generateProgressFill`),n=document.getElementById(`generateProgressText`),r=document.getElementById(`previewArea`),i=document.getElementById(`exportActions`),o=[`Validasi data...`,`Ekstraksi fakta...`,`Riset konteks...`,`Mapping kompetensi...`,`Analisis bisnis...`,`Strategi proposal...`,`Menyusun konten...`,`Fact check...`,`Hallucination check...`,`Commercial check...`,`Desain layout...`,`Finalisasi...`],s=0;function c(){s>=o.length||(n&&(n.textContent=o[s]),t&&(t.style.width=Math.round((s+1)/o.length*100)+`%`),s++)}e&&(e.style.display=`block`),c();let l=q();if(!l.title||!l.company||!l.organizer){n&&(n.textContent=`Validasi gagal — lengkapi Info`),a(`Lengkapi Info Penting (Step 2) dulu`,`error`),e&&(e.style.display=`none`);return}let u=setInterval(()=>{if(c(),s>=o.length){clearInterval(u);let a=[l.body.background,l.body.description,l.body.objectives,l.body.closing].join(` `);g.some(e=>a.toLowerCase().includes(e.toLowerCase()))&&(console.warn(`Hallucination check: banned phrase detected`),n&&(n.textContent=`Hallucination check: perlu revisi bahasa`));let o=document.getElementById(`generateBtn`);o&&o.click(),t&&(t.style.width=`100%`),n&&(n.textContent=`Selesai — preview di bawah (sudah fact & hallucination check)`),setTimeout(()=>{e&&(e.style.display=`none`),i&&(i.style.display=`grid`),r&&r.scrollIntoView({behavior:`smooth`})},600)}},180),d=document.getElementById(`competencyAiHint`);d&&l.competencyUnits&&l.competencyUnits.length&&(d.style.display=`block`,d.textContent=`Pipeline: `+l.competencyUnits.length+` unit → mapping ke materi → aktivitas → output → bukti → assessment (akan terlihat di preview).`)}function Ae(e){let t=e.target.value,n=e.target.id===`minParticipants`?document.getElementById(`minParticipants2`):document.getElementById(`minParticipants`);n&&n.value!==t&&(n.value=t),E()}(function(){let e=document.getElementById(`organizerLogo`);e&&e.addEventListener(`change`,()=>{let t=e.files&&e.files[0];if(!t)return;if(t.size>2097152){a(`File terlalu besar (max 2MB)`,`error`);return}let n=new FileReader;n.onload=()=>{let e=n.result;i.set(`pg_proposal`,{...i.get(`pg_proposal`,{}),organizerLogo:e});let t=i.get(`pg_proposal`,{});t.organizerLogo=e,i.set(`pg_proposal`,t),$(e),a(`Logo berhasil diupload`,`success`)},n.readAsDataURL(t)});let t=document.getElementById(`removeLogoBtn`);t&&t.addEventListener(`click`,()=>{let t=i.get(`pg_proposal`,{});t.organizerLogo=``,i.set(`pg_proposal`,t),$(``),e&&(e.value=``),a(`Logo dihapus`,`success`)});let n=document.getElementById(`addCompetencyBtn`);n&&n.addEventListener(`click`,()=>{let e=document.getElementById(`competencyList`);if(!e)return;let t=document.createElement(`div`);t.className=`competency-row`,t.style.cssText=`display:flex;gap:8px;margin-bottom:8px`,t.innerHTML=`<input type="text" class="input competency-input" placeholder="Contoh: M.731000.001.01 - Nama Unit" style="flex:1" /><button type="button" class="btn-icon danger competency-remove" title="Hapus">✕</button>`,t.querySelector(`.competency-input`).addEventListener(`input`,E),t.querySelector(`.competency-remove`).addEventListener(`click`,()=>{t.remove(),E()}),e.appendChild(t),t.querySelector(`input`).focus()}),setTimeout(()=>{Oe()},300),[`trainingStartDate`,`trainingEndDate`,`trainingStartTime`,`trainingEndTime`,`examStartDate`,`examEndDate`,`examStartTime`,`examEndTime`,`audienceCount`,`cta2`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,E),t&&t.addEventListener(`change`,E)});let r=document.getElementById(`cta2`);r&&r.addEventListener(`input`,()=>{let e=document.getElementById(`cta`);e&&(e.value=r.value),E()});let o=document.getElementById(`minParticipants`),s=document.getElementById(`minParticipants2`);o&&o.addEventListener(`input`,Ae),s&&s.addEventListener(`input`,Ae);let c=document.getElementById(`addCustomFacilityBtn`);c&&c.addEventListener(`click`,()=>{let e=document.getElementById(`customFacility`),t=e&&e.value.trim()||``;if(!t){a(`Isi nama fasilitas dulu`,`error`);return}let n=document.getElementById(`facilities`),r=document.createElement(`label`);r.className=`facility-card`,r.innerHTML=`<input type="checkbox" value="${L(t)}" checked /><div class="facility-icon">✨</div><div class="facility-label">${L(t)}</div>`,r.querySelector(`input`).addEventListener(`change`,E),n.appendChild(r),E(),e.value=``,a(`Fasilitas ditambahkan`,`success`)});let l=document.querySelector(`[data-target="audience"]`);l&&l.addEventListener(`click`,()=>K({id:`audience`,label:`Peserta`,promptKey:`audience`,framework:`PERSONA`},{mode:`chain`}));let u=document.getElementById(`requirements`);u&&u.addEventListener(`input`,E);let d=document.getElementById(`generateBtn2`);d&&d.addEventListener(`click`,()=>ke()),document.getElementById(`generateMaterialsBtn`)})(),b(1);function je(e){let{Document:t,Packer:n,Paragraph:r,TextRun:a,HeadingLevel:o,Table:s,TableRow:c,TableCell:l,WidthType:u,AlignmentType:d,BorderStyle:f,ShadingType:p,PageBreak:m,PageNumber:h,Header:g,Footer:_,Tab:v,TabStopType:y,TabStopPosition:b,LevelFormat:x,AlignmentType:S}=window.docx,C=e.template===`classic`?`1E3A5F`:e.template===`minimal`?`64748B`:`6366F1`,w=e.template===`minimal`?`F8FAFC`:`F1F5F9`,T={heading:(e.template,`Plus Jakarta Sans`),body:`Inter`},E=(e,t={})=>new r({text:e,heading:t.heading||o.HEADING_1,spacing:{before:200,after:120},...t}),D=[new r({text:``,spacing:{after:2400}}),new r({children:[new a({text:`PROPOSAL PELATIHAN`,bold:!0,size:22,color:`94A3B8`})],alignment:d.LEFT,spacing:{after:200}}),new r({children:[new a({text:e.title,bold:!0,size:72,color:`0F172A`,font:T.heading})],spacing:{after:400,line:360},alignment:d.LEFT}),new r({children:[new a({text:`Disusun untuk peningkatan kapasitas & pengembangan sumber daya manusia.`,size:24,color:`475569`})],spacing:{after:800,line:360},alignment:d.LEFT}),new r({children:[new a({text:`Disusun Oleh  `,bold:!1,size:20,color:`64748B`}),new a({text:e.organizer||`-`,bold:!0,size:24,color:`0F172A`})],spacing:{after:100},alignment:d.LEFT}),...e.company?[new r({children:[new a({text:`Untuk            `,size:20,color:`64748B`}),new a({text:e.company,bold:!0,size:24,color:`0F172A`})],spacing:{after:100},alignment:d.LEFT})]:[],...e.startDate?[new r({children:[new a({text:`Tanggal       `,size:20,color:`64748B`}),new a({text:Y(e.startDate,e.endDate),bold:!0,size:24,color:`0F172A`})],spacing:{after:100},alignment:d.LEFT})]:[],new r({children:[new a({text:`Tahun           `,size:20,color:`64748B`}),new a({text:String(me()),bold:!0,size:24,color:`0F172A`})],spacing:{after:400},alignment:d.LEFT}),...e.competency?[new r({children:[new a({text:`Unit Kompetensi: `+e.competency,italics:!0,size:22,color:`6366F1`})],spacing:{after:200}})]:[]],O=[`ES Ringkasan Eksekutif`,`01 Latar Belakang`,`02 Deskripsi Pelatihan`,`02A Materi Pelatihan`,`03 Tujuan`,`04 Peserta`,`05 Persyaratan Peserta`,`05A Mengapa Memilih Kami`,`05B Dampak & ROI`,`06 Jadwal Pelaksanaan`,`07 Investasi`,`08 Fasilitas`,`09 Penutup`].map((e,t)=>{let[n,...i]=e.split(` `),o=i.join(` `);return new r({tabStops:[{type:y.RIGHT,position:9e3,leader:`dot`}],children:[new a({text:n+`   `,bold:!0,size:24,color:C,font:T.heading}),new a({text:o,size:22,color:`0F172A`}),new a({text:`	`+String(t+2).padStart(2,`0`),size:22,bold:!0,color:`64748B`})],spacing:{after:160}})}),k=[[`Untuk Perusahaan`,e.company],[`Penyelenggara`,e.organizer],[`Tanggal`,Y(e.startDate,e.endDate)],[`Venue`,e.venue]].filter(([e,t])=>t).map(([e,t])=>new r({spacing:{after:80},children:[new a({text:e.toUpperCase()+`
`,bold:!0,size:20,color:C}),new a({text:t+`

`,bold:!0,size:24,color:`0F172A`})]})),A=(e,t,n,i,s)=>{let c=[new r({children:[new a({text:e,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:t,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}})];return i&&i.length?c.push(...i.map(e=>new r({children:[new a({text:s?`✓  `:`•  `,bold:!0,color:s?`10B981`:C,size:24}),new a({text:e,size:24,color:`334155`})],spacing:{after:120,line:360},indent:{left:200}}))):c.push(...String(n||`—`).split(/\n+/).map(e=>new r({children:[new a({text:e,size:24,color:`334155`})],spacing:{after:120,line:360}}))),c.push(new r({text:``,spacing:{after:360}})),c},ee=new s({width:{size:100,type:u.PERCENTAGE},rows:[new c({tableHeader:!0,children:[`Item`,`Keterangan`].map(e=>new l({shading:{type:p.CLEAR,fill:C,color:`auto`},children:[new r({children:[new a({text:e,bold:!0,color:`FFFFFF`,size:22})]})]}))}),...[e.pricePerPerson?[`Biaya per Peserta`,e.pricePerPerson]:null,e.minParticipants?[`Minimal Peserta`,e.minParticipants+` orang`]:null,e.priceNotes?[`Catatan`,e.priceNotes]:null].filter(Boolean).map(([e,t],n)=>new c({children:[new l({shading:{type:p.CLEAR,fill:n%2?w:`FFFFFF`,color:`auto`},children:[new r({children:[new a({text:e,bold:!0,size:22,color:`0F172A`})]})]}),new l({shading:{type:p.CLEAR,fill:n%2?w:`FFFFFF`,color:`auto`},children:[new r({children:[new a({text:String(t),size:22,color:`334155`})]})]})]}))]}),j=new s({width:{size:100,type:u.PERCENTAGE},rows:[new c({tableHeader:!0,children:[`Waktu`,`Agenda`].map(e=>new l({shading:{type:p.CLEAR,fill:C,color:`auto`},children:[new r({children:[new a({text:e,bold:!0,color:`FFFFFF`,size:22})]})]}))}),...Ce(e.startDate,e.endDate).map(e=>{let[t,n=``]=String(e).split(` — `);return new c({children:[new l({children:[new r({children:[new a({text:t,bold:!0,size:22})]})]}),new l({children:[new r({children:[new a({text:n||`Sesi inti & latihan terapan`,size:22})]})]})]})})]}),M=i.get(`pg_insights_background`,null)||{},N=Array.isArray(M.differentiators)&&M.differentiators.length?M.differentiators.slice(0,3):[`Tenaga pengajar tersertifikasi`,`Metodologi berbasis studi kasus`,`Garansi pascapelatihan`],te=Array.isArray(M.outcomes)&&M.outcomes.length?M.outcomes.slice(0,4):[`Peserta memahami kerangka kerja`,`Peserta mampu mengaplikasikan`,`Perusahaan memiliki blueprint implementasi`],P=[new r({children:[new m]}),E(`Ringkasan Eksekutif`),new r({children:[new a({text:M.headline||e.title,bold:!0,size:26,color:C,font:T.heading})],spacing:{after:80}}),new r({children:[new a({text:`Disusun untuk ${e.company||`-`} • oleh ${e.organizer||`-`}${Y(e.startDate,e.endDate)?` • `+Y(e.startDate,e.endDate):``}`,italics:!0,size:20,color:`64748B`})],spacing:{after:200}}),new r({children:[new a({text:`MASALAH: `,bold:!0,size:22,color:`DC2626`}),new a({text:(i.get(`pg_proposal`,{}).topPainPoints||`Kesenjangan kompetensi inti yang menghambat pertumbuhan unit bisnis.`).split(`
`)[0],size:22})],spacing:{after:100}}),new r({children:[new a({text:`SOLUSI: `,bold:!0,size:22,color:`059669`}),new a({text:`${e.title} — intervensi pelatihan terstruktur dengan pendekatan studi kasus industri.`,size:22})],spacing:{after:200}}),new r({children:[new a({text:`MENGAPA KAMI (3 Pembeda)`,bold:!0,size:22,color:C})],spacing:{after:80}}),...N.map(e=>new r({children:[new a({text:`✓ `,bold:!0,color:`10B981`,size:22}),new a({text:e,size:22})],spacing:{after:80},indent:{left:200}})),new r({children:[new a({text:`HASIL TERUKUR YANG DIHARAPKAN`,bold:!0,size:22,color:C})],spacing:{before:200,after:80}}),...te.map(e=>new r({children:[new a({text:`• `,bold:!0,color:C,size:22}),new a({text:e,size:22})],spacing:{after:80},indent:{left:200}})),new r({children:[new a({text:`INVESTASI: `,bold:!0,size:24,color:C}),new a({text:e.pricePerPerson||`-`,bold:!0,size:24,color:`0F172A`}),new a({text:` /peserta`,size:22,color:`64748B`})],spacing:{before:240,after:80}})],ne=[new r({children:[new a({text:`05A`,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:`Mengapa Memilih Kami`,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}}),new r({children:[new a({text:`Lima pembeda yang membuat ${e.organizer||`kami`} mitra pilihan ${e.company||`klien`}:`,size:22})],spacing:{after:200}}),...(Array.isArray(M.differentiators)&&M.differentiators.length?M.differentiators.slice(0,5):[`Tenaga pengajar tersertifikasi BNSP`,`Metodologi blended (live + e-learning)`,`Studi kasus dari industri klien`,`Garansi pascapelatihan 30 hari`,`Sertifikat & laporan evaluasi`]).map((e,t)=>new r({children:[new a({text:`${[`🏅`,`🧪`,`📚`,`🛡️`,`📊`][t]||`✓`}  `,size:24}),new a({text:e,size:22,color:`0F172A`})],spacing:{after:100},indent:{left:200}})),new r({text:``,spacing:{after:360}})],F=[new r({children:[new a({text:`05B`,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:`Dampak & ROI yang Diharapkan`,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}}),new r({children:[new a({text:`Payback period investasi pelatihan biasanya 3-6 bulan melalui efisiensi, retensi, dan revenue:`,size:22})],spacing:{after:160}}),...(Array.isArray(M.outcomes)&&M.outcomes.length?M.outcomes.slice(0,5):[`Penurunan waktu onboarding dari 3 bulan ke 1 bulan`,`Peningkatan produktivitas tim 15-20% dalam 90 hari`,`Standarisasi SOP dan blueprint`,`Penghematan biaya rekrutmen`,`Persiapan audit/sertifikasi lebih cepat`]).map((e,t)=>new r({children:[new a({text:`↗ `,bold:!0,color:`10B981`,size:24}),new a({text:e,size:22})],spacing:{after:100},indent:{left:200}})),new r({text:``,spacing:{after:360}})],I=[...D,new r({children:[new m]}),...P,E(`Daftar Isi`),...O,new r({children:[new m]}),E(`Informasi Proposal`),...k,new r({children:[new m]}),...A(`01`,`Latar Belakang`,e.body.background),...A(`02`,`Deskripsi Pelatihan`,e.body.description),...ge(e),...A(`03`,`Tujuan`,e.body.objectives,X(e.body.objectives)),...A(`04`,`Peserta`,e.body.audience),...A(`05`,`Persyaratan Peserta`,e.body.requirements,X(e.body.requirements),!0),...ne,...F,new r({children:[new a({text:`06`,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:`Jadwal Pelaksanaan`,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}}),...e.venue?[new r({children:[new a({text:`Lokasi: `+e.venue,size:24})],spacing:{after:200}})]:[],j,new r({text:``,spacing:{after:400}}),new r({children:[new a({text:`07`,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:`Investasi`,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}}),ee,new r({text:``,spacing:{after:400}}),new r({children:[new a({text:`08`,bold:!0,size:64,color:C,font:T.heading})],spacing:{after:100}}),new r({children:[new a({text:`Fasilitas Peserta`,bold:!0,size:32,color:`0F172A`,font:T.heading})],heading:o.HEADING_2,spacing:{after:200},border:{bottom:{style:f.SINGLE,size:12,color:C,space:1}}}),...e.facilities.length?e.facilities.map(e=>new r({children:[new a({text:`✓  `,bold:!0,color:`10B981`,size:24}),new a({text:e,size:24,color:`334155`})],spacing:{after:120},indent:{left:200}})):[new r({children:[new a({text:`—`,size:24})]})],new r({text:``,spacing:{after:400}}),...A(`09`,`Penutup`,e.body.closing),...e.cta?[new r({children:[new a({text:e.cta||`Mari wujudkan bersama.`,bold:!0,color:`FFFFFF`,size:28})],shading:{type:p.CLEAR,fill:C,color:`auto`},spacing:{before:200,after:80},indent:{left:280,right:280}}),new r({children:[new a({text:`Masa berlaku penawaran: `,bold:!0,size:22,color:`0F172A`}),new a({text:U(H(14)),bold:!0,size:22,color:`DC2626`})],spacing:{after:80},indent:{left:280,right:280}}),new r({children:[new a({text:`Kontak Penjualan: `,bold:!0,size:22,color:`0F172A`}),new a({text:`${e.organizer||`Tim AE`} • WA 08XX-XXXX-XXXX • email@vendor.co.id`,size:22})],spacing:{after:80},indent:{left:280,right:280}}),new r({children:[new a({text:`Kontak Administrasi: `,bold:!0,size:22,color:`0F172A`}),new a({text:`Tim Admin Proyek • WA 08XX-XXXX-XXXX • admin@vendor.co.id`,size:22})],spacing:{after:240},indent:{left:280,right:280}}),new r({children:[new a({text:`Hormat kami,`,size:22})],indent:{left:280,right:280},spacing:{after:80}}),new r({text:``,spacing:{after:600}}),new r({children:[new a({text:e.organizer||`Account Executive`,bold:!0,size:26,color:`0F172A`})],indent:{left:280,right:280}}),new r({children:[new a({text:`Account Executive • ${e.organizer||``}`,italics:!0,size:20,color:`64748B`})],indent:{left:280,right:280}})]:[]];return new t({creator:`Proposal Generator`,title:e.title,styles:{default:{document:{run:{font:T.body,size:24}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1440,right:1440,bottom:1440,left:1440}}},headers:{default:new g({children:[new r({children:[new a({text:e.organizer||``,size:18,color:`94A3B8`})],alignment:d.RIGHT})]})},footers:{default:new _({children:[new r({tabStops:[{type:y.CENTER,position:4500},{type:y.RIGHT,position:9e3}],children:[new a({text:e.title,size:18,color:`94A3B8`}),new a({text:`	`}),new a({children:[`Hal. `,h.CURRENT,` dari `,h.TOTAL_PAGES],size:18,color:`94A3B8`})]})]})},children:I}]})}n();
//# sourceMappingURL=index-0Mw-z03a.js.map
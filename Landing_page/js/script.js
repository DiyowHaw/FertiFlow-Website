/* ==== FertiFlow Landing Page - script.js ==== */

/* ---------- KONFIGURASI: ganti dengan data asli aplikasi kamu ---------- */
const PLAY_STORE_URL = "https://www.canvaqr.com/RGVz-H-MjM"; // tautan unduh aplikasi; kalau diganti, buat ulang img/qr-unduh.png dengan isi yang sama
const APP_PACKAGE    = "com.fertiflow.app";  // nama package Android
const APP_SCHEME     = "fertiflow";          // deep link: fertiflow://<path>

/* ---------- Data pop-up fitur ---------- */
const FEATURES = {
  monitoring:{title:"Pemantauan Sensor",eyebrow:"Tab Beranda",path:"beranda",img:"../img/app-beranda.jpg",
    desc:"Lihat kelembapan tanah, suhu udara, dan kelembapan udara secara langsung, plus grafik tren 7 hari terakhir.",
    steps:["Buka aplikasi FertiFlow","Masuk ke tab Beranda","Gulir ke bagian Sensor & Kontrol dan Grafik Data Sensor"]},
  kontrol:{title:"Kontrol Pompa & Pestisida",eyebrow:"Tab IoT",path:"iot",img:"../img/app-iot.jpg",
    desc:"Nyalakan penyiraman tanaman, Pestisida A, atau Pestisida B dari jarak jauh. Perintah dikirim langsung ke ESP32 lewat Firebase.",
    steps:["Buka tab IoT","Cek level air tandon, pupuk, dan pestisida","Geser tombol di Kontrol Sistem untuk menyalakan"]},
  jadwal:{title:"Jadwal Air & Pupuk",eyebrow:"Tab Jadwal",path:"jadwal",img:"../img/app-jadwal.jpg",
    desc:"Buat jadwal penyiraman atau pemupukan dengan jam, volume liter, dan hari yang kamu pilih.",
    steps:["Buka tab Jadwal","Tekan Tambah Jadwal","Pilih Air atau Pupuk, atur waktu, volume, dan hari, lalu Simpan"]},
  diagnosis:{title:"Diagnosis Hama AI",eyebrow:"Tombol kamera",path:"diagnosis",img:"../img/app-diagnosis.jpg",
    desc:"Foto daun tanaman dan biarkan YOLOv8 mendeteksi penyakitnya, lengkap dengan kotak area infeksi dan skor keyakinan.",
    steps:["Tekan tombol kamera di pojok kanan bawah","Ambil foto atau pilih dari galeri","Tunggu hasil analisis, lalu tekan Lihat Solusi Penanganan"]},
  tangani:{title:"Tindakan Penanganan",eyebrow:"Tab Tangani",path:"tangani",img:"../img/app-tangani.jpg",
    desc:"Semua tanaman yang perlu ditangani terkumpul di satu tempat, dengan rekomendasi AI dan saran pestisida.",
    steps:["Buka tab Tangani","Ikuti langkah penanganan di kartu tanaman","Tekan Selesai setelah tanaman ditangani"]},
  aktivitas:{title:"Aktivitas Penyiraman",eyebrow:"Tab Beranda",path:"beranda",img:"../img/app-aktivitas.jpg",
    desc:"Pantau total liter air yang digunakan setiap hari selama 7 hari terakhir.",
    steps:["Buka tab Beranda","Gulir ke kartu Aktivitas Penyiraman","Lihat total liter dan grafik harian"]}
};

/* ---------- Mode terang / gelap ---------- */
const root = document.documentElement;
const THEME_KEY = "fertiflow-theme";
function readTheme(){ try{ return localStorage.getItem(THEME_KEY); }catch(e){ return null; } }
function saveTheme(v){ try{ localStorage.setItem(THEME_KEY, v); }catch(e){} }
function currentTheme(){
  const set = root.getAttribute("data-theme");
  if (set) return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
const savedTheme = readTheme();
if (savedTheme === "dark" || savedTheme === "light") root.setAttribute("data-theme", savedTheme);
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  saveTheme(next);
});

/* ---------- Link unduh aplikasi & QR ---------- */
document.querySelectorAll(".js-store").forEach(a => { a.href = PLAY_STORE_URL; a.target = "_blank"; a.rel = "noopener"; });

// Kode QR memakai gambar img/qr-unduh.png (lihat index.html), jadi tidak perlu library.

/* ---------- Modal fitur ---------- */
const modal = document.getElementById("featModal");
const isAndroid = /Android/i.test(navigator.userAgent);

function openFeature(key){
  const f = FEATURES[key]; if (!f) return;
  document.getElementById("mTitle").textContent = f.title;
  document.getElementById("mEyebrow").textContent = f.eyebrow;
  document.getElementById("mDesc").textContent = f.desc;
  const img = document.getElementById("mImg");
  img.src = f.img; img.alt = "Tampilan " + f.title + " di aplikasi FertiFlow";
  const steps = document.getElementById("mSteps");
  steps.innerHTML = "";
  f.steps.forEach(s => { const li = document.createElement("li"); li.textContent = s; steps.appendChild(li); });

  // Di HP Android: coba buka aplikasi via deep link; kalau belum terpasang, arahkan ke tautan unduh
  const open = document.getElementById("mOpen");
  open.href = isAndroid
    ? `intent://${f.path}#Intent;scheme=${APP_SCHEME};package=${APP_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`
    : PLAY_STORE_URL;
  open.textContent = isAndroid ? "Buka di Aplikasi" : "Unduh Aplikasi";
  open.target = isAndroid ? "_self" : "_blank";
  // Di desktop kedua tombol sama-sama ke tautan unduh, jadi cukup tampilkan satu
  document.getElementById("mStore").hidden = !isAndroid;

  modal.classList.remove("closing");
  if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
}

function closeModal(){
  if (!modal.open) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce){ modal.close(); return; }
  modal.classList.add("closing");
  setTimeout(() => { modal.classList.remove("closing"); modal.close(); }, 180);
}

document.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => openFeature(b.dataset.f)));
document.getElementById("mClose").addEventListener("click", closeModal);
// Klik di luar kotak (area gelap) menutup modal
modal.addEventListener("click", e => {
  const r = modal.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) closeModal();
});
modal.addEventListener("cancel", e => { e.preventDefault(); closeModal(); });

/* ---------- Simulasi diagnosis (3 tahap) ---------- */
const scan = document.getElementById("scan");
const runBtn = document.getElementById("runScan");
const rTitle = document.getElementById("rTitle"), rSub = document.getElementById("rSub"), rBadge = document.getElementById("rBadge");
const stageEls = [...document.querySelectorAll("#stages li")];
const progress = document.getElementById("progress");
let running = false;

runBtn.addEventListener("click", () => {
  if (running) return;
  running = true;
  const fast = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = fast ? 150 : 1100;

  scan.classList.remove("done", "idle"); scan.classList.add("run");
  rBadge.hidden = true; runBtn.disabled = true;
  rTitle.textContent = "Menganalisis…"; rSub.textContent = "YOLOv8 · memproses gambar";
  stageEls.forEach(li => li.className = "");
  progress.style.width = "0%";

  stageEls.forEach((li, i) => {
    setTimeout(() => {
      if (i > 0) stageEls[i - 1].className = "ok";
      li.className = "active";
      progress.style.width = ((i + 1) / stageEls.length * 100) + "%";
    }, i * step);
  });

  setTimeout(() => {
    stageEls.forEach(li => li.className = "ok");
    scan.classList.remove("run"); scan.classList.add("done");
    progress.style.width = "0%";
    rTitle.textContent = "Bercak Daun"; rSub.textContent = "Tingkat keyakinan: 91%"; rBadge.hidden = false;
    runBtn.disabled = false; runBtn.textContent = "↻ Ulangi simulasi";
    running = false;
  }, stageEls.length * step);
});

/* ---------- Fitur: tanaman cabai (gambar) dengan titik fitur ---------- */
(function(){
  const stage = document.getElementById("plantStage"), fig = document.getElementById("plantFig");
  if (!stage || !fig) return;
  const hs = [...stage.querySelectorAll(".hs")];

  // Di perangkat ber-mouse, tanaman sedikit miring mengikuti kursor
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    stage.addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect();
      fig.style.setProperty("--tx", ((e.clientX - r.left) / r.width - .5).toFixed(3));
      fig.style.setProperty("--ty", ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    stage.addEventListener("pointerleave", () => { fig.style.setProperty("--tx", 0); fig.style.setProperty("--ty", 0); });
  }

  // Pilih fitur: dari titik di tanaman atau dari tombol di bawah kartu
  const panels = [...document.querySelectorAll(".feat-panel")];
  const picks = [...document.querySelectorAll(".fpick")];
  function select(k){
    panels.forEach(p => p.hidden = p.dataset.k !== k);
    hs.forEach(b => b.classList.toggle("on", b.dataset.k === k));
    picks.forEach(b => { b.classList.toggle("on", b.dataset.k === k); b.setAttribute("aria-pressed", b.dataset.k === k); });
  }
  [...hs, ...picks].forEach(b => b.addEventListener("click", () => select(b.dataset.k)));
})();

/* ---------- Tampilan aplikasi: satu HP, layar berganti ---------- */
(function(){
  const imgs = [...document.querySelectorAll("#vPhone img")];
  const tabs = [...document.querySelectorAll("#vTabs button")];
  if (!imgs.length) return;
  tabs.forEach(t => t.addEventListener("click", () => {
    const i = +t.dataset.i;
    imgs.forEach((im, k) => im.classList.toggle("on", k === i));
    tabs.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", k === i); });
  }));
})();

/* ---------- Saran & masukan: kirim ke database lewat PHP ---------- */
(function(){
  const form = document.getElementById("saranForm");
  if (!form) return;
  const API = "../php/simpan_saran.php";
  const pesan = form.pesan, email = form.email, btn = document.getElementById("sKirim");
  const status = document.getElementById("sStatus");
  const err = { pesan: document.getElementById("sPesanErr"), email: document.getElementById("sEmailErr") };

  function setErr(name, text){
    err[name].textContent = text || ""; err[name].hidden = !text;
    form[name].classList.toggle("bad", !!text);
  }
  function setStatus(text, kind){ status.textContent = text; status.className = "f-status " + kind; status.hidden = !text; }
  [pesan, email].forEach(el => el.addEventListener("input", () => setErr(el.name, "")));

  form.addEventListener("submit", async e => {
    e.preventDefault();
    setStatus("", "");
    // Validasi di browser (server tetap memeriksa ulang)
    const p = pesan.value.trim(), em = email.value.trim();
    let ok = true;
    if (p.length < 10){ setErr("pesan", "Tulis saran minimal 10 karakter."); ok = false; } else setErr("pesan", "");
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ setErr("email", "Format email belum benar, contoh: nama@contoh.com"); ok = false; } else setErr("email", "");
    if (!ok){ (err.pesan.hidden ? email : pesan).focus(); return; }

    btn.disabled = true; btn.textContent = "Mengirim…";
    try{
      const res = await fetch(API, { method: "POST", body: new FormData(form) });
      const data = await res.json();          // gagal di sini kalau server tidak menjalankan PHP
      if (data.ok){
        form.reset();
        setStatus("Terima kasih! Saranmu sudah kami terima.", "ok");
      } else {
        if (data.errors){ Object.entries(data.errors).forEach(([k, v]) => err[k] && setErr(k, v)); }
        setStatus(data.message || "Saran belum terkirim. Periksa isian di atas.", "bad");
      }
    }catch(_){
      setStatus("Saran belum terkirim karena server tidak merespons. Coba lagi nanti.", "bad");
    }
    btn.disabled = false; btn.textContent = "Kirim saran";
  });
})();

/* ---------- Efek mouse & animasi muncul (hanya di perangkat ber-mouse) ---------- */
(function(){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Bagian halaman muncul halus saat di-scroll
  if (!reduce && "IntersectionObserver" in window){
    const els = document.querySelectorAll(".sec-head, .plant-wrap, .viewer, .demo > *, .faq details, .about > *, .dl-card, .strip .wrap");
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => { el.classList.add("rv"); io.observe(el); });
  }

  // Garis kemajuan baca di atas halaman
  const bar = document.createElement("div"); bar.className = "scroll-bar"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (reduce || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  // 1) Sorot cahaya di dalam kartu, mengikuti posisi kursor
  document.querySelectorAll(".feat-panel, .team-card, .faq details, .dl-card").forEach(card => {
    card.classList.add("spot");
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // 2) Ponsel di hero sedikit miring mengikuti kursor
  const stage = document.querySelector(".phone-stage"), phone = stage && stage.querySelector(".phone");
  if (phone){
    const hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      phone.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
      stage.style.setProperty("--px", x.toFixed(3)); stage.style.setProperty("--py", y.toFixed(3));
    });
    hero.addEventListener("pointerleave", () => { phone.style.transform = ""; stage.style.setProperty("--px", 0); stage.style.setProperty("--py", 0); });
  }

  // 3) Tombol utama sedikit "tertarik" ke kursor
  document.querySelectorAll(".btn-primary, .btn-light").forEach(b => {
    let r = null;                                   // ukuran tombol diambil sekali saat kursor masuk, supaya tombol tidak bergetar
    b.addEventListener("pointerenter", () => { r = b.getBoundingClientRect(); });
    b.addEventListener("pointermove", e => {
      if (!r) return;
      b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 5}px ${((e.clientY - r.top) / r.height - .5) * 4}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; r = null; });
  });
})();

/* ---------- Daftar akun ----------
   Saat ini hanya tampilan + validasi di browser. Database akun menyusul:
   kalau sudah ada, isi DAFTAR_API dengan alamat file PHP-nya, misalnya "../php/daftar.php" */
(function(){
  const DAFTAR_API = null;
  const dlg = document.getElementById("authModal");
  const openBtn = document.getElementById("authOpen");
  const f = document.getElementById("formDaftar");
  const head = document.getElementById("authHead"), done = document.getElementById("daftarSukses");
  if (!dlg || !openBtn || !f) return;

  // Setelah daftar berhasil: sembunyikan form, tampilkan QR untuk unduh aplikasi
  function showDone(nama, demo){
    document.getElementById("doneNama").textContent = nama;
    document.getElementById("doneNote").hidden = !demo;
    head.hidden = true; f.hidden = true; done.hidden = false;
    done.querySelector(".btn").focus();
  }
  function showForm(){
    head.hidden = false; f.hidden = false; done.hidden = true;
  }

  function open(){
    dlg.classList.remove("closing");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    if (!done.hidden){ f.reset(); status(""); showForm(); }   // buka lagi setelah daftar: mulai dari form kosong
    f.nama.focus();
  }
  function close(){
    if (!dlg.open) return;
    dlg.classList.add("closing");
    setTimeout(() => { dlg.classList.remove("closing"); dlg.close(); }, 180);
  }
  openBtn.addEventListener("click", open);
  document.getElementById("authClose").addEventListener("click", close);
  dlg.addEventListener("click", e => { if (e.target === dlg) close(); });       // klik di luar kotak
  dlg.addEventListener("cancel", e => { e.preventDefault(); close(); });        // tombol Esc

  // Tombol "Lihat" kata sandi
  dlg.querySelectorAll(".pw-eye").forEach(b => b.addEventListener("click", () => {
    const inp = b.previousElementSibling, lihat = inp.type === "password";
    inp.type = lihat ? "text" : "password";
    b.textContent = lihat ? "Sembunyi" : "Lihat";
    b.setAttribute("aria-label", lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
  }));

  // Validasi
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isHP = v => /^(\+62|62|0)8[0-9]{7,12}$/.test(v.replace(/[\s-]/g, ""));
  function setErr(inp, text){ const e = inp.closest(".f-row").querySelector(".f-err"); e.textContent = text || ""; e.hidden = !text; inp.classList.toggle("bad", !!text); }
  function status(text, kind){ const s = f.querySelector(".f-status"); s.textContent = text; s.className = "f-status " + (kind || ""); s.hidden = !text; if (text) s.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  f.querySelectorAll("input").forEach(i => i.addEventListener("input", () => setErr(i, "")));

  f.addEventListener("submit", async e => {
    e.preventDefault(); status("");
    let ok = true;
    if (f.nama.value.trim().length < 3){ setErr(f.nama, "Tulis nama minimal 3 huruf."); ok = false; }
    const v = f.akun.value.trim();
    if (!v){ setErr(f.akun, "Isi email atau nomor HP."); ok = false; }
    else if (!isEmail(v) && !isHP(v)){ setErr(f.akun, "Tulis email (nama@contoh.com) atau nomor HP (08xxxxxxxxxx)."); ok = false; }
    if (f.password.value.length < 8){ setErr(f.password, "Kata sandi minimal 8 karakter."); ok = false; }
    if (!f.password2.value || f.password2.value !== f.password.value){ setErr(f.password2, "Kata sandi belum sama."); ok = false; }
    if (!ok){ f.querySelector(".bad").focus(); return; }

    const nama = f.nama.value.trim();
    if (!DAFTAR_API){ showDone(nama, true); return; }   // database belum ada: langsung ke langkah QR (mode uji)
    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Memproses…";
    try{
      const res = await fetch(DAFTAR_API, { method: "POST", body: new FormData(f) });
      const data = await res.json();
      if (data.ok) showDone(nama, false);
      else status(data.message || "Pendaftaran gagal, periksa isian kamu.", "bad");
    }catch(_){ status("Server tidak merespons. Coba lagi nanti.", "bad"); }
    btn.disabled = false; btn.textContent = "Buat akun";
  });
})();

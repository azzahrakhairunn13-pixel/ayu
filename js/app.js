(() => {
  const app = document.getElementById("app");
  const KEY = "caritepat_v1";
  const MAX_ASK = 10; // batas pertanyaan ke asisten AI per hari (di perangkat)
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Data belajar siswa (disimpan di browser) ----------
  const fresh = () => ({ xp: 0, streak: 0, last: "", video: {}, misc: {}, chat: { h: "", n: 0 }, pre: null, post: null });
  const load = () => { try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY))); } catch (e) { return fresh(); } };
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const count = o => Object.keys(o).length;

  // ---------- Streak harian ----------
  const day = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  (function tick() {
    const now = new Date(), y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (S.last !== day(now)) { S.streak = S.last === day(y) ? S.streak + 1 : 1; S.last = day(now); save(); }
  })();
  const askUsed = () => (S.chat && S.chat.h === day(new Date()) ? S.chat.n : 0);

  // ---------- XP ----------
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function award(n, why) {
    S.xp += n; save();
    toast("+" + n + " XP  " + why);
    const c = document.querySelector(".chips");
    if (c) c.innerHTML = chips();
  }
  function once(group, key, n, why) {
    if (S[group][key]) return false;
    S[group][key] = 1; award(n, why); return true;
  }

  const chips = () => `<span class="chip">🔥 ${S.streak}</span><span class="chip">⭐ ${S.xp}</span>`;
  const bar = (title, back) => `<header class="bar">${back ? '<a class="back" href="#/" aria-label="Kembali ke beranda">←</a>' : ""}<h1>${title}</h1><div class="chips">${chips()}</div></header>`;

  // ---------- Beranda ----------
  function home() {
    const lv = Math.floor(S.xp / 100) + 1, pct = S.xp % 100;
    // Tahapan dibuka berurutan: pre-test → video → lab → asisten AI → post-test
    const preDone = !!S.pre, videoDone = count(S.video) > 0, labDone = !!S.misc.lab, aiDone = !!S.misc.chat;
    const items = [
      { cls: "c1", ikon: "📝", nama: "Pre-test", sub: S.pre ? `Skor ${S.pre.s}/${S.pre.n} ✓` : "Cek kemampuan awal", href: "#/tes/pre", open: true },
      { cls: "c3", ikon: "🎬", nama: "Video Penjelasan", sub: `${count(S.video)}/${DATA.VIDEOS.length} ditonton`, href: "#/video", open: preDone, hint: "Selesaikan Pre-test dulu" },
      { cls: "c4", ikon: "🧪", nama: "Lab Racik", sub: "Racik kata kunci Google-mu", href: "#/lab", open: preDone && videoDone, hint: "Tonton minimal satu video dulu" },
      { cls: "c6", ikon: "🤖", nama: "Tanya Asisten AI", sub: `${askUsed()}/${MAX_ASK} pertanyaan hari ini`, href: "#/tanya", open: labDone || !!S.post, hint: "Coba Lab Racik dulu" },
      { cls: "c5", ikon: "🏆", nama: "Post-test", sub: S.post ? `Skor ${S.post.s}/${S.post.n} ✓` : "Buktikan hasil belajarmu", href: "#/tes/post", open: aiDone || !!S.post, hint: "Tanya asisten dulu", wide: true }
    ];
    const card = i => {
      const cls = `menu ${i.cls}${i.wide ? " wide" : ""}`;
      const isi = `<span class="tile">${i.ikon}</span><span><b>${i.nama}</b><small>${i.open ? i.sub : i.hint}</small></span>`;
      return i.open
        ? `<a class="${cls}" href="${i.href}">${isi}</a>`
        : `<span class="${cls} locked" aria-disabled="true"><span class="badge">🔒</span>${isi}</span>`;
    };
    app.innerHTML = bar(esc(DATA.NAMA), false) + `<main>
      <section class="card hero"><h2>Halo! 👋</h2><p class="muted">${esc(DATA.SLOGAN)}</p><p class="muted">${esc(DATA.TUJUAN)}</p></section>
      <section class="card level"><div class="row"><span>Level ${lv}</span><span>${pct}/100 XP</span></div><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div></section>
      <section class="grid">${items.map(card).join("")}</section>
      ${S.pre && S.post ? `<section class="card banner"><b>Hasil belajarmu</b><p class="muted">Skor pre-test ${S.pre.s}/${S.pre.n}, post-test ${S.post.s}/${S.post.n}. ${S.post.s > S.pre.s ? "Naik " + (S.post.s - S.pre.s) + " poin, keren! 🎉" : "Terus berlatih ya! 💪"}</p></section>` : ""}
      <button class="link" id="reset">Hapus data belajar di perangkat ini</button></main>`;
    document.getElementById("reset").onclick = () => { if (confirm("Hapus semua XP, skor, dan progres?")) { S = fresh(); save(); chatLog = [sapa()]; chatHist = []; location.hash = "#/"; home(); } };
  }

  // ---------- Video ----------
  function video() {
    let term = "";
    app.innerHTML = bar("Video Penjelasan", true) + `<main>
      <section id="pw" hidden><div class="ratio"><iframe id="pl" title="Pemutar video" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe></div><p id="pt"><b></b></p></section>
      <input type="search" id="q" placeholder="Cari video..." aria-label="Cari video" autocomplete="off">
      <p class="muted" id="info"></p><div class="vgrid" id="list"></div></main>`;
    const hl = (t, w) => w ? esc(t).replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>") : esc(t);
    function draw() {
      const w = term.trim().toLowerCase();
      const hasil = DATA.VIDEOS.map((v, i) => ({ v, i })).filter(x => !w || (x.v.judul + " " + x.v.deskripsi + " " + (x.v.kata || "")).toLowerCase().includes(w));
      document.getElementById("list").innerHTML = hasil.map(x => `<button class="card vcard" data-i="${x.i}"><img loading="lazy" alt="" src="https://img.youtube.com/vi/${x.v.id}/hqdefault.jpg"><div class="t"><b>${hl(x.v.judul, w)}</b><span class="muted">${hl(x.v.deskripsi, w)}</span>${S.video[x.i] ? '<div class="seen">✓ Sudah ditonton</div>' : ""}</div></button>`).join("");
      document.getElementById("info").textContent = hasil.length ? (w ? hasil.length + " video ditemukan" : DATA.VIDEOS.length + " video tersedia") : "Tidak ada video untuk \"" + term.trim() + "\". Coba kata kunci lain.";
      document.querySelectorAll(".vcard").forEach(b => b.onclick = () => {
        const v = DATA.VIDEOS[b.dataset.i];
        document.getElementById("pl").src = "https://www.youtube.com/embed/" + v.id + "?autoplay=1";
        document.querySelector("#pt b").textContent = v.judul;
        document.getElementById("pw").hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (once("video", b.dataset.i, 10, "video ditonton")) draw();
      });
    }
    document.getElementById("q").oninput = e => { term = e.target.value; draw(); };
    draw();
  }

  // ---------- Lab Racik: racik kata kunci Google ----------
  function lab() {
    const L = DATA.LAB;
    let mapel = 0, topik = "";
    const ops = {};
    L.OPERATOR.forEach(o => { ops[o.kunci] = !!o.aktif; });

    const orQuery = () => '(soal OR "kisi-kisi")';

    app.innerHTML = bar(esc(L.judul), true) + `<main class="labpage">
      <section class="card hero"><p class="muted">${esc(L.deskripsi)}</p></section>
      <section>
        <div class="labhead"><span class="labnum">1</span><h2>Pilih Mata Pelajaran TKA SMP</h2></div>
        <div class="subjects" id="subjects">${L.MAPEL.map((m, i) => `<button type="button" class="subject${i === 0 ? " on" : ""}" data-i="${i}"><b>${m.ikon} ${esc(m.nama)}</b><small>${esc(m.ket)}</small></button>`).join("")}</div>
      </section>
      <section>
        <div class="labhead"><span class="labnum">2</span><h2>Pilih Fokus Topik <span class="muted">(opsional)</span></h2></div>
        <div class="topics" id="topics"></div>
      </section>
      <section>
        <div class="labhead"><span class="labnum">3</span><h2>Tambahkan Jurus Penyaring Google</h2></div>
        <div class="ops" id="ops">${L.OPERATOR.map(o => `<button type="button" class="op${ops[o.kunci] ? " on" : ""}" data-k="${o.kunci}"><span class="ohead"><code>${esc(o.label)}</code><span class="state">${ops[o.kunci] ? "AKTIF" : "MATI"}</span></span><small>${esc(o.ket)}</small></button>`).join("")}</div>
      </section>
      <section class="result">
        <div class="rhead"><span>🔍 Hasil Racikan Kata Kunci</span><button type="button" class="rreset" id="reset">Reset</button></div>
        <code id="query"></code>
        <div class="explain" id="explain"></div>
        <div class="resbtns"><button type="button" class="btn" id="go">🚀 Uji Coba di Google</button><button type="button" class="btn ghost" id="copy">📋 Salin</button></div>
      </section>
    </main>`;

    function renderTopics() {
      const m = L.MAPEL[mapel], list = [m.semua, ...m.topik], box = document.getElementById("topics");
      box.innerHTML = list.map((t, i) => `<button type="button" class="topic${(i === 0 ? !topik : topik === t) ? " on" : ""}" data-t="${i}">${esc(t)}</button>`).join("");
      box.querySelectorAll(".topic").forEach(b => b.onclick = () => {
        topik = +b.dataset.t === 0 ? "" : list[+b.dataset.t];
        renderTopics(); updateResult();
      });
    }

    function syncSubjects() {
      document.querySelectorAll(".subject").forEach(b => b.classList.toggle("on", +b.dataset.i === mapel));
    }

    function syncOps() {
      document.querySelectorAll(".op").forEach(b => {
        const on = !!ops[b.dataset.k];
        b.classList.toggle("on", on);
        b.querySelector(".state").textContent = on ? "AKTIF" : "MATI";
      });
    }

    function updateResult() {
      const m = L.MAPEL[mapel], parts = [], tips = [];
      if (ops.quote) {
        parts.push(`"${m.frasa}"`);
        tips.push(`Tanda petik <b>"${esc(m.frasa)}"</b> mengunci frasa utama agar tidak dipecah.`);
      } else parts.push(m.frasa);
      if (ops.and) {
        parts.push("AND SMP");
        tips.push("<b>AND SMP</b> memaksa Google hanya menampilkan hasil yang memuat jenjang SMP.");
      } else parts.push("SMP");
      if (topik) {
        parts.push(topik.includes(" ") && !topik.endsWith("*") ? `"${topik}"` : topik);
        if (topik.endsWith("*")) tips.push(`Tanda bintang pada <b>${esc(topik)}</b> mencari semua variasi kata dasarnya.`);
      }
      if (ops.or) {
        parts.push(orQuery());
        tips.push(`<b>${orQuery()}</b> mengumpulkan latihan soal maupun kisi-kisi sekaligus.`);
      }
      if (ops.not) {
        parts.push("-SMA -UTBK");
        tips.push("<b>-SMA -UTBK</b> membuang artikel ujian tingkat SMA dan kuliah.");
      }
      if (ops.pdf) {
        parts.push("filetype:pdf");
        tips.push("<b>filetype:pdf</b> menyaring hasil agar hanya memunculkan berkas PDF.");
      }
      if (ops.site) {
        parts.push("site:go.id");
        tips.push("<b>site:go.id</b> membatasi sumber hanya dari situs resmi pemerintah.");
      }
      const q = parts.join(" ");
      document.getElementById("query").textContent = q;
      document.getElementById("explain").innerHTML = tips.length
        ? `<div class="etitle">💡 Cara Kerja Perintah Ini di Google:</div>` + tips.map(t => "• " + t).join("<br>")
        : "💡 Ini pencarian standar tanpa penyaring tambahan. Nyalakan jurus di atas agar hasilnya lebih akurat!";
      return q;
    }

    document.querySelectorAll(".subject").forEach(b => b.onclick = () => {
      mapel = +b.dataset.i; topik = "";
      syncSubjects(); renderTopics(); updateResult();
    });
    document.querySelectorAll(".op").forEach(b => b.onclick = () => {
      ops[b.dataset.k] = !ops[b.dataset.k];
      syncOps(); updateResult();
    });
    document.getElementById("reset").onclick = () => {
      mapel = 0; topik = "";
      L.OPERATOR.forEach(o => { ops[o.kunci] = !!o.aktif; });
      syncSubjects(); renderTopics(); syncOps(); updateResult();
      toast("Racikan direset ke pengaturan awal");
    };
    function markLab(beriTahu) {
      if (!S.misc.lab) {
        S.misc.lab = 1; save();
        if (beriTahu !== false) toast("Lab Racik selesai ✓ Asisten AI terbuka");
      }
    }
    document.getElementById("go").onclick = () => {
      const q = updateResult();
      window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener,noreferrer");
      markLab();
    };
    document.getElementById("copy").onclick = async () => {
      const q = updateResult();
      try {
        await navigator.clipboard.writeText(q);
        markLab(false);
        toast("Kata kunci disalin ✓");
      } catch (e) {
        const t = document.createElement("textarea");
        t.value = q; t.setAttribute("readonly", "");
        t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); markLab(false); toast("Kata kunci disalin ✓"); }
        catch (err) { toast("Gagal menyalin, blok teksnya manual ya"); }
        t.remove();
      }
    };

    renderTopics(); updateResult();
  }

  // ---------- Tanya Asisten AI (Gemini lewat /api/chat) ----------
  const sapa = () => ({ r: "a", t: "Halo! Aku asisten belajarmu 🤖 Aku hanya menjawab soal materi di situs ini: kata kunci, operator pencarian, memilih sumber, dan menilai sumber. Jawaban soal pre-test/post-test tidak akan kukasih — tapi aku bantu kamu menemukan caranya." });
  let chatLog = [sapa()];
  let chatHist = [];

  function chat() {
    const saran = ["Apa itu kata kunci?", "Kapan pakai tanda kutip?", "Bagaimana cara cek hoaks?"];
    app.innerHTML = bar("Tanya Asisten AI", true) + `<main class="chatpage">
      <div class="cm" id="cm" aria-live="polite"></div>
      <div class="sug" id="sug">${saran.map(s => `<button type="button">${esc(s)}</button>`).join("")}</div>
      <p class="muted small" id="cl"></p>
      <form class="sform cf" id="cf"><input type="text" id="ci" maxlength="500" placeholder="Tulis pertanyaanmu..." aria-label="Pertanyaan" autocomplete="off"><button class="btn" id="cs">Kirim</button></form></main>`;
    const box = document.getElementById("cm"), input = document.getElementById("ci"), sendBtn = document.getElementById("cs");
    const paint = () => { box.innerHTML = chatLog.map(m => `<div class="m ${m.r}">${esc(m.t)}</div>`).join(""); box.scrollTop = box.scrollHeight; };
    const limitInfo = () => { document.getElementById("cl").textContent = "Sisa pertanyaan hari ini: " + Math.max(0, MAX_ASK - askUsed()) + ". Jawaban AI bisa keliru, cek lagi di sumber terpercaya."; };

    async function kirim(pesan) {
      pesan = pesan.trim(); if (!pesan) return;
      if (askUsed() >= MAX_ASK) { chatLog.push({ r: "a", t: "Batas pertanyaan hari ini sudah habis. Lanjut belajar dari materi dulu, besok tanya lagi ya! 📚" }); return paint(); }
      chatLog.push({ r: "u", t: pesan });
      const w = { r: "a", t: "Sedang berpikir..." }; chatLog.push(w); paint();
      S.chat = { h: day(new Date()), n: askUsed() + 1 }; save();
      once("misc", "chat", 5, "bertanya ke asisten"); limitInfo();
      input.value = ""; sendBtn.disabled = true;
      try {
        const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pesan, riwayat: chatHist }) });
        const d = await r.json();
        w.t = d.jawaban || "Maaf, coba lagi ya.";
        chatHist.push({ peran: "user", teks: pesan }, { peran: "model", teks: w.t }); chatHist = chatHist.slice(-6);
      } catch (e) { w.t = "Tidak bisa terhubung. Cek koneksi internetmu ya."; }
      if (document.getElementById("cm") === box) { paint(); sendBtn.disabled = false; }
    }
    document.getElementById("cf").onsubmit = e => { e.preventDefault(); kirim(input.value); };
    document.querySelectorAll("#sug button").forEach(b => b.onclick = () => kirim(b.textContent));
    paint(); limitInfo();
  }

  // ---------- Pre-test / Post-test ----------
  function quiz(type) {
    if (type !== "pre" && type !== "post") return home();
    const Q = type === "pre" ? DATA.PRETEST : DATA.POSTTEST, name = type === "pre" ? "Pre-test" : "Post-test";
    let i = 0, score = 0;
    const done = () => {
      app.innerHTML = bar(name, true) + `<main class="center"><div class="score">${S[type].s}/${S[type].n}</div><p><b>${name} selesai!</b></p><p class="muted">${type === "pre" ? "Lanjutkan dengan materi, video, simulasi, dan asisten AI." : (S.pre ? "Skor pre-test kamu " + S.pre.s + "/" + S.pre.n + ", sekarang " + S.post.s + "/" + S.post.n + "." : "")}</p><a class="btn full" style="display:grid;place-items:center" href="#/">Kembali ke beranda</a></main>`;
    };
    if (S[type]) return done();
    function ask() {
      const q = Q[i];
      app.innerHTML = bar(name, true) + `<main><div class="prog"><span>Soal ${i + 1} dari ${Q.length}</span><span>${Math.round(i / Q.length * 100)}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${i / Q.length * 100}%"></div></div>
        <h2 class="q">${esc(q.q)}</h2>${q.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join("")}<div id="after"></div></main>`;
      app.querySelectorAll(".opt").forEach(b => b.onclick = () => {
        const k = +b.dataset.k; if (k === q.a) score++;
        app.querySelectorAll(".opt").forEach(x => x.disabled = true);
        let html;
        if (type === "post") {
          b.classList.add(k === q.a ? "right" : "wrong");
          app.querySelector(`.opt[data-k="${q.a}"]`).classList.add("right");
          html = `<div class="fb ${k === q.a ? "ok" : "bad"}">${k === q.a ? "✅ Benar! " : "❌ Belum tepat. "}${esc(q.e)}</div>`;
        } else { b.classList.add("pick"); html = ""; } // pre-test tidak menampilkan kunci agar hasil penelitian tidak terpengaruh
        document.getElementById("after").innerHTML = html + `<button class="btn full" id="nx">${i === Q.length - 1 ? "Lihat hasil" : "Lanjut"}</button>`;
        document.getElementById("nx").onclick = () => {
          if (++i < Q.length) return ask();
          S[type] = { s: score, n: Q.length, t: Date.now() }; save();
          award(score * 10, name + " selesai"); done();
        };
      });
    }
    ask();
  }

  // ---------- Router ----------
  function route() {
    const [p, a] = (location.hash.slice(2) || "").split("/");
    ({ video, lab, tanya: chat, tes: () => quiz(a) }[p] || home)();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();

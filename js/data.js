// ===== SEMUA ISI WEBSITE ADA DI FILE INI. Edit di sini, tidak perlu menyentuh app.js =====
const DATA = {
  NAMA: "CariTepat",
  SLOGAN: "Belajar strategi menelusuri informasi",
  TUJUAN: "Setelah belajar, kamu bisa menentukan kata kunci, memakai operator pencarian, dan menilai apakah sebuah sumber layak dipercaya.",

  // ---------- VIDEO: ganti id dengan kode setelah "v=" di link YouTube ----------
  VIDEOS: [
    { id: "spkuG5JQMBM", judul: "3 Kata Ajaib Google Cari Soal TKA", deskripsi: "Dasar-dasar mencari informasi di internet", kata: "dasar pengertian literasi" },
    { id: "VAy2_gp91qQ", judul: "Tanda Petik dan Pemenggalan Kata", deskripsi: "Cara membuat kata kunci agar hasil tepat", kata: "keyword google search" },
    { id: "nzAViSW75ek", judul: "4 Strategi Penelusuran Informasi", deskripsi: "Tips Mencari Informasi TKA dengan Lebih Cepat", kata: "keyword google search" },
    { id: "Qr6ypCKSRAE", judul: "kisi-kisi TKA matematika terbaru", deskripsi: "cara cari di Google biar gak salah", kata: "hoaks sumber valid" }
  ],

  // ---------- LAB RACIK: racik kata kunci Google untuk TKA SMP ----------
  LAB: {
    judul: "Lab Racik",
    deskripsi: "Pilih mata pelajaran TKA SMP, lalu nyalakan jurus penyaring. Lihat bagaimana kata kunci Google dirangkai otomatis sebelum kamu mencobanya langsung.",
    MAPEL: [
      { kunci: "mtk", ikon: "📐", nama: "Matematika", ket: "Aljabar, Geometri, Numerasi", frasa: "TKA Matematika", semua: "Semua Bab",
        topik: ["Aljabar", "Geometri", "Numerasi", "hitung*"] }
    ],
    OPERATOR: [
      { kunci: "quote", label: '"..." (Tanda Petik)', ket: "Mengunci frasa TKA agar urutannya tidak diacak Google.", aktif: true },
      { kunci: "and", label: "AND SMP", ket: "Wajib memuat materi TKA sekaligus jenjang SMP.", aktif: true },
      { kunci: "or", label: '(soal OR "kisi-kisi")', ket: "Memperluas hasil dengan mencari dua istilah sekaligus.", aktif: false },
      { kunci: "not", label: "-SMA -UTBK", ket: "Membuang soal TKA tingkat SMA & seleksi kuliah.", aktif: true },
      { kunci: "pdf", label: "filetype:pdf", ket: "Langsung mencari dokumen PDF siap download/print.", aktif: false },
      { kunci: "site", label: "site:go.id", ket: "Membatasi sumber hanya dari situs resmi pemerintah.", aktif: false }
    ]
  },

  // ---------- PRE-TEST dan POST-TEST (a = indeks jawaban benar, mulai dari 0) ----------
  PRETEST: [
    { q: "Apa yang sebaiknya dilakukan pertama kali sebelum mencari informasi?", o: ["Langsung mengetik di mesin pencari", "Menentukan apa yang ingin dicari", "Membuka banyak tab sekaligus"], a: 1, e: "Pertanyaan yang jelas mengarahkan pilihan kata kunci." },
    { q: "Kata kunci paling tepat untuk mencari penyebab banjir di Jakarta adalah...", o: ["banjir", "penyebab banjir Jakarta", "Jakarta"], a: 1, e: "Kata kunci yang spesifik menghasilkan pencarian yang lebih tepat." },
    { q: "Tanda kutip \"...\" pada pencarian berfungsi untuk...", o: ["Menghapus hasil pencarian", "Mencari frasa persis", "Mencari gambar saja"], a: 1, e: "Tanda kutip mencari kata sesuai urutan yang ditulis." },
    { q: "Ciri sumber informasi yang bisa dipercaya adalah...", o: ["Penulis dan tanggal terbit jelas", "Banyak iklan", "Judul memakai huruf kapital semua"], a: 0, e: "Penulis dan tanggal membuat sumber bisa dilacak." },
    { q: "Pencarian \"jaguar -mobil\" bertujuan untuk...", o: ["Mengecualikan kata \"mobil\"", "Menambah kata \"mobil\"", "Mengurutkan hasil"], a: 0, e: "Tanda minus membuang hasil yang memuat kata tersebut." }
  ],
  POSTTEST: [
    { q: "Kamu ingin tahu cara kerja vaksin. Kata kunci yang paling tepat adalah...", o: ["vaksin", "cara kerja vaksin", "vaksin dokter"], a: 1, e: "Kata kunci mencerminkan pertanyaan yang ingin dijawab." },
    { q: "Operator site:go.id berfungsi untuk...", o: ["Membatasi hasil pada situs pemerintah", "Mencari lokasi", "Menerjemahkan halaman"], a: 0, e: "site: membatasi hasil pada situs atau domain tertentu." },
    { q: "Kamu menemukan berita mengejutkan tanpa penulis dan sumber. Sebaiknya...", o: ["Langsung membagikannya", "Mengeceknya di sumber lain yang terpercaya", "Membaca komentarnya saja"], a: 1, e: "Informasi perlu dicek silang sebelum dipercaya atau dibagikan." },
    { q: "Operator filetype:pdf menghasilkan...", o: ["Hasil berupa dokumen PDF", "Penghapusan berkas PDF", "Unduhan semua berkas"], a: 0, e: "filetype: membatasi jenis berkas yang muncul." },
    { q: "Hasil pencarian terlalu banyak dan tidak relevan. Sebaiknya...", o: ["Menambah kata kunci yang lebih spesifik", "Menutup browser", "Memakai kata yang lebih umum"], a: 0, e: "Kata kunci lebih spesifik mempersempit hasil." }
  ]
};

## Fertigation Inteligation and Irrigation System (FertiFlow)

FertiFlow adalah situs informasi dan promosi untuk sistem fertigasi cerdas yang ditujukan bagi petani cabai. Situs ini menjelaskan pemantauan sensor, kontrol penyiraman dan pemupukan, jadwal otomatis, serta diagnosis penyakit daun berbasis AI; tetapi fitur-fitur tersebut dipaparkan sebagai bagian dari aplikasi dan perangkat FertiFlow, bukan diimplementasikan sebagai sistem IoT atau model AI di repositori ini.

### Stack
- **Bahasa:** HTML, CSS, JavaScript, PHP, dan SQL; ada pula JavaScript JSX untuk prototipe admin.
- **Framework / runtime:** Landing page berbasis HTML/CSS/JavaScript biasa; backend formulir memakai PHP dan PDO; folder admin memakai React 19 dan Vite.
- **Dependensi penting:** React, React DOM, Vite, dan plugin React untuk Vite. Landing page tidak memiliki dependensi npm yang terpasang dalam `package-lock.json`.

## Susunan proyek

```text
Landing_page/
  index.html       Pengalihan ke halaman utama di html/
  html/            Landing page FertiFlow dan konten fiturnya
  css/             Gaya, tata letak responsif, tema terang/gelap, animasi
  js/              Interaksi halaman, simulasi diagnosis, dan pengiriman saran
  img/             Logo, QR unduhan, screenshot aplikasi, ilustrasi tanaman
  php/             Koneksi database dan endpoint penyimpanan saran
  database/        Skema SQL untuk database dan tabel saran

admin_fertiflow/
  admin.html       Dokumen HTML yang memuat aplikasi React
  src/             Entry point React dan komponen App
  public/          Ikon SVG untuk halaman admin
  package.json     Skrip dan dependensi React/Vite
  vite.config.js   Konfigurasi Vite dengan plugin React

README             Kosong; belum berisi dokumentasi proyek
```

### Cara kerja dan fitur

**Landing page** ada di `Landing_page/html/index.html`; `Landing_page/index.html` hanya mengalihkan pengunjung ke sana. Halaman utama menyajikan bagian fitur, tampilan aplikasi, demo diagnosis, FAQ, informasi tim, formulir saran, dan ajakan mengunduh aplikasi.

Fitur yang dijelaskan secara spesifik di situs:

1. **Pemantauan sensor:** kelembapan tanah, suhu udara, kelembapan udara, grafik data, aktivitas penyiraman, dan level tandon.
2. **Kontrol perangkat:** penyiraman serta kontrol pestisida dari jarak jauh; deskripsi situs menyebut ESP32 dan Firebase.
3. **Jadwal:** pengaturan hari, waktu, jenis tindakan, dan volume air atau pupuk.
4. **Diagnosis tanaman:** alur yang dijelaskan menggunakan YOLOv8 untuk menandai area penyakit dan menampilkan tingkat keyakinan.
5. **Penanganan:** daftar langkah perawatan dan rekomendasi yang dapat ditandai selesai.
6. **Aktivitas penyiraman:** ringkasan pemakaian air dan grafik aktivitas.

Interaksi landing page dijalankan oleh `Landing_page/js/script.js`: pengguna dapat mengganti tema, memilih kartu fitur dan screenshot aplikasi, membuka modal fitur, serta menjalankan **simulasi** tahapan diagnosis. Simulasi tersebut bersifat tampilan front-end; kode situs menampilkan hasil contoh “Bercak Daun” dengan keyakinan 91%, bukan memanggil model AI untuk menganalisis gambar.

Formulir saran berbeda karena memang memiliki backend: JavaScript mengirim data ke `Landing_page/php/simpan_saran.php`. Endpoint memeriksa metode POST, memvalidasi nama/email/pesan, lalu menyimpan pesan menggunakan prepared statement PDO. Skema tabel `saran` berada di `Landing_page/database/saran.sql`; konfigurasi koneksi bawaan di `koneksi.php` ditujukan untuk MySQL/XAMPP, dengan opsi DSN melalui variabel `FF_DB_DSN`.

**Batas implementasi yang penting:** pendaftaran akun pada landing page masih berupa simulasi validasi di browser; `DAFTAR_API` bernilai `null` dan tidak ada penyimpanan akun. Folder `admin_fertiflow` juga belum menunjukkan dashboard pengelolaan FertiFlow: `src/App.jsx` masih berisi contoh bawaan React/Vite dengan penghitung tombol dan tautan dokumentasi. Karena itu, deskripsi ESP32, Firebase, diagnosis YOLOv8, dan aplikasi Android pada situs merupakan gambaran produk yang dipromosikan, bukan bukti bahwa implementasi sistem tersebut tersedia di repo ini.

## Cara menjalankan

**Landing page** dapat disajikan dengan server PHP lokal. Agar formulir saran berfungsi, siapkan PHP dengan PDO MySQL, impor skema SQL, dan sesuaikan kredensial database di `Landing_page/php/koneksi.php` bila perlu.

```bash
cd Landing_page
php -S localhost:8000
```

Buka `http://localhost:8000`; halaman akan mengalihkan ke `html/index.html`. Jika hanya ingin melihat tampilan, file HTML juga dapat dibuka sebagai situs statis, tetapi pengiriman saran membutuhkan server PHP dan database.

Untuk proyek admin, skrip yang tersedia adalah `dev`, `build`, `lint`, dan `preview` di `admin_fertiflow/package.json`. Namun, entry HTML bernama `admin.html`, bukan `index.html`, dan konfigurasi Vite tidak menetapkan entry khusus. Jadi, jangan menganggap perintah build standar sudah terkonfigurasi dengan baik; halaman admin saat ini juga masih berupa starter React/Vite, bukan portal admin FertiFlow.

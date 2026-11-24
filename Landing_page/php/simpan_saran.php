<?php
/* =========================================================
   simpan_saran.php — menerima form "Saran dan masukan"
   dari html/index.html (metode POST) dan menyimpannya
   ke tabel `saran`. Jawaban dikirim dalam bentuk JSON.
   ========================================================= */
require 'koneksi.php';
header('Content-Type: application/json; charset=utf-8');

function jawab(int $kode, array $data): void
{
    http_response_code($kode);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jawab(405, ['ok' => false, 'message' => 'Gunakan metode POST.']);
}

// Kolom jebakan: manusia tidak mengisinya, bot biasanya mengisi. Pura-pura berhasil tanpa menyimpan.
if (trim($_POST['website'] ?? '') !== '') {
    jawab(200, ['ok' => true]);
}

// Ambil & rapikan input
$nama  = trim($_POST['nama'] ?? '');
$email = trim($_POST['email'] ?? '');
$pesan = trim($_POST['pesan'] ?? '');

// Validasi (nama & email boleh kosong)
$errors = [];
if (mb_strlen($nama) > 60) {
    $errors['nama'] = 'Nama maksimal 60 karakter.';
}
if ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100)) {
    $errors['email'] = 'Format email belum benar, contoh: nama@contoh.com';
}
if (mb_strlen($pesan) < 10) {
    $errors['pesan'] = 'Tulis saran minimal 10 karakter.';
} elseif (mb_strlen($pesan) > 1000) {
    $errors['pesan'] = 'Saran maksimal 1000 karakter.';
}
if ($errors) {
    jawab(422, ['ok' => false, 'message' => 'Periksa kembali isian kamu.', 'errors' => $errors]);
}

try {
    // Prepared statement: aman dari SQL injection
    $stmt = koneksi()->prepare('INSERT INTO saran (nama, email, pesan) VALUES (?, ?, ?)');
    $stmt->execute([
        $nama  !== '' ? $nama  : null,
        $email !== '' ? $email : null,
        $pesan,
    ]);
    jawab(200, ['ok' => true]);
} catch (Throwable $e) {
    error_log('simpan_saran: ' . $e->getMessage());   // detail error hanya masuk log server
    jawab(500, ['ok' => false, 'message' => 'Saran belum tersimpan karena database bermasalah. Coba lagi nanti.']);
}

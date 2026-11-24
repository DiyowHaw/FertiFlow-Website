<?php
/* =========================================================
   koneksi.php — sambungan ke database MySQL (XAMPP)
   Ubah nilai di bawah kalau pengaturan MySQL kamu berbeda.
   ========================================================= */
const DB_HOST = 'localhost';
const DB_NAME = 'fertiflow';
const DB_USER = 'root';
const DB_PASS = '';          // bawaan XAMPP: kosong

function koneksi(): PDO
{
    // Untuk pengujian tanpa MySQL: set FF_DB_DSN, mis. "sqlite:/tmp/uji.db"
    $dsn = getenv('FF_DB_DSN') ?: 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // error dilempar sebagai exception
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

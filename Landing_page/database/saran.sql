-- Tabel untuk form "Saran dan masukan" di landing page.
-- Cara pakai: buka phpMyAdmin (XAMPP) → tab Import → pilih file ini → Import.
-- Database `fertiflow` dibuat otomatis kalau belum ada; tabel lain di dalamnya tidak diubah.

CREATE DATABASE IF NOT EXISTS `fertiflow` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `fertiflow`;

CREATE TABLE IF NOT EXISTS `saran` (
  `id_saran` INT(11)      NOT NULL AUTO_INCREMENT,
  `nama`     VARCHAR(60)  DEFAULT NULL,             -- opsional
  `email`    VARCHAR(100) DEFAULT NULL,             -- opsional
  `pesan`    TEXT         NOT NULL,
  `dibaca`   TINYINT(1)   NOT NULL DEFAULT 0,       -- 0 = belum dibaca, 1 = sudah
  `waktu`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_saran`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

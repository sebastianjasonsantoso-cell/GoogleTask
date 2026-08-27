# PRD — RapiTasks

## Ringkasan

RapiTasks adalah aplikasi daftar tugas ringan untuk membantu pengguna menyusun pekerjaan dan aktivitas pribadi secara cepat. Produk ini mengambil pola interaksi yang familiar dari Google Tasks, namun menggunakan tampilan mandiri berbahasa Indonesia.

## Tujuan

- Membuat, menyelesaikan, memberi bintang, dan menghapus tugas tanpa hambatan.
- Mengelompokkan tugas ke daftar Hari ini, Pekerjaan, dan Pribadi.
- Menyimpan perubahan pengguna secara lokal agar daftar tetap ada setelah halaman dibuka ulang.

## Pengguna sasaran

Profesional dan mahasiswa Indonesia yang ingin melihat prioritas harian tanpa fitur manajemen proyek yang rumit.

## Ruang lingkup versi 1

1. Navigasi daftar Hari ini, Berbintang, Selesai, Pekerjaan, dan Pribadi.
2. Input untuk menambahkan tugas pada daftar aktif.
3. Status selesai/belum selesai serta bagian tugas selesai.
4. Penanda bintang dan tampilan tugas berbintang.
5. Hapus tugas serta hapus semua tugas dari menu opsi.
6. Penyimpanan berbasis `localStorage` di browser.
7. Tampilan responsif untuk desktop dan ponsel.

## Cerita pengguna

- Sebagai pengguna, saya ingin menambah tugas agar tidak lupa pekerjaan penting.
- Sebagai pengguna, saya ingin mencentang tugas yang sudah dikerjakan agar progres terasa jelas.
- Sebagai pengguna, saya ingin memberi bintang pada tugas penting agar mudah ditemukan.
- Sebagai pengguna, saya ingin membuka kembali aplikasi dan melihat daftar terakhir saya.

## Kriteria keberhasilan

- Tugas baru langsung muncul pada daftar yang sedang dibuka.
- Status tugas, bintang, dan penghapusan tersimpan setelah halaman dimuat ulang.
- Antarmuka dapat digunakan pada layar selebar 320 px hingga desktop.
- Kontrol utama memiliki label aksesibilitas untuk pembaca layar.

## Di luar ruang lingkup versi 1

- Akun dan sinkronisasi Google.
- Kolaborasi atau berbagi daftar.
- Pengingat notifikasi dan tanggal jatuh tempo nyata.
- Subtugas, lampiran, dan integrasi kalender.

## Arah berikutnya

Tambahkan pembuatan daftar kustom, tenggat waktu, pencarian, serta login dan sinkronisasi lintas perangkat.

# 📅 Calender-Notify

Calender-Notify adalah aplikasi Node.js yang mengintegrasikan Google Calendar API untuk mengirim notifikasi kalender ke WhatsApp. Proyek ini memungkinkan pengguna untuk menghubungkan Google Calendar mereka dan menerima notifikasi tepat waktu tentang acara yang akan datang. 🎉

## 🚀 Fitur

- 🔑 **Autentikasi** dengan Google menggunakan OAuth2.
- 📆 **Mengambil acara** dari Google Calendar.
- 🖥️ **Dasbor** untuk mengelola akun yang terhubung dan tanggal kedaluwarsanya.
- 📲 **Notifikasi ke WhatsApp** untuk mengingatkan pengguna tentang acara yang akan datang.

## 🏁 Memulai

### Prasyarat

- 🌐 **Node.js** (versi 14 atau lebih tinggi)
- 📦 **npm** (Node Package Manager)
- ☁️ **Proyek Google Cloud** dengan Calendar API dan People API diaktifkan
- 🗝️ **Kredensial API Google** Anda (CLIENT_ID, SECRET_ID, REDIRECT_URI)

### Instalasi

1. 🔄 Klon repositori:

   ```bash
   git clone https://github.com/mohdlabib/Calender-Notify.git
   cd Calender-Notify
   ```

2. 📥 Instal dependensi:

   ```bash
   npm install
   ```

3. ✍️ Buat file `.env` di direktori root dan tambahkan kredensial API Google Anda:

   ```env
   CLIENT_ID=your_client_id
   SECRET_ID=your_secret_id
   REDIRECT=your_redirect_uri
   ```

4. 📂 Buat direktori untuk menyimpan token:

   ```bash
   mkdir db
   touch db/auth.json
   ```

### 🏃‍♂️ Menjalankan Aplikasi

1. ▶️ Mulai server:

   ```bash
   npm start
   ```

2. 🌍 Buka browser Anda dan kunjungi `http://localhost:3000`.

3. 🛠️ Gunakan dasbor untuk mengelola akun Anda:
   - ➕ Klik "Add Account" untuk mengautentikasi dengan akun Google Anda dan menghubungkan Google Calendar Anda.
   - 📋 Lihat akun yang terhubung beserta tanggal kedaluwarsanya di dasbor.

## 📩 Penggunaan

- 📧 Setelah terautentikasi, aplikasi akan menampilkan akun yang terhubung di dasbor yang ramah pengguna.
- 📲 Anda dapat memperluas fungsionalitas untuk mengirim notifikasi ke WhatsApp dengan mengintegrasikan layanan API WhatsApp.

## 🤝 Kontribusi

🙌 Proyek ini merupakan kolaborasi bersama **freack21**. 

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.

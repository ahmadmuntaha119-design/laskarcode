# Checklist & Panduan Rate Limiting Produksi (Vercel Firewall / WAF)

Dokumen acuan: `docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md` §21, §22  
Target: **Deployment Produksi Vercel**

---

## 1. Latar Belakang & Konteks Keamanan

Pada lingkungan pengembangan lokal dan unit testing, LaskarCode menggunakan `DevMemoryRateLimiter` (`src/lib/security/rateLimiter.ts`).
Namun, pada lingkungan serverless multi-instance (seperti Vercel Serverless / Edge Functions):
- Setiap function instance berjalan pada container terpisah dan memori runtime tidak dibagikan antar instance.
- Oleh karena itu, proteksi brute-force terhadap Kode Petualangan (`BOTI-XXXX-XX`) **WAJIB** diterapkan pada level infrastruktur CDN / WAF Edge sebelum request mencapai backend serverless.

---

## 2. Spesifikasi Aturan WAF Vercel

| Parameter | Konfigurasi Rekomendasi |
| :--- | :--- |
| **Target Route** | `/profile/recover` dan Server Action recovery |
| **Kriteria Rate Limit** | Client IP Address (`client.ip`) |
| **Batas Ambang (Threshold)** | Maksimal **5 request** per **10 menit** (600 detik) |
| **Tindakan (Action)** | Block / Rate Limit dengan status HTTP **429 (Too Many Requests)** |
| **Response Body** | JSON atau HTML ramah anak: "Terlalu banyak percobaan. Silakan coba kembali dalam 10 menit." |

---

## 3. Langkah Konfigurasi di Dashboard Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan pilih project **LaskarCode**.
2. Masuk ke tab **Security** > **Firewall** (atau **Attack Challenge Mode / WAF Rules**).
3. Klik **Create Rule**:
   - **Rule Name**: `Rate Limit Player Recovery`
   - **Condition**: Path matches regex `/profile/recover.*` OR Header `Next-Action` contains recovery action hash.
   - **Rate Limit Window**: `600s` (10 minutes)
   - **Max Requests**: `5`
   - **Action**: `Rate Limit (429)`
4. Klik **Save & Deploy**.

---

## 4. Checklist Verifikasi Pre-Production (Go-Live Gate)

Sebelum fitur recovery diaktifkan untuk publik, verifikasi checklist berikut:

- [ ] **Rule WAF Terpasang**: Aturan rate limit 5 req / 10 min aktif di Vercel Firewall.
- [ ] **Simulasi Brute-force Berhasil Diblokir**:
  - Mengirimkan 6 request berturut-turut dengan kode salah dari IP pengujian.
  - Request ke-6 wajib menerima response `HTTP 429 Too Many Requests`.
- [ ] **Logging Aman**: Header atau body yang memuat raw recovery code tidak di-forward ke external APM/analytics logs.
- [ ] **Respons Error Generik**: Sistem tidak membedakan error antara "kode salah format" dan "kode tidak ditemukan" di level database.
- [ ] **Kunci HMAC Aman**: `RECOVERY_CODE_SECRET` di Vercel Environment Variables memiliki panjang minimal 64 karakter acak.

---
*Status: Dibuat pada Task 010 sebagai prasyarat keamanan produksi LaskarCode.*

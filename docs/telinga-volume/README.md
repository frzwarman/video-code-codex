# TELINGA / SOUND WITHIN

**Status: komposisi dan audio sumber sudah dibuat. Belum diekspor ke MP4 atau dipublikasikan.** Perbaikan sel rambut dan coretan UNDO sudah diperiksa pada preview Studio (20,5 dan 47 detik); review seluruh film masih pending. Pengguna menentukan kapan render ekspor dilakukan.

Video utama: **Musik Terlalu Keras: Apa yang Terjadi di Dalam Telingamu?**

- ID `telinga-volume`, komposisi `telinga-volume-vertical`.
- 65 detik · 60 FPS · 3.900 frame · desain vertikal 1080×1920.
- Bahasa Indonesia santai: “enak, sih”, “mendem”, “nggak ada tombol undo”. Tanpa slang yang dipaksakan atau gaya ceramah.
- Seri **INSIDE YOU / TELINGA**. Nomor episode tidak ditebak karena urutan penerbitan belum ditentukan.
- Generator repo mendaftarkan rasio lain; desain episode ini khusus vertikal. Rasio lain belum diarahkan atau direview.

## Arahan visual

**SOUND WITHIN:** headphone charcoal dengan detail bantalan, cahaya pearl dan mint, diteruskan ke anatomi telinga dan dunia organik mikroskopis. Ink `#071316`, pearl `#F4F0E8`, mint `#37E8CC`, coral `#FF684C`, acid `#DDFB6A`. Inter tebal, serif italic lokal sebagai komentar singkat, mono untuk label. Konten penting berada pada area x84–950; caption di bawah aksi utama.

Tiga hero shot yang ditargetkan: headphone dengan detail headband, bantalan, dan highlight PBR; koklea dari atlas CT dengan penekanan bentuk lewat cahaya; kamera di antara bundle rambut sensorik bertingkat. Ini target kreatif dalam kode, **bukan klaim kualitas render yang sudah diverifikasi**.

Produk memakai mesh headphone karya **nisu (CC0)**. Establishing shot telinga memakai model pengajaran **Innerscene (CC0)**; close-up gendang, ossikel dan telinga dalam memakai geometri **SPL Inner Ear Atlas** yang disegmentasi dari CT manusia. Ini aset yang berbeda: model Innerscene bukan pemindaian, sedangkan atlas SPL memang berasal dari CT satu spesimen.

Sel rambut, stereosilia, front cairan transisi, front gelombang dan animasi sinyal tetap berupa ilustrasi prosedural. Detail mikroskopis ini tidak tersedia dalam mesh CT yang diunduh. Warna, material, amplitudo getaran, jalur kamera dan pemadatan waktu diarahkan untuk komunikasi; bukan simulasi fisiologis atau cedera yang terukur.

## Storyboard / cue sheet

| Detik | Adegan | Gerak dan perubahan |
|---|---|---|
| 0–4 | Lagu favorit, volume mentok | Cover langsung penuh: FULL VOLUME? Mesh headphone, bantalan dan headband, highlight studio. Pada 1,5 s kata berganti; pada 2,7 s dolly mendekati earcup. |
| 4–9 | Masuk ke telinga | Match iris dari earcup menuju daun telinga dan kanal model Innerscene. Front gelombang tetap ilustratif. |
| 9–14 | Getaran diteruskan | Close-up mesh gendang dan tiga ossikel atlas CT SPL. Label mengikuti kamera; getaran diperjelas untuk ilustrasi. |
| 14–19 | Rumah siput | Cutaway labirin bertulang atlas CT memperlihatkan koklea dan lamina spiral (penopang tulang berwarna cream). Bidang potong membatasi area koklea dan menyembunyikan kanal vestibular; kulit mint transparan dan cahaya menunjukkan ruang koklea. Cairan tidak dimodelkan sebagai lamina tulang. |
| 19–27 | Rambut → sinyal | Satu baris sel rambut dalam dan tiga baris luar, bundle U/V bertingkat. Kamera turun dan mendekat, impuls ilustratif melalui saraf. |
| 27–35 | Keras × lama | Dua meter tanpa angka medis palsu. Sel tetap terlihat di belakang. Keras dan durasi sama-sama berperan. |
| 35–43 | Bisa rusak | Bundle terpilih membengkok dan berkurang. Waktu dipadatkan; bukan ilustrasi bahwa beberapa detik biasa pasti merusak. |
| 43–49 | Nggak ada undo | Celah tetap kosong. UNDO dicoret; sinyal punya celah. Tidak ada animasi sel tumbuh kembali. |
| 49–57 | Tetap nikmatin musik | Hard context switch ke headphone dan latar pearl; kamera mengitari earcup, turunin volume → kasih jeda → noise cancelling. Bukan penyembuhan sel atau klaim fitur headphone tertentu. |
| 57–62 | Jujur, kamu juga? | Pertanyaan sederhana tentang menaikkan volume saat bagian favorit; area komentar lega. |
| 62–65 | Lagu boleh diulang | Tagline menuju cover. Mulai 64,5 s: pose, kamera, grain, energi visual, dan cover kembali ke state awal. |

Transisi: lumen/iris match pada 4 dan 19 s; front cairan pada 14 s; whip wipes berblur pada 9/27/35/49/62 s. Kata masuk mengikuti velocity blur dengan impact hold 3 frame. Tidak memakai CSS animation, wall-clock atau useFrame.

## Naskah dan cara merekam

Naskah 133 kata, dengan cue per adegan di `briefs/telinga-volume.json`, salinannya di `src/videos/telinga-volume/brief.json`, serta ekspor `out/telinga-volume/narration.txt` dan `captions.srt`.

Pembuka: **“Lagu favorit, volume mentok. Enak, sih. Tapi telingamu gimana?”**

Baca seperti cerita ke teman, tidak perlu dibuat heboh. Beri jeda setelah “Enak, sih”, “nggak ada tombol undo”, dan sebelum pertanyaan terakhir. “Koklea” dibaca ko-kle-a; “noise cancelling” boleh diucapkan natural. Cue adalah rencana, bukan hasil alignment rekaman. `audio.narration` masih `null`.

Setelah rekaman tersedia, taruh file lokal di `public/telinga-volume/`, sesuaikan cue dengan ucapan aktual, dan ubah path di kedua brief. `AudioTracks` otomatis menurunkan music gain ketika ada narasi. Ukur ulang keseluruhan mix setelah voice ditambahkan.

## Audio orisinal

`scripts/create-telinga-volume-audio.mjs` membuat `score.wav`, `effects.wav`, audit audio, dan 3.900 nilai RMS untuk respons visual. 48 kHz, stereo, 120 BPM, broken beat ringan, bass hangat, pluck, whoosh, tap membran dan cue transduksi. Tidak memakai sampel atau suara berlisensi pihak ketiga. Tidak ada rekaman suara manusia.

Filter pada 35–49 s adalah desain suara ekspresif, bukan simulasi klinis gangguan pendengaran. Tidak ada tone tinnitus menusuk, ajakan menaikkan volume penonton, atau tes pendengaran. Kembali cerah pada 49 s menyertai pergantian konteks ke pencegahan, bukan pemulihan sel mati.

Pemeriksaan WAV sumber: **true peak −7,0 dBFS**, loudness terintegrasi −23,2 LUFS pada gain pemutaran tanpa narasi. Lihat `audio-validation.json` untuk hash sumber dan metode. Ini bukan hasil pengukuran AAC final.

## File dan performa

- `Video.tsx`: komposisi asli, editorial type, caption dan transisi.
- `World.tsx`: satu ThreeCanvas, DPR 1, absolute CameraRig, lingkungan refleksi 128×64, kamera dolly, produk dan anatomi.
- `Models.tsx` / `assets.ts`: mesh GLB, normalisasi koordinat, cutaway koklea, label dari batas mesh CT; model dimuat di root sebelum frame dilepas.
- `camera.ts`: posisi kamera absolut dan titik pandang per adegan.
- Pose headphone dan kamera close-up CT menyisakan ruang untuk judul, label dan copy bawah. Posisi produk yang dipakai model dan titik fokus kamera berasal dari helper yang sama.
- `HairField.tsx` / `hair.ts`: 28 sel dengan permukaan apikal membulat, 924 stereosilia bertingkat, sambungan tip ilustratif, jaringan pendukung, dan kehilangan bundle deterministik. Akar menempel pada permukaan sel; material nonmetalik dan cahaya lebih lembut khusus adegan mikroskopis. Ini model ilustratif yang dibuat dalam kode, bukan mesh hasil scan.
- `geometry.ts`: tube serabut saraf dan elemen pendukung; mesh produk dan anatomi utama berasal dari GLB lokal.
- `Graphics.tsx`: typography, proyeksi label, meter, iris, fluid wipe; mengimpor Blur/Wipe/Grain/easing/font dari kit showreel.
- `timing.json`: cut dan impact untuk visual serta audio; `timeline.ts`: perhitungan frame murni.
- Preview dan final memakai susunan identik: 28 sel, 924 stereosilia dan 616 sambungan tip melalui instancing; detail tetap stabil saat berpindah preset. Jumlah ini ilustratif, bukan jumlah biologis sesungguhnya. Tidak ada shadow maps atau postprocessing berat.
- Anatomi lain, suara, dan materi video terdahulu tidak dimodifikasi. Tidak menambah dependensi.

## Aset 3D dan reproduksi

Semua aset runtime berada di `public/telinga-volume/models/`. Provenance JSON mencatat URL, penulis, hash, lisensi dan perubahan.

| File | Asal dan lisensi | Ukuran / geometri | Adaptasi |
|---|---|---|---|
| `headphones.glb` | [Headphones — nisu](https://opengameart.org/content/headphones), CC0 1.0 | 6,45 MB; 3.324 triangle; tiga mesh; dua tekstur 2048² | OBJ dipisah pada komponen asli menjadi headband dan dua earcup; normal DirectX diubah ke OpenGL; map ORM dikemas. Albedo/logo dan emission sumber tidak digunakan; material charcoal netral. |
| `outer-ear.glb` | [Ear anatomy model — Innerscene](https://www.innerscene.com/tools/library/3d-parts/ear-anatomy-model-6b89b9e8), CC0 1.0; sumber mengkredit MakeHuman/MPFB | 0,34 MB; 14.584 triangle; 16 mesh | Topologi asli dipertahankan; tekstur dilepas dan material disesuaikan. Dipakai untuk orientasi telinga luar, bukan sumber detail CT. |
| `inner-ear.glb` | [SPL Inner Ear Atlas](https://www.openanatomy.org/atlas-pages/atlas-spl-inner-ear.html), Sonke Bartling, Marianna Jakab, Ron Kikinis; 3D Slicer License Part B | 1,19 MB; 49.214 triangle; tujuh mesh | Pilihan VTK dikonversi ke GLB; koordinat/topologi asli dipertahankan, normal dinormalisasi, nama dan material diperjelas. |

Atlas SPL dikembangkan oleh DKFZ dan Surgical Planning Laboratory, Brigham and Women’s Hospital / Harvard Medical School. Versi di repo ini adalah **adaptasi**, bukan file atlas asli atau produk yang mereka dukung. [Lisensi lengkap lokal](../../public/telinga-volume/models/licenses/spl-slicer-license.txt) menyertai data dan menjadi bagian dokumentasi aset; pertahankan seluruh Part B, pemberitahuan dan atribusi ketika membagikan mesh atau paket sumber. Kredit publikasi tersedia di `publish.md`.

Konversi ini tidak menghasilkan frame atau video:

```sh
# Headphone: unduh ZIP dari tautan pada headphones-provenance.json, lalu ekstrak.
node scripts/convert-telinga-headphones.mjs /path/to/extracted/Headphones
# Memakai ear-anatomy-source.glb yang sudah disimpan lokal:
node scripts/prepare-telinga-outer-ear.mjs
# Mengunduh hanya tujuh VTK yang diperlukan, bukan seluruh arsip atlas:
node scripts/prepare-telinga-anatomy.mjs
```

Headphone dinormalisasi ke tinggi presentasi 0,24 unit; ini estimasi skala, bukan ukuran produk yang diukur. Atlas memakai koordinat RAS sumber dan dinormalisasi oleh komposisi. Animasi headphone dan anatomi dihitung dari waktu adegan; tidak ada fisika live.

## Pemeriksaan tanpa render

```sh
node scripts/create-telinga-volume-audio.mjs
npm run captions -- telinga-volume
node scripts/verify-telinga-volume.mjs
node scripts/verify-telinga-framing.mjs
npm run check
```

Audit source memeriksa brief, cue, durasi WAV, jumlah data audio, caption, dan geometri finite. `framing-validation.json` memeriksa proyeksi mesh pada seluruh **1.722 frame** dalam enam rentang shot produk/telinga tengah/koklea, menggunakan kamera dan transformasi produksi. Potongan koklea menyertakan perpotongan sisi segitiga dengan bidang clipping. Batas mesh lolos area yang disediakan di antara judul dan copy bawah; label telinga tengah juga memiliki ruang tersendiri.

Pemeriksaan ini berjalan di CPU tanpa browser atau gambar. Pendekatan makro ke earcup, perjalanan kanal, adegan mikroskopis dan elemen dekoratif berada di luar audit framing tersebut. Hasilnya membuktikan batas geometri, bukan penampilan material, keterbacaan teks saat bergerak, atau kualitas visual. Framing, material, clipping, transisi dan loop tetap harus direview lewat render setelah pengguna memutuskan.

## Nanti, setelah pengguna meminta render

Perintah ini dokumentasi saja; belum dijalankan:

```sh
npm run render -- telinga-volume --format vertical --preset preview
# Review 540×960, baru revisi dan render final:
npm run render -- telinga-volume --format vertical --preset final
npm run stills -- telinga-volume --format vertical --preset final --frames 0
npm run validate -- out/telinga-volume/vertical-final.mp4
ffmpeg -hide_banner -i out/telinga-volume/vertical-final.mp4 -af ebur128=peak=true:framelog=verbose -vn -f null -
```

Simpan cover yang disetujui sebagai `out/telinga-volume/cover.png`. Ambil delapan frame encoded pada 0, 6, 11, 16, 23, 32, 40, 52 s; inspeksi juga 43/49/57 s, setiap batas transisi, frame pertama dan terakhir. Pastikan 1080×1920, 60 FPS, 65 s, H.264/AAC, true peak ≤ −1 dBFS dan tidak ada aset hilang. Audio/preview/final/contact sheet belum boleh disebut selesai sebelum pemeriksaan tersebut.

## Paket publikasi / calon klien

Salinan yang dilacak Git: `docs/telinga-volume/publish.md`. Salinan delivery: `out/telinga-volume/publish.md`. Berisi judul Indonesia, caption singkat, hashtag, pinned comment, serta rencana potongan portofolio dan making-of. Dua turunan itu baru edit decision list, belum komposisi atau video tambahan. Tidak ada publikasi otomatis atau jaminan pendapatan.

Referensi ilmiah dan atribusi ada di `docs/references.md`, bagian telinga-volume.

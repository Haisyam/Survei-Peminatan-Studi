"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Send, ShieldCheck, RefreshCw } from "lucide-react";

export default function SurveyForm() {
  const [formData, setFormData] = useState({
    school_name: "",
    school_city: "",
    grade_level: "",
    age_group: "",
    gender: "Tidak ingin menyebutkan",
    intention: "",
    target_degree: "",
    target_time: "",
    considered_program: "",
    target_region: "",
    fields_of_study: [] as string[],
    funding_source: "",
    obstacles: [] as string[],
    info_sources: [] as string[],
    needs_counseling: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Checkbox group handler for fields_of_study (max 3)
  const handleFieldOfStudyToggle = (field: string) => {
    setFormData((prev) => {
      const exists = prev.fields_of_study.includes(field);
      if (exists) {
        return {
          ...prev,
          fields_of_study: prev.fields_of_study.filter((f) => f !== field),
        };
      }
      if (prev.fields_of_study.length >= 3) {
        setErrorMessage("Bidang studi yang diminati maksimal 3 pilihan.");
        return prev;
      }
      setErrorMessage(null);
      return {
        ...prev,
        fields_of_study: [...prev.fields_of_study, field],
      };
    });
  };

  // Checkbox group handler for obstacles (max 3)
  const handleObstacleToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.obstacles.includes(item);
      if (exists) {
        return {
          ...prev,
          obstacles: prev.obstacles.filter((o) => o !== item),
        };
      }
      if (prev.obstacles.length >= 3) {
        setErrorMessage("Kendala atau pertimbangan maksimal 3 pilihan.");
        return prev;
      }
      setErrorMessage(null);
      return {
        ...prev,
        obstacles: [...prev.obstacles, item],
      };
    });
  };

  // Checkbox group handler for info_sources
  const handleInfoSourceToggle = (source: string) => {
    setFormData((prev) => {
      const exists = prev.info_sources.includes(source);
      return {
        ...prev,
        info_sources: exists
          ? prev.info_sources.filter((s) => s !== source)
          : [...prev.info_sources, source],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi client-side
    if (formData.fields_of_study.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 bidang studi yang diminati.");
      return;
    }
    if (formData.obstacles.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 kendala atau pertimbangan.");
      return;
    }
    if (formData.info_sources.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 sumber informasi yang pernah Anda gunakan.");
      return;
    }
    if (!formData.consent) {
      setErrorMessage("Anda harus menyetujui pernyataan survei sukarela untuk melanjutkan.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim jawaban survei.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      school_name: "",
      school_city: "",
      grade_level: "",
      age_group: "",
      gender: "Tidak ingin menyebutkan",
      intention: "",
      target_degree: "",
      target_time: "",
      considered_program: "",
      target_region: "",
      fields_of_study: [],
      funding_source: "",
      obstacles: [],
      info_sources: [],
      needs_counseling: "",
      consent: false,
    });
    setSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <div suppressHydrationWarning className="page-shell">
      {/* Brand Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="brand-row"
      >
        <div className="brand-info">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <Image
              src="https://unma.ac.id/wp-content/uploads/2023/03/Logo-Universitas-Majalengka.png"
              alt="Logo Universitas Majalengka"
              width={48}
              height={48}
              priority
              className="brand-mark-img"
              onError={(e) => {
                // Fallback to local image if remote is slow or blocked
                (e.target as HTMLImageElement).src = "/images/logo-unma.png";
              }}
            />
          </div>
          <div className="brand-text">
            <p className="eyebrow">Survei pendidikan tinggi</p>
            <p className="brand-name">Universitas Majalengka</p>
            <p className="brand-tagline">Pusat Informasi &amp; Minat Studi Siswa</p>
          </div>
        </div>

        {/* Right Banner Badge: Always aligned to the right & fully responsive */}
        <div className="brand-banner-right">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-800 shadow-2xs hover:bg-blue-100/70 transition-colors">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 text-right sm:text-left leading-none">
              <span className="text-[10px] sm:text-xs font-extrabold text-blue-900 tracking-tight">Bernas</span>
              <span className="text-[9px] sm:text-xs font-semibold text-blue-700">Berkualitas</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Card */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hero-card"
      >
        <div className="hero-copy">
          <p className="eyebrow">SURVEI SISWA</p>
          <h1>Peminatan Melanjutkan Studi ke Perguruan Tinggi</h1>
          <p className="intro">
            Sampaikan rencana dan kebutuhan informasi pendidikan tinggi Anda.
            Jawaban akan dirangkum untuk membantu Universitas Majalengka memahami
            minat siswa dan merancang layanan informasi serta beasiswa yang lebih tepat.
          </p>
          <div className="privacy-note">
            <span aria-hidden="true">●</span>
            <span>
              Survei ini anonim. Jangan tuliskan nama, nomor telepon, alamat, atau
              informasi pribadi pada kolom jawaban.
            </span>
          </div>
        </div>

        <div className="hero-aside">
          <div>
            <span className="aside-number">01</span>
            <span className="block mt-2">Waktu pengisian</span>
            <strong>4–6 menit</strong>
          </div>
          <span className="text-xs leading-relaxed text-blue-100 flex items-center gap-1.5 mt-3">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Jawaban disimpan secara aman untuk keperluan rekap survei UNMA.
          </span>
        </div>
      </motion.section>

      {/* Success State */}
      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="form-card text-center py-12 px-6"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Terima Kasih atas Partisipasi Anda!
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed mb-6">
              Jawaban Anda telah tersimpan dengan aman di basis data Universitas Majalengka.
              Masukan Anda sangat berharga bagi perencanaan dan peningkatan mutu
              pendidikan tinggi di kampus Bernas Berkualitas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="button !bg-blue-600 hover:!bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Isi Survei Lainnya
              </button>
            </div>
          </motion.div>
        ) : (
          /* Survey Form Card */
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="form-card"
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow">FORMULIR SURVEI</p>
                <h2>Informasi dan rencana studi Anda</h2>
              </div>
              <span className="required-note">* Wajib diisi</span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: Informasi Sekolah */}
            <section className="form-section">
              <div className="section-title">
                <span>1</span>
                <div>
                  <h3>Informasi sekolah</h3>
                  <p>Data ini digunakan untuk menyusun rekap per wilayah sekolah.</p>
                </div>
              </div>

              <div className="field-grid">
                <label className="field wide">
                  Nama sekolah <em>*</em>
                  <input
                    required
                    name="school_name"
                    maxLength={120}
                    placeholder="Contoh: SMA Negeri 1 Majalengka"
                    value={formData.school_name}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="field">
                  Kabupaten/kota sekolah <em>*</em>
                  <input
                    required
                    name="school_city"
                    maxLength={100}
                    placeholder="Contoh: Majalengka"
                    value={formData.school_city}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="field">
                  Tingkat kelas <em>*</em>
                  <select
                    required
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih tingkat kelas</option>
                    <option value="Kelas X">Kelas X</option>
                    <option value="Kelas XI">Kelas XI</option>
                    <option value="Kelas XII">Kelas XII</option>
                    <option value="Kelas XIII">Kelas XIII</option>
                    <option value="Lulusan tahun ini">Lulusan tahun ini</option>
                  </select>
                </label>

                <label className="field">
                  Kelompok usia <em>*</em>
                  <select
                    required
                    name="age_group"
                    value={formData.age_group}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih kelompok usia</option>
                    <option value="Di bawah 16 tahun">Di bawah 16 tahun</option>
                    <option value="16–17 tahun">16–17 tahun</option>
                    <option value="18–19 tahun">18–19 tahun</option>
                    <option value="20 tahun atau lebih">20 tahun atau lebih</option>
                  </select>
                </label>

                <label className="field">
                  Jenis kelamin <span className="optional">(opsional)</span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Tidak ingin menyebutkan">
                      Tidak ingin menyebutkan
                    </option>
                  </select>
                </label>
              </div>
            </section>

            {/* SECTION 2: Minat Melanjutkan Studi */}
            <section className="form-section">
              <div className="section-title">
                <span>2</span>
                <div>
                  <h3>Minat melanjutkan studi</h3>
                  <p>Pilih jawaban yang paling sesuai dengan rencana Anda saat ini.</p>
                </div>
              </div>

              <div className="field">
                <span className="question">
                  Apakah Anda berminat melanjutkan studi ke perguruan tinggi? <em>*</em>
                </span>
                <div className="choice-row">
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="intention"
                      value="Ya"
                      checked={formData.intention === "Ya"}
                      onChange={handleInputChange}
                    />
                    Ya
                  </label>
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="intention"
                      value="Masih mempertimbangkan"
                      checked={formData.intention === "Masih mempertimbangkan"}
                      onChange={handleInputChange}
                    />
                    Masih mempertimbangkan
                  </label>
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="intention"
                      value="Tidak untuk saat ini"
                      checked={formData.intention === "Tidak untuk saat ini"}
                      onChange={handleInputChange}
                    />
                    Tidak untuk saat ini
                  </label>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  Jenjang yang diminati <em>*</em>
                  <select
                    required
                    name="target_degree"
                    value={formData.target_degree}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih jenjang</option>
                    <option value="D3">D3</option>
                    <option value="D4/Sarjana Terapan">D4/Sarjana Terapan</option>
                    <option value="S1">S1</option>
                    <option value="Belum menentukan">Belum menentukan</option>
                    <option value="Tidak berencana melanjutkan">
                      Tidak berencana melanjutkan
                    </option>
                  </select>
                </label>

                <label className="field">
                  Rencana waktu melanjutkan <em>*</em>
                  <select
                    required
                    name="target_time"
                    value={formData.target_time}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih waktu</option>
                    <option value="Tahun ajaran berikutnya">
                      Tahun ajaran berikutnya
                    </option>
                    <option value="Dalam 1–2 tahun">Dalam 1–2 tahun</option>
                    <option value="Masih belum pasti">Masih belum pasti</option>
                    <option value="Tidak berencana melanjutkan">
                      Tidak berencana melanjutkan
                    </option>
                  </select>
                </label>

                <label className="field wide">
                  Program studi atau kampus yang sedang dipertimbangkan{" "}
                  <span className="optional">(opsional)</span>
                  <input
                    name="considered_program"
                    maxLength={180}
                    placeholder="Jangan tuliskan nama atau kontak pribadi"
                    value={formData.considered_program}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="field wide">
                  Wilayah kampus yang diinginkan <em>*</em>
                  <select
                    required
                    name="target_region"
                    value={formData.target_region}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih wilayah</option>
                    <option value="Kabupaten/kota tempat tinggal">
                      Kabupaten/kota tempat tinggal
                    </option>
                    <option value="Wilayah lain di provinsi yang sama">
                      Wilayah lain di provinsi yang sama
                    </option>
                    <option value="Provinsi lain di Pulau Jawa">
                      Provinsi lain di Pulau Jawa
                    </option>
                    <option value="Di luar Pulau Jawa">Di luar Pulau Jawa</option>
                    <option value="Belum menentukan">Belum menentukan</option>
                    <option value="Tidak berencana melanjutkan">
                      Tidak berencana melanjutkan
                    </option>
                  </select>
                </label>
              </div>

              <fieldset className="field">
                <legend>
                  Bidang studi yang diminati <em>*</em>{" "}
                  <span className="optional">
                    (pilih maksimal 3, terpilih: {formData.fields_of_study.length}/3)
                  </span>
                </legend>
                <div className="check-grid">
                  {[
                    "Pendidikan dan Keguruan",
                    "Teknik dan Informatika",
                    "Kesehatan",
                    "Ekonomi dan Bisnis",
                    "Pertanian dan Pangan",
                    "Hukum dan Ilmu Sosial",
                    "Sains dan Matematika",
                    "Seni dan Desain",
                    "Belum menentukan",
                  ].map((field) => (
                    <label key={field} className="check-option">
                      <input
                        type="checkbox"
                        checked={formData.fields_of_study.includes(field)}
                        onChange={() => handleFieldOfStudyToggle(field)}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            {/* SECTION 3: Kesiapan dan Kebutuhan Informasi */}
            <section className="form-section">
              <div className="section-title">
                <span>3</span>
                <div>
                  <h3>Kesiapan dan kebutuhan informasi</h3>
                  <p>Pendapat Anda membantu perguruan tinggi menyediakan dukungan yang relevan.</p>
                </div>
              </div>

              <label className="field">
                Sumber pembiayaan yang paling mungkin digunakan <em>*</em>
                <select
                  required
                  name="funding_source"
                  value={formData.funding_source}
                  onChange={handleInputChange}
                >
                  <option value="">Pilih sumber pembiayaan</option>
                  <option value="Biaya sendiri atau keluarga">
                    Biaya sendiri atau keluarga
                  </option>
                  <option value="Beasiswa">Beasiswa</option>
                  <option value="Bantuan pemerintah">Bantuan pemerintah</option>
                  <option value="Bekerja sambil kuliah">Bekerja sambil kuliah</option>
                  <option value="Belum mengetahui">Belum mengetahui</option>
                  <option value="Tidak berencana melanjutkan">
                    Tidak berencana melanjutkan
                  </option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>

              <fieldset className="field">
                <legend>
                  Hal yang menjadi kendala atau pertimbangan <em>*</em>{" "}
                  <span className="optional">
                    (pilih maksimal 3, terpilih: {formData.obstacles.length}/3)
                  </span>
                </legend>
                <div className="check-grid">
                  {[
                    "Biaya kuliah",
                    "Belum yakin memilih program studi",
                    "Belum memperoleh informasi yang cukup",
                    "Jarak atau lokasi kampus",
                    "Persetujuan keluarga",
                    "Persaingan masuk",
                    "Harus bekerja atau membantu keluarga",
                    "Tidak ada kendala berarti",
                    "Lainnya",
                  ].map((item) => (
                    <label key={item} className="check-option">
                      <input
                        type="checkbox"
                        checked={formData.obstacles.includes(item)}
                        onChange={() => handleObstacleToggle(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field">
                <legend>
                  Sumber informasi pendidikan tinggi yang pernah Anda gunakan <em>*</em>
                </legend>
                <div className="check-grid">
                  {[
                    "Guru atau sekolah",
                    "Orang tua atau keluarga",
                    "Media sosial",
                    "Situs resmi perguruan tinggi",
                    "Pameran pendidikan",
                    "Teman atau alumni",
                    "Bimbingan konseling",
                    "Lainnya",
                  ].map((source) => (
                    <label key={source} className="check-option">
                      <input
                        type="checkbox"
                        checked={formData.info_sources.includes(source)}
                        onChange={() => handleInfoSourceToggle(source)}
                      />
                      {source}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <span className="question">
                  Apakah Anda membutuhkan informasi atau konsultasi tentang kuliah? <em>*</em>
                </span>
                <div className="choice-row">
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="needs_counseling"
                      value="Ya"
                      checked={formData.needs_counseling === "Ya"}
                      onChange={handleInputChange}
                    />
                    Ya
                  </label>
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="needs_counseling"
                      value="Mungkin"
                      checked={formData.needs_counseling === "Mungkin"}
                      onChange={handleInputChange}
                    />
                    Mungkin
                  </label>
                  <label className="radio-option">
                    <input
                      required
                      type="radio"
                      name="needs_counseling"
                      value="Tidak"
                      checked={formData.needs_counseling === "Tidak"}
                      onChange={handleInputChange}
                    />
                    Tidak
                  </label>
                </div>
              </div>
            </section>

            {/* Consent Box */}
            <section className="consent-box">
              <label className="consent-option">
                <input
                  required
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, consent: e.target.checked }))
                  }
                />
                <span>
                  Saya bersedia mengisi survei ini secara sukarela. Saya memahami bahwa
                  jawaban akan digunakan dalam bentuk rekap untuk perencanaan informasi
                  dan layanan pendidikan tinggi. Saya tidak mencantumkan data pribadi. <em>*</em>
                </span>
              </label>
              <p>
                Anda dapat melewati pertanyaan opsional. Jangan mengisi survei ini dengan
                informasi yang dapat mengidentifikasi diri Anda.
              </p>
            </section>

            {/* Submit Row */}
            <div className="submit-row">
              <span>Periksa kembali jawaban sebelum mengirim.</span>
              <button className="button" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Kirim jawaban
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="site-footer">
        <span>Survei Peminatan Studi ke Perguruan Tinggi &bull; Universitas Majalengka</span>
        <span>Partisipasi Anda membantu perencanaan layanan pendidikan berkualitas.</span>
        
        {/* Subtle non-public link for administration */}
        <div className="mt-3 opacity-60 hover:opacity-100 transition-opacity">
          <a
            href="/unma-admin-bernas"
            suppressHydrationWarning
            className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
            title="Portal Kelola Data Survei"
          >
            &copy; {new Date().getFullYear()} Universitas Majalengka &bull; Manajemen Data Survei
          </a>
        </div>
      </footer>
    </div>
  );
}

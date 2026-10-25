import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getAllSurveys } from "@/lib/db";

export async function GET() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const surveys = getAllSurveys();

  const headers = [
    "ID",
    "Waktu Pengisian",
    "Nama Sekolah",
    "Kabupaten/Kota",
    "Tingkat Kelas",
    "Kelompok Usia",
    "Jenis Kelamin",
    "Minat Melanjutkan",
    "Jenjang yang Diminati",
    "Rencana Waktu Melanjutkan",
    "Program Studi/Kampus Dipertimbangkan",
    "Wilayah Kampus yang Diinginkan",
    "Bidang Studi Diminati",
    "Sumber Pembiayaan",
    "Kendala/Pertimbangan",
    "Sumber Informasi Digunakan",
    "Kebutuhan Konsultasi",
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = Array.isArray(val) ? val.join("; ") : String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = surveys.map((s) => [
    s.id,
    s.created_at,
    escapeCsv(s.school_name),
    escapeCsv(s.school_city),
    escapeCsv(s.grade_level),
    escapeCsv(s.age_group),
    escapeCsv(s.gender),
    escapeCsv(s.intention),
    escapeCsv(s.target_degree),
    escapeCsv(s.target_time),
    escapeCsv(s.considered_program),
    escapeCsv(s.target_region),
    escapeCsv(s.fields_of_study),
    escapeCsv(s.funding_source),
    escapeCsv(s.obstacles),
    escapeCsv(s.info_sources),
    escapeCsv(s.needs_counseling),
  ]);

  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Excel
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const filename = `rekap-survei-unma-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

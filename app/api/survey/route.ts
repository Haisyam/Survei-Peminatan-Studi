import { NextRequest, NextResponse } from "next/server";
import { saveSurvey, SurveyInput } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi field yang wajib diisi
    const {
      school_name,
      school_city,
      grade_level,
      age_group,
      intention,
      target_degree,
      target_time,
      target_region,
      fields_of_study,
      funding_source,
      obstacles,
      info_sources,
      needs_counseling,
      consent,
    } = body;

    if (
      !school_name ||
      !school_city ||
      !grade_level ||
      !age_group ||
      !intention ||
      !target_degree ||
      !target_time ||
      !target_region ||
      !funding_source ||
      !needs_counseling ||
      !consent
    ) {
      return NextResponse.json(
        { error: "Mohon lengkapi semua kolom yang bertanda wajib (*)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(fields_of_study) || fields_of_study.length === 0) {
      return NextResponse.json(
        { error: "Pilih minimal 1 bidang studi yang diminati" },
        { status: 400 }
      );
    }

    if (fields_of_study.length > 3) {
      return NextResponse.json(
        { error: "Bidang studi maksimal 3 pilihan" },
        { status: 400 }
      );
    }

    if (!Array.isArray(obstacles) || obstacles.length === 0) {
      return NextResponse.json(
        { error: "Pilih minimal 1 kendala atau pertimbangan" },
        { status: 400 }
      );
    }

    if (obstacles.length > 3) {
      return NextResponse.json(
        { error: "Kendala maksimal 3 pilihan" },
        { status: 400 }
      );
    }

    if (!Array.isArray(info_sources) || info_sources.length === 0) {
      return NextResponse.json(
        { error: "Pilih minimal 1 sumber informasi yang pernah digunakan" },
        { status: 400 }
      );
    }

    const input: SurveyInput = {
      school_name: String(school_name).slice(0, 150),
      school_city: String(school_city).slice(0, 100),
      grade_level: String(grade_level),
      age_group: String(age_group),
      gender: body.gender ? String(body.gender) : "Tidak ingin menyebutkan",
      intention: String(intention),
      target_degree: String(target_degree),
      target_time: String(target_time),
      considered_program: body.considered_program ? String(body.considered_program).slice(0, 200) : "",
      target_region: String(target_region),
      fields_of_study: fields_of_study.map(String),
      funding_source: String(funding_source),
      obstacles: obstacles.map(String),
      info_sources: info_sources.map(String),
      needs_counseling: String(needs_counseling),
      consent: Boolean(consent),
    };

    const id = await saveSurvey(input);

    return NextResponse.json({
      success: true,
      message: "Jawaban survei berhasil dikirim dan tersimpan dengan aman.",
      id,
    });
  } catch (error) {
    console.error("Error saving survey:", error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server saat menyimpan survei.",
        details: errMessage,
      },
      { status: 500 }
    );
  }
}

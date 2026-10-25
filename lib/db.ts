import { createClient, type Client } from "@libsql/client";
import path from "path";
import fs from "fs";

// Singleton connection
let clientInstance: Client | null = null;
let initPromise: Promise<void> | null = null;

export function getDb(): Client {
  if (!clientInstance) {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl) {
      // Koneksi ke Turso Cloud SQLite Database (Persisten di Vercel & Production)
      clientInstance = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      });
    } else {
      // Fallback lokal jika belum diisi env Turso
      const localDir = path.join(process.cwd(), "data");
      try {
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
      } catch {}

      const localPath = path.join(localDir, "survei.db");
      clientInstance = createClient({
        url: `file:${localPath.replace(/\\/g, "/")}`,
      });
    }
  }
  return clientInstance;
}

export async function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = getDb();

      // Buat tabel HANYA jika belum ada (CREATE TABLE IF NOT EXISTS)
      // PENTING: TIDAK PERNAH reset table / seed ulang saat server restart
      await db.execute(`
        CREATE TABLE IF NOT EXISTS surveys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_name TEXT NOT NULL,
          school_city TEXT NOT NULL,
          grade_level TEXT NOT NULL,
          age_group TEXT NOT NULL,
          gender TEXT,
          intention TEXT NOT NULL,
          target_degree TEXT NOT NULL,
          target_time TEXT NOT NULL,
          considered_program TEXT,
          target_region TEXT NOT NULL,
          fields_of_study TEXT NOT NULL,
          funding_source TEXT NOT NULL,
          obstacles TEXT NOT NULL,
          info_sources TEXT NOT NULL,
          needs_counseling TEXT NOT NULL,
          consent INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );
      `);

      try {
        await db.execute(
          `CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys (created_at DESC);`
        );
        await db.execute(
          `CREATE INDEX IF NOT EXISTS idx_surveys_school_city ON surveys (school_city);`
        );
        await db.execute(
          `CREATE INDEX IF NOT EXISTS idx_surveys_target_degree ON surveys (target_degree);`
        );
      } catch {}
    })();
  }
  return initPromise;
}

export interface SurveyRecord {
  id: number;
  school_name: string;
  school_city: string;
  grade_level: string;
  age_group: string;
  gender?: string | null;
  intention: string;
  target_degree: string;
  target_time: string;
  considered_program?: string | null;
  target_region: string;
  fields_of_study: string[];
  funding_source: string;
  obstacles: string[];
  info_sources: string[];
  needs_counseling: string;
  consent: number;
  created_at: string;
}

export interface SurveyInput {
  school_name: string;
  school_city: string;
  grade_level: string;
  age_group: string;
  gender?: string;
  intention: string;
  target_degree: string;
  target_time: string;
  considered_program?: string;
  target_region: string;
  fields_of_study: string[];
  funding_source: string;
  obstacles: string[];
  info_sources: string[];
  needs_counseling: string;
  consent: boolean;
}

export async function saveSurvey(input: SurveyInput): Promise<number> {
  await initDb();
  const db = getDb();

  const res = await db.execute({
    sql: `
      INSERT INTO surveys (
        school_name,
        school_city,
        grade_level,
        age_group,
        gender,
        intention,
        target_degree,
        target_time,
        considered_program,
        target_region,
        fields_of_study,
        funding_source,
        obstacles,
        info_sources,
        needs_counseling,
        consent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      input.school_name.trim(),
      input.school_city.trim(),
      input.grade_level,
      input.age_group,
      input.gender || "Tidak ingin menyebutkan",
      input.intention,
      input.target_degree,
      input.target_time,
      input.considered_program?.trim() || "",
      input.target_region,
      JSON.stringify(input.fields_of_study || []),
      input.funding_source,
      JSON.stringify(input.obstacles || []),
      JSON.stringify(input.info_sources || []),
      input.needs_counseling,
      input.consent ? 1 : 0,
    ],
  });

  return Number(res.lastInsertRowid ?? 0);
}

export async function getAllSurveys(): Promise<SurveyRecord[]> {
  await initDb();
  const db = getDb();

  const result = await db.execute("SELECT * FROM surveys ORDER BY id DESC");

  return result.rows.map((row) => ({
    id: Number(row.id),
    school_name: String(row.school_name || ""),
    school_city: String(row.school_city || ""),
    grade_level: String(row.grade_level || ""),
    age_group: String(row.age_group || ""),
    gender: row.gender ? String(row.gender) : null,
    intention: String(row.intention || ""),
    target_degree: String(row.target_degree || ""),
    target_time: String(row.target_time || ""),
    considered_program: row.considered_program ? String(row.considered_program) : null,
    target_region: String(row.target_region || ""),
    fields_of_study: safeJsonParse<string[]>(String(row.fields_of_study || "[]"), []),
    funding_source: String(row.funding_source || ""),
    obstacles: safeJsonParse<string[]>(String(row.obstacles || "[]"), []),
    info_sources: safeJsonParse<string[]>(String(row.info_sources || "[]"), []),
    needs_counseling: String(row.needs_counseling || ""),
    consent: Number(row.consent ?? 1),
    created_at: String(row.created_at || ""),
  }));
}

export async function deleteSurvey(id: number): Promise<boolean> {
  await initDb();
  const db = getDb();

  const res = await db.execute({
    sql: "DELETE FROM surveys WHERE id = ?",
    args: [id],
  });

  return res.rowsAffected > 0;
}

export async function getSurveyStats() {
  const surveys = await getAllSurveys();
  const total = surveys.length;

  const countByField = (items: string[][]): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const list of items) {
      for (const item of list) {
        if (!item) continue;
        counts[item] = (counts[item] || 0) + 1;
      }
    }
    return counts;
  };

  const countBySingle = (items: (string | null | undefined)[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const key = item || "Belum ditentukan";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  };

  return {
    total,
    byIntention: countBySingle(surveys.map((s) => s.intention)),
    byDegree: countBySingle(surveys.map((s) => s.target_degree)),
    byTime: countBySingle(surveys.map((s) => s.target_time)),
    byRegion: countBySingle(surveys.map((s) => s.target_region)),
    byGrade: countBySingle(surveys.map((s) => s.grade_level)),
    byAge: countBySingle(surveys.map((s) => s.age_group)),
    byGender: countBySingle(surveys.map((s) => s.gender)),
    byCounseling: countBySingle(surveys.map((s) => s.needs_counseling)),
    byFunding: countBySingle(surveys.map((s) => s.funding_source)),
    byFieldOfStudy: countByField(surveys.map((s) => s.fields_of_study)),
    byObstacles: countByField(surveys.map((s) => s.obstacles)),
    byInfoSources: countByField(surveys.map((s) => s.info_sources)),
  };
}

function safeJsonParse<T>(val: string, fallback: T): T {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

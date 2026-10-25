import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Pastikan direktori data ada dan persisten
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "survei.db");

// Singleton connection
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");

    // Inisialisasi tabel HANYA jika belum ada (CREATE TABLE IF NOT EXISTS)
    // PENTING: TIDAK PERNAH reset table / seed ulang saat server restart
    dbInstance.exec(`
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

      CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_surveys_school_city ON surveys (school_city);
      CREATE INDEX IF NOT EXISTS idx_surveys_target_degree ON surveys (target_degree);
    `);
  }
  return dbInstance;
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
  fields_of_study: string[]; // parsed from JSON
  funding_source: string;
  obstacles: string[]; // parsed from JSON
  info_sources: string[]; // parsed from JSON
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

export function saveSurvey(input: SurveyInput): number {
  const db = getDb();
  const stmt = db.prepare(`
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
    ) VALUES (
      @school_name,
      @school_city,
      @grade_level,
      @age_group,
      @gender,
      @intention,
      @target_degree,
      @target_time,
      @considered_program,
      @target_region,
      @fields_of_study,
      @funding_source,
      @obstacles,
      @info_sources,
      @needs_counseling,
      @consent
    )
  `);

  const info = stmt.run({
    school_name: input.school_name.trim(),
    school_city: input.school_city.trim(),
    grade_level: input.grade_level,
    age_group: input.age_group,
    gender: input.gender || "Tidak ingin menyebutkan",
    intention: input.intention,
    target_degree: input.target_degree,
    target_time: input.target_time,
    considered_program: input.considered_program?.trim() || "",
    target_region: input.target_region,
    fields_of_study: JSON.stringify(input.fields_of_study || []),
    funding_source: input.funding_source,
    obstacles: JSON.stringify(input.obstacles || []),
    info_sources: JSON.stringify(input.info_sources || []),
    needs_counseling: input.needs_counseling,
    consent: input.consent ? 1 : 0,
  });

  return Number(info.lastInsertRowid);
}

export function getAllSurveys(): SurveyRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM surveys ORDER BY id DESC").all() as Array<{
    id: number;
    school_name: string;
    school_city: string;
    grade_level: string;
    age_group: string;
    gender: string | null;
    intention: string;
    target_degree: string;
    target_time: string;
    considered_program: string | null;
    target_region: string;
    fields_of_study: string;
    funding_source: string;
    obstacles: string;
    info_sources: string;
    needs_counseling: string;
    consent: number;
    created_at: string;
  }>;

  return rows.map((r) => ({
    ...r,
    fields_of_study: safeJsonParse<string[]>(r.fields_of_study, []),
    obstacles: safeJsonParse<string[]>(r.obstacles, []),
    info_sources: safeJsonParse<string[]>(r.info_sources, []),
  }));
}

export function deleteSurvey(id: number): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM surveys WHERE id = ?").run(id);
  return info.changes > 0;
}

export function getSurveyStats() {
  const surveys = getAllSurveys();
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

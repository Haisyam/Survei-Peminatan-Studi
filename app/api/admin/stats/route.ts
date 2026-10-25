import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getSurveyStats } from "@/lib/db";

export async function GET() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = getSurveyStats();
  return NextResponse.json({ stats });
}

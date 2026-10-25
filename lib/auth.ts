import { cookies } from "next/headers";

const ADMIN_USERNAME = "fergapras";
const ADMIN_PASSWORD = "bernasberkualitas";
const AUTH_COOKIE_NAME = "unma_admin_token";
const SESSION_SECRET = "unma_bernas_berkualitas_2026_super_secret_salt";

// Simple reliable token generation for server-side auth
function generateToken(username: string): string {
  const timestamp = Date.now();
  const raw = `${username}:${timestamp}:${SESSION_SECRET}`;
  // Buffer base64
  const signature = Buffer.from(raw).toString("base64url");
  return `${username}.${timestamp}.${signature}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [user, tsStr, signature] = parts;
    if (user !== ADMIN_USERNAME) return false;

    // Verify signature
    const expectedRaw = `${user}:${tsStr}:${SESSION_SECRET}`;
    const expectedSig = Buffer.from(expectedRaw).toString("base64url");
    if (signature !== expectedSig) return false;

    // Optional expiration (7 days)
    const ts = parseInt(tsStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - ts > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

export function validateCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USERNAME && pass === ADMIN_PASSWORD;
}

export function createAdminSessionToken(): string {
  return generateToken(ADMIN_USERNAME);
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifyToken(token);
}

export { AUTH_COOKIE_NAME };

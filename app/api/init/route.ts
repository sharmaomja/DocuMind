import { initDB } from "@/lib/init-db";

export async function GET() {
  await initDB();
  return Response.json({ message: "Database ready" });
}
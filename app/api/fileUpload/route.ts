import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

  const uploadDir = path.join(process.cwd(), "public/uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

for (const file of files) {
  console.log("Processing file:", file.name);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(uploadDir, file.name);
  await fs.promises.writeFile(filePath, buffer);

  let content = "";

  if (file.type === "text/plain" || file.type === "text/csv") {
    content = buffer.toString("utf-8");
  } else {
    content = `[Binary file stored at ${filePath}]`;
  }

  const result = await sql`
    INSERT INTO documents (file_name, content)
    VALUES (${file.name}, ${content})
    RETURNING *;
  `;

  console.log("Inserted row:", result);
}

  return NextResponse.json({ message: "Upload success" });
}
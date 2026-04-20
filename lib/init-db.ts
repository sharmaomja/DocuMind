import { sql } from "./db";

export async function initDB() {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      file_name TEXT,
      chunk_index INT,
      content TEXT,
      embedding VECTOR(1536),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS documents_embedding_idx
    ON documents
    USING ivfflat (embedding vector_cosine_ops);
  `;

  console.log("DB initialized");
}
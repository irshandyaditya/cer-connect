import { randomUUID } from "crypto";
import path from "path";

export async function uploadDocument(file: Express.Multer.File) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "documents";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables"
    );
  }

  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${randomUUID()}${ext}`;

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,                    // <-- ini yang kurang
      "Content-Type": file.mimetype,
      "x-upsert": "false",
    },
    body: file.buffer,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase Storage upload failed: ${err}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;

  return {
    filename,
    url: publicUrl,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function shuffleCardsPerColumn(maps: any[]): any[] {
  return maps.map((map) => {
    if (!map.cards || map.cards.length === 0) return map;

    const columns = ["CLAIM", "EVIDENCE", "REASONING"] as const;
    const shuffled: typeof map.cards = [];

    for (const col of columns) {
      const colCards = map.cards.filter((c: any) => c.column === col);
      shuffled.push(...shuffleArray(colCards));
    }

    return { ...map, cards: shuffled, connections: [] };
  });
}
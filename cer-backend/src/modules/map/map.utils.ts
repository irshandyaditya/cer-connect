import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export function saveDocument(file: Express.Multer.File) {
  const uploadDir = path.join(process.cwd(), "storage", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);

  const filename = `${Date.now()}-${randomUUID()}${ext}`;

  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  return {
    filename,
    filepath,
    url: `/storage/uploads/${filename}`,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
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
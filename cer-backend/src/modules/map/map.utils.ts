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
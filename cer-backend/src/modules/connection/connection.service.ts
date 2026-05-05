import prisma from "../../config/prisma";
import { httpError } from "../../utils/http-error";

export const createConnections = async (mapId: string, connections: any[]) => {
  // VALIDASI RULE CER
  const fromMap = new Map<string, number>();

  for (const conn of connections) {
    if (fromMap.has(conn.fromId)) {
      throw httpError(400, "Card hanya boleh punya 1 koneksi keluar");
    }
    fromMap.set(conn.fromId, 1);
  }

  return prisma.connection.createMany({
    data: connections.map(c => ({
      ...c,
      mapId,
    })),
  });
};
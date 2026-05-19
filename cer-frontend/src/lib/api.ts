const BASE_URL = "http://localhost:3020/api";

// ── Types ──────────────────────────────────────────────────────────────

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: "STUDENT" | "TEACHER";
};

export type LoginResponse = {
  status: string;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type GroupItem = {
  id: string;
  name: string;
};

export type GroupsResponse = {
  status: string;
  message: string;
  data: GroupItem[];
};

export type JwtPayload = {
  id: string;
  role: "STUDENT" | "TEACHER";
  group: string;
  iat: number;
  exp: number;
};

export type MapItem = {
  id: string;
  title: string;
  description: string | null;
  documentUrl: string | null;
  timeoutAt: string;
  groupId: string;
  teacherId: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
    fullName: string;
  };
};

export type CardItem = {
  id: string;
  text: string;
  column: "CLAIM" | "EVIDENCE" | "REASONING";
  mapId: string;
};

export type ConnectionItem = {
  id: string;
  mapId: string;
  fromId: string;
  toId: string;
};

export type MapDetail = MapItem & {
  cards: CardItem[];
  connections: ConnectionItem[];
};

export type MapsResponse = {
  status: string;
  message: string;
  data: MapItem[];
};

export type CreateMapPayload = {
  title: string;
  description?: string;
  document?: File | null;
  timeoutAt: string;
  groupId: string;
};

export type SubmissionEntry = {
  id: string;
  score: number | null;
  submittedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    group: { id: string; name: string } | null;
  };
}

// ── Auth ───────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auths/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Login gagal. Periksa username dan password.");
  }

  return res.json();
}

export async function getGroups(token: string): Promise<GroupsResponse> {
  const res = await fetch(`${BASE_URL}/auths/groups`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memuat daftar group.");
  }

  return res.json();
}

// ── Maps ───────────────────────────────────────────────────────────────

export async function getMaps(token: string): Promise<MapsResponse> {
  const res = await fetch(`${BASE_URL}/maps/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memuat daftar map.");
  }

  return res.json();
}

export async function getMapDetail(
  token: string,
  mapId: string
): Promise<{ status: string; message: string; data: MapDetail }> {
  const res = await fetch(`${BASE_URL}/maps/${mapId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memuat detail map.");
  }

  return res.json();
}

export async function createMap(
  token: string,
  payload: CreateMapPayload
): Promise<{ status: string; message: string; data: MapItem }> {

  const formData = new FormData();

  formData.append("title", payload.title);

  formData.append("timeoutAt", payload.timeoutAt);

  formData.append("groupId", payload.groupId);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.document) {
    formData.append("document", payload.document);
  }

  const res = await fetch(`${BASE_URL}/maps/`, {
    method: "POST",
    headers: {
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify(payload),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal membuat map baru.");
  }

  return res.json();
}


// ── Cards ──────────────────────────────────────────────────────────────

export type CardPayloadItem = {
  text: string;
  column: "CLAIM" | "EVIDENCE" | "REASONING";
};

export type CardResult = {
  id: string;
  text: string;
  column: string;
  mapId: string;
};

export async function createCards(
  token: string,
  mapId: string,
  cards: CardPayloadItem[]
): Promise<{ status: string; message: string; data: CardResult[] }> {
  const res = await fetch(`${BASE_URL}/cards/${mapId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cards),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menyimpan cards.");
  }

  return res.json();
}

// ── Connections ────────────────────────────────────────────────────────

export type ConnectionPayloadItem = {
  fromId: string;
  toId: string;
};

export async function createConnections(
  token: string,
  mapId: string,
  connections: ConnectionPayloadItem[]
): Promise<{ status: string; message: string; data: unknown }> {
  const res = await fetch(`${BASE_URL}/connections/${mapId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(connections),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menyimpan connections.");
  }

  return res.json();
}

// ── Submissions ────────────────────────────────────────────────────────

export type SubmitPayload = {
  mapId: string;
  answers: ConnectionPayloadItem[];
};

export type SubmitResult = {
  submissionId: string;
  score: number;
  correctAnswers: { fromId: string; toId: string }[];
};

export async function submitAnswers(
  token: string,
  payload: SubmitPayload
): Promise<{ status: string; message: string; data: SubmitResult }> {
  const res = await fetch(`${BASE_URL}/submissions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal submit jawaban.");
  }

  return res.json();
}

export async function getMapSubmissions(
  token: string,
  mapId: string
): Promise<{ status: string; message: string; data: SubmissionEntry[] }> {
  const res = await fetch(`${BASE_URL}/maps/${mapId}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memuat data submisi.");
  }

  return res.json();
}

// ── JWT decode (client-side, no lib needed) ────────────────────────────

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
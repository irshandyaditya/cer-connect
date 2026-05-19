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

export async function createMap(
  token: string,
  payload: CreateMapPayload
): Promise<{ status: string; message: string; data: MapItem }> {
  const res = await fetch(`${BASE_URL}/maps/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal membuat map baru.");
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
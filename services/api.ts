import Constants from "expo-constants";

// Derive backend URL dynamically for Expo Go / emulators
let BASE_URL = "http://localhost:3001";

try {
  // Classic manifest
  // @ts-ignore
  const dbgHost: string | undefined = Constants.manifest?.debuggerHost;
  if (dbgHost) {
    const host = dbgHost.split(":")[0];
    if (host) BASE_URL = `http://${host}:3001`;
  }

  // New manifest2 (SDK 48+)
  // @ts-ignore
  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ?? Constants.manifest2?.developer?.url;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) BASE_URL = `http://${host}:3001`;
  }
} catch {}

export async function createOrGetUser(nick: string) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick }),
  });
  if (!res.ok) throw new Error("Erro ao criar/obter usuário");
  return res.json();
}

export async function getUser(nick: string) {
  const res = await fetch(`${BASE_URL}/users/${nick}`);
  if (!res.ok) throw new Error("Usuário não encontrado");
  return res.json();
}

export async function gainRandomModifier(nick: string) {
  const res = await fetch(`${BASE_URL}/users/${nick}/gain`, { method: "POST" });
  if (!res.ok) throw new Error("Erro ao ganhar modificador");
  return res.json();
}

export async function useModifier(nick: string, modifier: string) {
  const res = await fetch(`${BASE_URL}/users/${nick}/use`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modifier }),
  });
  if (!res.ok) throw new Error("Erro ao usar modificador");
  return res.json();
}

export const BASE = BASE_URL;

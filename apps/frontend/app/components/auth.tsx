"use client";
export function saveAuth(token: string, role: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ai_token", token);
    localStorage.setItem("ai_role", role);
  }
}

export function getAuth() {
  if (typeof window === "undefined") return null;
  return {
    token: localStorage.getItem("ai_token"),
    role: localStorage.getItem("ai_role"),
  };
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ai_token");
    localStorage.removeItem("ai_role");
  }
}

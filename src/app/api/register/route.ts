import { NextResponse } from "next/server";
import { isValidPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/validation/password";
import { getUsernameFieldError } from "@/lib/validation/username";

function messageFromBackendErrorBody(text: string): string {
  if (!text.trim()) {
    return "Impossible de créer le compte.";
  }
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
    const fieldMessages = Object.values(data).filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );
    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }
  } catch {
    return text;
  }
  return text;
}

export async function POST(request: Request) {
  const { username, firstName, lastName, email, password, dateOfBirth } =
    await request.json();

  if (!username || !firstName || !lastName || !email || !password || !dateOfBirth) {
    return NextResponse.json(
      { message: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  const usernameError = getUsernameFieldError(String(username));
  if (usernameError) {
    return NextResponse.json({ message: usernameError }, { status: 400 });
  }

  if (!isValidPassword(String(password))) {
    return NextResponse.json(
      { message: PASSWORD_REQUIREMENTS_MESSAGE },
      { status: 400 }
    );
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!backendBase) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL manquant." },
      { status: 500 }
    );
  }

  const res = await fetch(`${backendBase}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: String(username).trim(),
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      role: "CITIZEN",
    }),
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    return NextResponse.json(
      { message: messageFromBackendErrorBody(text) },
      { status: res.status }
    );
  }

  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  return NextResponse.json(
    { success: true, message: "Utilisateur créé avec succès.", user: data },
    { status: 201 }
  );
}

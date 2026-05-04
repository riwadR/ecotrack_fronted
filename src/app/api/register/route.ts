import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { firstName, lastName, email, password, dateOfBirth } =
    await request.json();

  if (!firstName || !lastName || !email || !password || !dateOfBirth) {
    return NextResponse.json(
      { message: "Tous les champs sont obligatoires." },
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
      { message: text || "Impossible de créer le compte." },
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
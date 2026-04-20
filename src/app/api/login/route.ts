import { NextResponse } from "next/server";

// Simule une base utilisateurs avec rôles
const USERS = [
  { email: "admin@test.com",       password: "123456", role: "ADMIN",        name: "Admin EcoTrack" },
  { email: "gestionnaire@test.com",password: "123456", role: "GESTIONNAIRE", name: "Marie Dupont" },
  { email: "agent@test.com",       password: "123456", role: "AGENT",        name: "Pierre Martin" },
  { email: "test@test.com",        password: "123456", role: "CITOYEN",      name: "Jean Citoyen" },
];

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    return NextResponse.json(
      { message: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true, role: user.role });

  // Stocke email + role dans le cookie (encodé en base64 simple)
  const payload = Buffer.from(
    JSON.stringify({ email: user.email, name: user.name, role: user.role })
  ).toString("base64");

  response.cookies.set("token", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
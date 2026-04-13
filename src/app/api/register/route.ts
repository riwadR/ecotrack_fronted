import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { firstName, lastName, email, password } = await request.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { message: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Le mot de passe doit contenir au moins 6 caractères." },
      { status: 400 }
    );
  }

  if (email === "test@test.com") {
    return NextResponse.json(
      { message: "Cet email est déjà utilisé." },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Utilisateur créé avec succès.",
      user: {
        firstName,
        lastName,
        email,
      },
    },
    { status: 201 }
  );
}
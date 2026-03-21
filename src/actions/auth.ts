"use server";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { signupInput } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function signup(data: { name: string; email: string; password: string }) {
  const parsed = signupInput.parse(data);

  const existing = await db.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  await db.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
    },
  });

  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirectTo: "/",
  });
}

export async function login(data: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

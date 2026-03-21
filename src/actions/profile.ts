"use server";

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const passwordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function updateProfile(data: { name: string; email: string }) {
  const user = await getRequiredUser();
  const parsed = profileInput.parse(data);

  // Check if email is taken by another user
  if (parsed.email !== user.email) {
    const existing = await db.user.findUnique({ where: { email: parsed.email } });
    if (existing) return { error: "Email is already in use" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.name, email: parsed.email },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const user = await getRequiredUser();
  const parsed = passwordInput.parse(data);

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "User not found" };

  const valid = await bcrypt.compare(parsed.currentPassword, dbUser.passwordHash);
  if (!valid) return { error: "Current password is incorrect" };

  const passwordHash = await bcrypt.hash(parsed.newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function deleteAccount() {
  const user = await getRequiredUser();
  await db.user.delete({ where: { id: user.id } });
}

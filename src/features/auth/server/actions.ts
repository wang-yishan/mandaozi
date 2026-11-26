"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { userProfiles, userProgress, users } from "@/db/schema";
import { auth } from "@/lib/auth";

async function ensureUserRows(userId: string, now: Date) {
  await db
    .insert(userProfiles)
    .values({ userId, updatedAt: now })
    .onConflictDoNothing();

  await db
    .insert(userProgress)
    .values({ userId, updatedAt: now })
    .onConflictDoNothing();
}

export async function completePhoneSignupAction(input: {
  newPassword: string;
  name?: string;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    return { ok: false as const, error: "UNAUTHORIZED" };
  }

  const password = input.newPassword;
  if (password.length < 8 || password.length > 128) {
    return { ok: false as const, error: "INVALID_PASSWORD" };
  }

  try {
    await auth.api.setPassword({
      body: { newPassword: password },
      headers: requestHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SET_PASSWORD_FAILED";
    if (message.includes("PASSWORD_ALREADY_SET")) {
      return {
        ok: false as const,
        error: "PASSWORD_ALREADY_SET",
      };
    }
    return { ok: false as const, error: message };
  }

  const name = input.name?.trim();
  const now = new Date();
  if (name) {
    await db
      .update(users)
      .set({ name, updatedAt: now })
      .where(eq(users.id, session.user.id));
  }

  await ensureUserRows(session.user.id, now);
  return { ok: true as const };
}

export async function ensureCurrentUserRowsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false as const, error: "UNAUTHORIZED" };
  await ensureUserRows(session.user.id, new Date());
  return { ok: true as const };
}
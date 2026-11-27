"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { accounts, userProfiles, userProgress, users } from "@/db/schema";
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

export async function hasCredentialPassword(userId: string) {
  const row = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.providerId, "credential"),
        isNotNull(accounts.password),
      ),
    )
    .limit(1);
  return row.length > 0;
}

export async function getAuthRegistrationState() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      authenticated: false as const,
      registrationComplete: false as const,
      user: null,
    };
  }

  const registrationComplete = await hasCredentialPassword(session.user.id);
  const user = session.user as typeof session.user & {
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean | null;
  };
  return {
    authenticated: true as const,
    registrationComplete,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phoneNumber: user.phoneNumber ?? null,
      phoneNumberVerified: user.phoneNumberVerified ?? false,
    },
  };
}

export async function completePhoneSignupAction(input: {
  newPassword: string;
  name: string;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    return { ok: false as const, error: "UNAUTHORIZED" as const };
  }

  const password = input.newPassword;
  if (password.length < 8 || password.length > 128) {
    return { ok: false as const, error: "INVALID_PASSWORD" as const };
  }

  const name = input.name?.trim();
  if (!name || name.length < 2 || name.length > 80) {
    return { ok: false as const, error: "INVALID_NAME" as const };
  }

  const now = new Date();
  const alreadyHasPassword = await hasCredentialPassword(session.user.id);

  if (alreadyHasPassword) {
    await db
      .update(users)
      .set({ name, updatedAt: now })
      .where(eq(users.id, session.user.id));
    await ensureUserRows(session.user.id, now);
    return { ok: false as const, error: "PASSWORD_ALREADY_SET" as const };
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
      await ensureUserRows(session.user.id, now);
      return { ok: false as const, error: "PASSWORD_ALREADY_SET" as const };
    }
    return { ok: false as const, error: "SET_PASSWORD_FAILED" as const };
  }

  await db
    .update(users)
    .set({ name, updatedAt: now })
    .where(eq(users.id, session.user.id));

  await ensureUserRows(session.user.id, now);

  return { ok: true as const, alreadyRegistered: false as const };
}

export async function ensureCurrentUserRowsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false as const, error: "UNAUTHORIZED" as const };
  await ensureUserRows(session.user.id, new Date());
  return { ok: true as const };
}

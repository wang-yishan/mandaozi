"use server";

import { headers } from "next/headers";
import {
  ensureUserRows,
  getMadaraPersistedState,
  getPhonicsPersistedState,
  hasAnyUserState,
  saveMadaraPersistedState,
  savePhonicsPersistedState,
  type MadaraPersistedState,
  type PhonicsPersistedState,
} from "@/db/repositories/user-state.repo";
import { auth } from "@/lib/auth";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

export async function loadUserStateAction() {
  const userId = await requireUserId();
  ensureUserRows(userId);
  const [madara, phonics, hasState] = [
    getMadaraPersistedState(userId),
    getPhonicsPersistedState(userId),
    hasAnyUserState(userId),
  ];
  return { madara, phonics, hasState };
}

export async function saveMadaraStateAction(state: MadaraPersistedState) {
  const userId = await requireUserId();
  saveMadaraPersistedState(userId, state);
  return { ok: true as const };
}

export async function savePhonicsStateAction(state: PhonicsPersistedState) {
  const userId = await requireUserId();
  savePhonicsPersistedState(userId, state);
  return { ok: true as const };
}

export async function migrateLocalStorageStateAction(input: {
  madara?: MadaraPersistedState | null;
  phonics?: PhonicsPersistedState | null;
}) {
  const userId = await requireUserId();
  if (hasAnyUserState(userId)) {
    return { migrated: false as const, reason: "db-has-state" as const };
  }

  if (input.madara) saveMadaraPersistedState(userId, input.madara);
  if (input.phonics) savePhonicsPersistedState(userId, input.phonics);

  return { migrated: true as const };
}
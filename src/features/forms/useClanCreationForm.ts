import { useForm } from "@tanstack/react-form";
import type { ClanCreationValues } from "./types";

export const defaultClanCreationValues: ClanCreationValues = {
  name: "",
  description: "",
  rules: [""],
  contact: {
    email: "",
    phone: "",
  },
  founders: [{ name: "", role: "" }],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Names the clan service reports as already taken. */
const takenClanNames = new Set(["wolfpack", "shadowclan", "ironguard", "nightfall"]);

/** Sync validator: required + format checks, returns an error message or nothing. */
export function validateClanName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Clan name is required.";
  if (trimmed.length < 3) return "Clan name must be at least 3 characters.";
  return undefined;
}

/** Async debounced validator: checks the clan name is not already taken. */
export async function validateClanNameIsTaken(value: string): Promise<string | undefined> {
  if (!takenClanNames.has(value.trim().toLowerCase())) return undefined;
  return "That clan name is already taken.";
}

/** Sync validator: description must not be empty. */
export function validateClanDescription(value: string): string | undefined {
  return value.trim() ? undefined : "Clan description is required.";
}

/** Sync validator: contact email must be present and well-formed. */
export function validateContactEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Contact email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return undefined;
}

/** Sync validator: founder name must not be empty. */
export function validateFounderName(value: string): string | undefined {
  return value.trim() ? undefined : "Founder name is required.";
}

/** Sync validator: each rule must say something. */
export function validateClanRule(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "A clan rule cannot be empty.";
  if (trimmed.length < 2) return "Clan rules should say something.";
  return undefined;
}

/**
 * Headless clan creation form: form + field APIs from TanStack Form, with
 * typed values, validators, and defaults. Rendering stays with the UI layer.
 */
export function useClanCreationForm() {
  return useForm({
    defaultValues: defaultClanCreationValues,
    onSubmit: () => {
      // The clan creation call goes here once the clan service is wired to the backend.
    },
  });
}

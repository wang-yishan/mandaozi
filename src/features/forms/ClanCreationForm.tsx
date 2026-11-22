"use client";

import type { DeepKeys } from "@tanstack/react-form";
import type { ClanCreationValues } from "./types";
import {
  useClanCreationForm,
  validateClanDescription,
  validateClanName,
  validateClanNameIsTaken,
  validateClanRule,
  validateContactEmail,
  validateFounderName,
} from "./useClanCreationForm";

type FieldKey = DeepKeys<ClanCreationValues>;

type RuleKey = Extract<FieldKey, `rules[${number}]`>;
type FounderNameKey = Extract<FieldKey, `founders[${number}].name`>;
type FounderRoleKey = Extract<FieldKey, `founders[${number}].role`>;

function ruleKey(index: number): RuleKey {
  return `rules[${index}]` as RuleKey;
}

function founderNameKey(index: number): FounderNameKey {
  return `founders[${index}].name` as FounderNameKey;
}

function founderRoleKey(index: number): FounderRoleKey {
  return `founders[${index}].role` as FounderRoleKey;
}

/**
 * Clan creation form — headless logic in `useClanCreationForm`, accessible
 * product-specific controls here: labeled inputs, error messages announced
 * with `role="alert"`, and granular subscriptions via `form.Subscribe` and
 * per-field `form.Field` render props so only relevant UI updates.
 */
export function ClanCreationForm() {
  const form = useClanCreationForm();

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {/* Clan name — sync validators on change, debounced async uniqueness check. */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => validateClanName(value),
          onChangeAsync: ({ value }) => validateClanNameIsTaken(value),
          onChangeAsyncDebounceMs: 300,
        }}
      >
        {(field) => {
          const error = field.state.meta.errors[0];
          return (
            <div>
              <label htmlFor={field.name}>Clan name</label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
              {error ? (
                <p id={`${field.name}-error`} role="alert">
                  {String(error)}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      {/* Clan description. */}
      <form.Field
        name="description"
        validators={{ onChange: ({ value }) => validateClanDescription(value) }}
      >
        {(field) => {
          const error = field.state.meta.errors[0];
          return (
            <div>
              <label htmlFor={field.name}>Clan description</label>
              <textarea
                id={field.name}
                rows={3}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
              {error ? (
                <p id={`${field.name}-error`} role="alert">
                  {String(error)}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      {/* Contact details — nested object. */}
      <form.Field
        name="contact.email"
        validators={{ onChange: ({ value }) => validateContactEmail(value) }}
      >
        {(field) => {
          const error = field.state.meta.errors[0];
          return (
            <div>
              <label htmlFor={field.name}>Contact email</label>
              <input
                id={field.name}
                type="email"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
              {error ? (
                <p id={`${field.name}-error`} role="alert">
                  {String(error)}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>
      <form.Field name="contact.phone">
        {(field) => (
          <div>
            <label htmlFor={field.name}>Contact phone</label>
            <input
              id={field.name}
              type="tel"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      {/* Clan rules — array of strings. */}
      <form.Field mode="array" name="rules">
        {(field) => (
          <fieldset>
            <legend>Clan rules</legend>
            {field.state.value.map((_rule, index) => (
              <form.Field
                key={ruleKey(index)}
                name={ruleKey(index)}
                validators={{
                  onChange: ({ value }) => validateClanRule(value),
                }}
              >
                {(ruleField) => {
                  const error = ruleField.state.meta.errors[0];
                  return (
                    <div>
                      <input
                        id={ruleField.name}
                        type="text"
                        value={ruleField.state.value}
                        onChange={(event) =>
                          ruleField.handleChange(event.target.value)
                        }
                        onBlur={ruleField.handleBlur}
                        placeholder="A clan rule…"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={
                          error ? `${ruleField.name}-error` : undefined
                        }
                      />
                      {error ? (
                        <p id={`${ruleField.name}-error`} role="alert">
                          {String(error)}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => form.removeFieldValue("rules", index)}
                      >
                        Remove rule
                      </button>
                    </div>
                  );
                }}
              </form.Field>
            ))}
            <button
              type="button"
              onClick={() => form.pushFieldValue("rules", "")}
            >
              Add rule
            </button>
          </fieldset>
        )}
      </form.Field>

      {/* Founding members — array of objects. */}
      <form.Field mode="array" name="founders">
        {(field) => (
          <fieldset>
            <legend>Founding members</legend>
            {field.state.value.map((_founder, index) => (
              <div key={founderNameKey(index)}>
                <form.Field
                  name={founderNameKey(index)}
                  validators={{
                    onChange: ({ value }) => validateFounderName(value),
                  }}
                >
                  {(nameField) => {
                    const error = nameField.state.meta.errors[0];
                    return (
                      <div>
                        <label htmlFor={nameField.name}>
                          Founder {index + 1}
                        </label>
                        <input
                          id={nameField.name}
                          type="text"
                          value={nameField.state.value}
                          onChange={(event) =>
                            nameField.handleChange(event.target.value)
                          }
                          onBlur={nameField.handleBlur}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={
                            error ? `${nameField.name}-error` : undefined
                          }
                        />
                        {error ? (
                          <p id={`${nameField.name}-error`} role="alert">
                            {String(error)}
                          </p>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>
                <form.Field name={founderRoleKey(index)}>
                  {(roleField) => (
                    <div>
                      <label htmlFor={roleField.name}>
                        Founder {index + 1} role
                      </label>
                      <input
                        id={roleField.name}
                        type="text"
                        value={roleField.state.value}
                        onChange={(event) =>
                          roleField.handleChange(event.target.value)
                        }
                        onBlur={roleField.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                form.pushFieldValue("founders", { name: "", role: "" })
              }
            >
              Add founder
            </button>
          </fieldset>
        )}
      </form.Field>

      {/* Granular subscriptions: the submit button only re-renders on the
          form state it reads (canSubmit / isSubmitting / isSubmitted). */}
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          isSubmitted: state.isSubmitted,
        })}
      >
        {({ canSubmit, isSubmitting, isSubmitted }) => (
          <>
            {isSubmitted ? <output>Your clan has been created.</output> : null}
            <button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creating clan…" : "Create clan"}
            </button>
          </>
        )}
      </form.Subscribe>
    </form>
  );
}

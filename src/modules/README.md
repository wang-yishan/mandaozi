# Modules

Feature-based modules live under `src/modules/<feature>/`. Each module owns its UI, hooks, services, types, utils, and constants. Routes in `src/app/` should be thin wrappers that import from module public APIs.

## Structure

```text
src/modules/<feature>/
  components/   # Feature UI components
  sections/     # Composed page sections
  hooks/        # Feature hooks/state
  services/     # Data fetching/mutations
  types/        # Feature TypeScript types
  utils/        # Feature helpers
  constants/    # Feature constants/data
  index.ts      # Public exports only
```

Create only folders/files that are needed. Do not add empty placeholders for unused layers.

## Current Modules

- `home` - home overview, missions, stats, streak, right rail widget
- `world` - world explorer/categories/progress, category/lesson/complete flow
- `practice` - practice hub and practice modes
- `dictionary` - dictionary views and shared dictionary UI
- `profile` - profile overview/achievements/preferences/account
- `onboarding` - onboarding flow
- `catalog` - all-features drawer and feature-detail/catalog data
- `enrollment` - intensive enrollment modal/gate

## Import Conventions

- **App routes** (`src/app/**`) import from `@/modules/<feature>`.
- **Modules** may import from `@/components/ui`, `@/components/layout`, `@/components/shared`, `@/lib`, `@/store`, `@/types`, `@/config`, and other global infra.
- **Modules must not import unrelated module internals.** If code is truly shared, move it to `src/components/*`, `src/lib/*`, `src/types/*`, or another global infra location and import from there.
- **Shared components must not import feature modules.**
- Prefer relative imports within the same module; use `@/modules/<feature>` only when crossing module boundary through the public API (and only when that dependency is intentional and allowed).

## Public Exports

- `index.ts` is the module's public API.
- Export only what routes or other allowed consumers need.
- Do not export internal helpers/components by default.
- When adding a route-facing component, add it to `index.ts` explicitly.

## Creating a New Module

1. Create `src/modules/<feature>/`.
2. Add only the subfolders you need (e.g. `components/`, `types/`).
3. Implement feature code inside the module.
4. Export the public surface from `src/modules/<feature>/index.ts`.
5. Add a thin route in `src/app/` that imports from `@/modules/<feature>`.
6. If logic is reusable across features, promote it to `src/components/*`, `src/lib/*`, `src/hooks/*`, `src/types/*`, or `src/services/*` instead of duplicating.

## Sharing Components

- `src/components/ui/`: reusable UI primitives (buttons/cards/chips/toast/etc.).
- `src/components/layout/`: app shell, navigation, layout binders.
- `src/components/shared/`: reusable cross-feature components that are not low-level UI primitives.
- Move a component out of a module only when it is genuinely reused or is clearly global layout/infra. Keep feature-specific UI inside the module.

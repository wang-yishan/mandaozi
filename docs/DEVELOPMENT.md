# Development Status

## Arsitektur saat ini

- **Workspace Bun (root `package.json`):**
  ```json
  "workspaces": ["apps/*", "packages/*"],
  "packageManager": "bun@1.4.5"
  ```
- **Aplikasi utama (Root Next.js):** `src/app/page.tsx` = route `/`; `next dev`/`build` tetap di root dengan `next.config.ts`, `tsconfig.json` (alias `@/*` = `./src/*`).
- **`apps/web`:** scaffold kosong (hanya `.gitkeep` + stub `package.json`, name `web`, v0.0.0). Ditahan sebagai workspace member. Belum ada kode, belum dipakai.
- **`apps/mobile`:** scaffold kosong (hanya `.gitkeep` + stub `package.json`, name `mobile`, v0.0.0). Ditahan sebagai workspace member. Aplikasi mobile belum dibangun.
- **`packages/*`:** dialokasikan untuk pengembangan nanti di aplikasi mobile.

## Aturan packages nanti (mobile)

- **Logic shareable** (dipakai web + mobile): API contracts (`packages/api/contracts/`), type definitions (`packages/shared/types/`), validation schemas (`packages/shared/schemas/`, `packages/validation/`), constants (`packages/shared/constants/`), XP/level/ranking/scoring (`packages/business/{leveling,ranking,chat,quiz,communities}/`), permission rules, business logic.
- **API client:** gunakan `packages/api/client/` — jangan bikin HTTP client di sana.
- **Peraturan hard (lihat AGENTS.md):** logic di `packages/` harus independen dari React dan Next.js; jangan gunakan `window`/`document`/`localStorage` di sana; jangan tambah dependency web-only (Tailwind, Tiptap, browser-only) ke `packages/*` — web-only deps hanya di `apps/web`.

## Routing

Route ditentukan hanya oleh folder `app/` tempat `next dev` jalan:

| File (di cwd `next dev`) | URL |
|---|---|
| `src/app/page.tsx` (root) | `/` |
| `src/app/chat/page.tsx` | `/chat` |
| `src/app/chat/[roomId]/page.tsx` | `/chat/:roomId` |
| `src/app/api/quizzes/route.ts` | `/api/quizzes` |

### Alur jika folder diganti nanti

1. **Ganti/tambah folder luar `app/`** (`components/`, `services/`, `stores/`, `types/`, `packages/`, dll): **URL tidak berubah** — cuma mempengaruhi kode, import paths, bukan route.
2. **Ganti folder di dalam `app/`** (mis. `app/chat/` → `app/messages/`): **URL ikut berubah** (folder = segmen URL). Untuk ganti struktur tapi URL tetap: pakai route group `app/(forum)/chat/page.tsx` (tetap `/chat`) atau pasang `redirects` di `next.config.ts`.
3. **Pindah aplikasi ke `apps/web` (jika diaktifkan):** jalankan `next dev` dari `apps/web` (mis. `bun run --cwd apps/web dev`), move `src/app`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts` ke `apps/web`, update alias `@/*` relatif ke `apps/web`, dep Next/React ke `apps/web/package.json`, jalankan `bun install`, cek `/` muncul, baru pindahkan kode ke root dan arahkan script root ke workspace. URL tetap sama selama folder `app/` isinya tidak diganti.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Project Engineering Guidelines
1. Project Vision

Build a high-performance, web-first community and collaboration platform with a future native mobile application.

The platform combines:

Real-time messaging and chat rooms.
Communities, clans, groups, and forums.
Quizzes, assessments, and competitive challenges.
User XP, levels, achievements, and rankings.
Shared notes and collaborative documents.
User profiles and social interactions.
Core Development Philosophy
Web-first, mobile-ready.
Performance over unnecessary abstraction.
Reusable business logic.
Strong TypeScript standards.
Scalable and maintainable architecture.
Independent frontend and backend.
Avoid unnecessary dependencies.
Design for mobile screens from the beginning.

The web application must work independently while allowing a future React Native application to reuse shared logic and services.

2. Technology Stack
Web Frontend
Next.js (App Router)
React
TypeScript (strict mode)
Tailwind CSS
shadcn/ui
Lucide React
State Management
Zustand for client-side application state.
TanStack Query for server state, caching, and synchronization.
React Hook Form for forms.
Zod for validation.
Rich Content
Tiptap for rich-text editing.
Consider Yjs for collaborative editing and real-time synchronization.
Backend

Preferred initial backend:

Supabase
PostgreSQL
Supabase Auth
Supabase Realtime
Supabase Storage

Additional infrastructure when justified:

Redis for caching and rate limiting.
Background workers for asynchronous tasks.
Cloudflare for CDN and edge infrastructure.
Future Mobile Application
React Native
Expo
TypeScript
Expo Router

Do not introduce the mobile application prematurely. Prepare the architecture so it can be added without rewriting the business logic.

3. Architecture Principles

Use a modular monorepo architecture when shared packages become necessary.

Suggested structure:

```text
project/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── mobile/
│       ├── app/
│       ├── components/
│       ├── features/
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   ├── schemas/
│   │   └── constants/
│   │
│   ├── business/
│   │   ├── chat/
│   │   ├── quiz/
│   │   ├── ranking/
│   │   ├── leveling/
│   │   └── communities/
│   │
│   ├── api/
│   │   ├── client/
│   │   └── services/
│   │
│   └── config/
│
├── package.json
├── pnpm-workspace.yaml
└── AGENTS.md
```

This is the target architecture, not a requirement to create every directory immediately.

Start with a maintainable Next.js application and extract shared packages when there is a clear reason.

Important Architecture Rules
Keep business logic independent of React.
Keep business logic independent of Next.js.
Keep database access separate from UI components.
Avoid putting business rules inside React components.
Use shared TypeScript types and Zod schemas.
Avoid importing web-only libraries into shared packages.
Do not make the backend dependent on the frontend.
Prefer explicit feature boundaries.
4. Mobile Compatibility Rules

This is one of the most important requirements.

Every feature must be developed with future React Native compatibility in mind.

DO
Use TypeScript for all application logic.
Separate business logic from presentation.
Keep API calls in dedicated service modules.
Keep validation schemas reusable.
Use platform-independent date, number, and data utilities.
Build responsive interfaces.
Use semantic HTML for the web.
Design reusable tokens for colors, spacing, typography, and themes.
Keep authentication and session handling independent of web-specific browser APIs.
Use platform adapters for browser and native capabilities.
DON'T
Put business logic directly inside React components.
Depend on window, document, or localStorage in shared packages.
Import Next.js APIs into shared packages.
Use DOM manipulation for application functionality.
Assume every feature runs inside a browser.
Couple authentication to Next.js middleware alone.
Couple API requests to Next.js Server Actions.
Assume web components can run directly in React Native.
Important Distinction

Share logic, not necessarily UI.

The following should be reusable:

API clients.
Type definitions.
Validation schemas.
Authentication logic.
XP calculation.
Level progression.
Quiz scoring.
Ranking algorithms.
Permission rules.
Business logic.

Web and mobile may have different presentation components.

5. Frontend Development Rules
Component Architecture

Organize components by responsibility.

```text
components/
├── ui/
├── layout/
├── navigation/
└── shared/

features/
├── authentication/
├── chat/
├── communities/
├── forums/
├── quizzes/
├── rankings/
├── notes/
└── profiles/
```

Each feature should own its relevant components, hooks, services, and types where appropriate.

Component Rules
Prefer small, composable components.
Avoid giant components.
Avoid unnecessary prop drilling.
Use custom hooks for reusable React behavior.
Keep components focused on presentation and interaction.
Avoid premature abstraction.
Avoid unnecessary client-side rendering.
Server and Client Components

Use React Server Components by default.

Use Client Components only when functionality requires browser interaction, such as:

Interactive chat.
Forms.
Rich-text editing.
Realtime subscriptions.
Interactive quizzes.
Drag-and-drop.
Local UI state.

Do not mark entire pages as client components without a good reason.

6. Performance Requirements

Performance is a core product requirement.

General
Minimize unnecessary JavaScript.
Avoid unnecessary dependencies.
Use dynamic imports for heavy features where appropriate.
Optimize images and fonts.
Avoid unnecessary rerenders.
Use pagination for large datasets.
Use virtualization for long message and forum lists.
Avoid fetching data repeatedly.
Implement appropriate caching strategies.
Real-Time Chat
Use optimistic UI updates where appropriate.
Implement cursor-based message pagination.
Avoid subscribing to unnecessary database events.
Handle connection loss and reconnection.
Handle duplicate events safely.
Separate message persistence from realtime delivery.
Implement unread message tracking.
Keep presence updates efficient.
Rankings and Leveling
Do not recalculate every user's ranking on every page request.
Maintain ranking data efficiently.
Use server-authoritative score calculations.
Avoid trusting client-submitted XP values.
Process score changes safely and idempotently.
Use background processing when appropriate.
Shared Notes
Keep editor rendering efficient.
Avoid unnecessary document synchronization.
Handle concurrent edits.
Consider Yjs for collaborative editing.
Implement appropriate document permissions.
Handle offline edits and synchronization when supported.
7. Security and Data Integrity

Never trust the frontend as the authority for sensitive operations.

The backend must validate:

Authentication.
Authorization.
Group membership.
Chat permissions.
Forum permissions.
Quiz submissions.
XP awards.
Ranking updates.
Shared document access.

Use PostgreSQL Row Level Security where appropriate.

Never expose:

Service role keys.
Private API credentials.
Server secrets.
Unauthorized user data.

Use environment variables for secrets.

Validate all untrusted input on the server.

8. Real-Time Architecture

Realtime features should use a consistent architecture.

Examples:

| Feature | Realtime requirements |
| --- | --- |
| Chat | Message delivery, typing, presence |
| Communities | Membership and activity updates |
| Forums | New posts and comments |
| Rankings | Score and position updates |
| Shared notes | Collaborative editing |
| Notifications | New activity notifications |

Do not use realtime subscriptions as a replacement for database persistence.

The database remains the source of truth.

Implement reconnection, error handling, and appropriate subscription cleanup.

9. UI/UX Design Principles

The platform should feel modern, responsive, and application-oriented.

Design Requirements
Mobile-first responsive layouts.
Consistent spacing and typography.
Accessible interactions.
Clear loading states.
Skeleton loaders where appropriate.
Empty states.
Error states.
Responsive navigation.
Dark mode support.
Consistent design tokens.
Mobile-Ready Web Design

Every important screen should be usable on:

Desktop.
Laptop.
Tablet.
Mobile browser.

Do not rely exclusively on desktop-oriented navigation.

Keep touch targets comfortable and avoid layouts that require horizontal scrolling on mobile screens.

10. Development Workflow

Before implementing a feature:

Understand the feature requirements.
Identify its dependencies.
Define its data model.
Determine which logic belongs on the server.
Determine which logic can be shared with mobile.
Plan loading, error, and empty states.
Consider security and permissions.
Implement the feature.
Test it.
Review performance and maintainability.

Before adding a dependency:

Check whether an existing dependency already solves the problem.
Evaluate package maintenance.
Evaluate bundle size.
Check mobile compatibility.
Avoid unnecessary dependencies.

Do not rewrite existing architecture without a clear technical reason.

11. Testing Standards

Use appropriate testing at multiple levels.

Unit tests for business logic.
Integration tests for API and database operations.
Component tests for interactive UI.
End-to-end tests for important user journeys.

Important test cases:

Authentication and authorization.
Chat message delivery.
Realtime reconnection.
Quiz scoring correctness.
XP calculation correctness.
Level progression.
Ranking consistency.
Group permissions.
Concurrent note editing.
Responsive behavior.

Business logic should be testable without rendering React components.

12. AI Agent Behavior

When working on this project, follow these rules:

Read this AGENTS.md before making architectural changes.
Inspect existing code before creating new files.
Follow existing naming conventions.
Prefer incremental changes.
Do not introduce unnecessary dependencies.
Do not create duplicated business logic.
Keep TypeScript types accurate.
Do not use any unless absolutely necessary and documented.
Never hardcode secrets.
Do not silently remove existing functionality.
Do not introduce web-only dependencies into shared packages.
Explain architectural trade-offs when proposing significant changes.
Run relevant tests and type checks after implementation.
Keep documentation updated when architecture changes.
Do not prematurely build the mobile application.

Final Engineering Principle

Build the web application as the first platform, but design its underlying business logic, data models, API contracts, and architecture as a multi-platform system from day one.

The goal is to make the future mobile application an additional client of the same platform, not a completely separate product that requires rewriting all business functionality.

<policy>
## Budgets

Our recommended token budget for this task is 128,000 tokens.
</policy>

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.

OpenCode puts the MCP server's key in front of each tool's name, so it lists this tool as `codegraph_codegraph_explore` where other agents list `codegraph_explore`; if the server is registered under another key, that key replaces the first `codegraph_`.
<!-- CODEGRAPH_END -->

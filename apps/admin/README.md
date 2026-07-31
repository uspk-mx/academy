# admin — USPK Academy back office

Staff-only panel for everything that isn't the student experience: courses and
their curriculum, taxonomy, catalogue packaging, billing plans, enrollments and
companies. Deployed to `admin.uspkacademy.com`; runs on `:5175` locally.

```bash
cp .env.example .env
bun run dev
```

## How it differs from the other apps

- **No `:lang` prefix.** The panel is internal and Spanish-only, so routes are
  plain (`/courses`, `/memberships`). Paths match the previous admin app.
- **No CMS.** All copy is literal; nothing comes from Hygraph.
- **Staff-gated.** `adminAuthMiddleware` (in `@academy/admin-ui`) allows
  `admin` and `instructor`, mirroring the API's own resolver guards.
  `adminOnlyMiddleware` further restricts taxonomy, membership plans, companies
  and certificate templates to `admin`.
- **Invite-only accounts.** `/signup` forwards to `/login`; new staff arrive
  through `/invite?token=…`, which the API validates.

## Data flow

Every screen is SSR: the loader queries the Go API through
`@academy/courses-api/graphql/admin-app/*` and the route's own `action` handles
writes, dispatched by an `intent` field in the form data.

Writes go through `runMutation`, which returns `{ data, error, setCookies }`
rather than throwing — so a failed save surfaces as a toast instead of tripping
the error boundary. Pages submit with `useFetcher`, which revalidates the loader
on success, so there is no client-side cache to keep in sync.

List filtering lives in the URL (`?q=`, `?sort=`, `?page=`) and is applied by the
loader — either as API arguments (courses, bundles) or in-process for the
collections the API returns whole (`readListParams` / `sortAndFilter`).

## Routes

| Path | What it does |
| --- | --- |
| `/courses` | Course grid, search/sort/paginate, delete |
| `/courses/create` | Minimal create step — redirects into the builder |
| `/courses/:cid/builder` | Course settings (info, taxonomy, pricing, visibility) |
| `/courses/:cid/curriculum` | Topics → lessons + quizzes |
| `/courses/:cid/quiz/:quizId` | Questions, options and per-type settings |
| `/courses/:cid/lesson/:lessonId/practice` | Practice bites and their exercises |
| `/courses/:cid/additional` | Metadata, prerequisites, instructors |
| `/courses/levels`, `/courses/categories` | Taxonomy CRUD |
| `/courses/enrollments` | Enroll students, change status, remove |
| `/bundles`, `/learning-paths` | Catalogue packaging CRUD |
| `/memberships` | Subscription plans CRUD |
| `/companies` | B2B accounts + admin invitations |
| `/certificates/templates` | Certificate template CRUD |
| `/students`, `/instructors` | Read-only rosters |
| `/communication`, `/performance` | Placeholders — no API behind them yet |

## Media uploads

`MediaField` posts to the API's own storage endpoint (`POST /api/files/upload`,
multipart `file` + `folder`) and submits the returned R2 URL as a plain string
field, so every consumer stays a simple text column. A URL can still be pasted
for assets that live outside the bucket. Limit is 100 MB, matching the Go
handler's `MaxBytesReader`.

## Known gaps

- **Reordering** is by numeric "position" inputs; there is no drag-and-drop.
- `/communication` and `/performance` are placeholders with no API behind them.

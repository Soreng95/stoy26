# STØY / 26 content API

Read-only content API for the poster site in
[`rubber-duck-debugging-agency`](../rubber-duck-debugging-agency). One JSON
document, served as a typed and documented REST API, deployable to Vercel.

It exists to answer the question Hana asked in PR #30: *where does the content
JSON live?* It lives here, in one place, with a contract the compiler enforces.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3001
```

Port 3001, because the frontend pins 3000 in its `vite.config.js`.

| URL | What |
| --- | --- |
| `/content` | the whole document |
| `/content/{section}` | one of `meta`, `hero`, `lineup`, `tickets`, `sponsors`, `faq` |
| `/docs` | Swagger UI |
| `/docs/openapi.json` | the OpenAPI spec |

## Using it from the frontend

Fetch once, in `App.jsx`, and pass each section down as props — the same
pattern as the `ducks` array in the teaching repo, just with the data arriving
a moment later:

```jsx
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const [content, setContent] = useState(null);

useEffect(() => {
  fetch(`${API}/content`)
    .then((res) => res.json())
    .then(setContent);
}, []);

if (!content) return <p>Laster…</p>;

return (
  <>
    <Hero content={content.hero} />
    <Tickets content={content.tickets} />
  </>
);
```

Note the `if (!content) return` guard. Until it is there, every section
component receives `undefined` on the first render — which is exactly the
crash we found in `Tickets.jsx` (`price.label` on an object that is not there
yet). The guard is the fix at the App level; per-field defaults in each
component are the belt-and-braces version.

### Generating types for the frontend

```bash
pnpm openapi                                                  # writes openapi.json
pnpm dlx openapi-typescript openapi.json -o src/types/content.d.ts
```

Same source for the docs and the types, so they cannot disagree.

## How the types are kept honest

Three layers, none of which rely on anyone remembering anything:

1. **The DTOs are the contract.** `src/content/dto/*.ts` are plain classes with
   `@ApiProperty` on every field. They are simultaneously the TypeScript types,
   the OpenAPI schemas, and the documentation. There is no optional field and no
   `Partial` anywhere in them, deliberately.
2. **The content file is checked against them at build time.** `content.service.ts`
   ends with `satisfies SiteContentDto`. Delete `tickets.price.note` from the JSON
   and `pnpm typecheck` says so, naming the missing key:

   ```
   error TS1360: … Property 'note' is missing in type
   '{ label: string; amount: string; }' but required in type 'TicketPriceDto'.
   ```
3. **The one thing types cannot see is guarded at runtime.** TypeScript widens
   every string in a `.json` import to `string`, so the union
   `'headliner' | 'support'` cannot survive the import. `toArtistTier()` checks it
   on startup and refuses to boot on `tier: "headlinr"` rather than serving it.

## Deploying to Vercel

```bash
pnpm dlx vercel        # preview
pnpm dlx vercel --prod
```

`vercel.json` rewrites every path to `api/index.ts`, which hands Vercel the
Express instance Nest built. Two details worth knowing, both commented in the
source:

- **Swagger UI loads from a CDN.** Its assets are static files in
  `node_modules`, and a serverless bundle only contains traced JavaScript. See
  `SWAGGER_CDN` in `src/bootstrap.ts`.
- **The bootstrap promise is cached, not the app.** A cold start can take two
  requests at once; awaiting one promise starts Nest once. See `api/index.ts`.

Responses carry `Cache-Control: s-maxage=300`, so Vercel's CDN answers most
requests without waking the function.

Set `VITE_API_URL` in the frontend's Vercel project to this deployment's URL.

## Decisions made here that belong in issue #26

The content shape is a **superset** of the one proposed in #26. Paste this
version into the issue as the final one, or tell me to change it back:

| Change | Why |
| --- | --- |
| `tickets.price` is `{ label, amount, note }`, not a string | The ticket typesets the three parts separately — see `Tickets.jsx:47-49` |
| `tickets` gains `title`, `meta`, `name`, `edition` | #13 renders all four; they were missing from the proposal |
| `tickets.fields` / `.claimed` are filled in, not `{}` | So #14 and #16 do not each invent their own keys |
| `faq` is `{ title, items[] }`, not a bare array | The section needs a heading too |
| `faq.items[].id` and `artists[].imageAlt` added | The accordion needs a stable `aria-controls` target; #21 needs alt text |
| `stub.hint` added | #15 needs instructions for keyboard users |

**Bilingual strings** follow #26's proposal rather than being made consistent:
`{ no, en }` objects where the two languages are separate sentences (bios, FAQ),
flat strings where both languages are typeset as one line (`"Fyll inn - drag the
stub"`). `LocalizedTextDto` is the type to spread everywhere if the group decides
to make it uniform — the compiler will then list every call site that breaks.

## Not done yet

- No tests. `pnpm typecheck` and `/docs` are the current safety net; a single
  e2e spec hitting `/content` would be the first thing to add.
- Content is a file in the repo, so changing copy means a deploy. That is
  probably right for a poster site with a fixed date, and the wrong answer the
  moment a non-developer needs to edit it.
# stoy26

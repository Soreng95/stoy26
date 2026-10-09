# STØY / 26 content API

Read-only content API for the poster site in
[`rubber-duck-debugging-agency`](../rubber-duck-debugging-agency). One JSON
document, served as a typed and documented REST API, deployable to Vercel.

It exists to answer the question Hana asked in PR #30: *where does the content
JSON live?* It lives here, in one place, with a contract the compiler enforces.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:8080
```

Port 8080. The frontend pins 3000 in its `vite.config.js`, so the two never collide.

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
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

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

## Numbers are numbers

A string is only the right type for text a human wrote. Everything else is
modelled as what it is, so the frontend never has to parse its own API:

| Field | Was | Is | Why |
| --- | --- | --- | --- |
| `tickets.price` | `"690 NOK"` | `{ from: { amountMinor: 69000, currency: "NOK" } }` | Amount and currency are two facts. Minor units are integers, and integers do not drift |
| `tickets.price.earlyBirdUntil` | baked into `note` | `"2026-08-31"` | The offer can expire by itself instead of by someone editing copy |
| `lineup.artists[].time` | `"23:15"` | `startsAt: "2026-10-18T00:30:00+02:00"` | The night runs past midnight — see below |
| `meta.doorsAt` | inside an `info` string | `"2026-10-17T18:00:00+02:00"` | Comparable with the stage times |
| `meta.minimumAge` | `"16+"` inside a string | `16` | `"16+"` is typography |
| `sponsors[].font` | `string` | `'archivo' \| 'grotesk' \| 'mono'` | `"archvio"` used to type-check fine and silently fall back |

The stage times were an actual bug, not just a cosmetic type. Mimmi K plays at
00:30, which is the 18th. Sorted as `"00:30"` she came *first* on the bill;
sorted as a timestamp she is last, where she belongs:

```
18:30 Linnea Vik → 19:30 Jærv → … → 23:15 Aurora → 00:30 Mimmi K
```

Formatting is the view's job, and the platform already does it — no library,
and the reader's own locale decides:

```js
new Intl.NumberFormat("nb-NO", {
  style: "currency", currency: price.from.currency, maximumFractionDigits: 0,
}).format(price.from.amountMinor / 100);           // "690 kr"   (en-GB: "NOK 690")

new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit", minute: "2-digit",
}).format(new Date(artist.startsAt));              // "23:15"
```

### Breaking change for the tickets section

`price.amount` is gone. `Tickets.jsx:48` reads it today, so that line needs to
become the `Intl.NumberFormat` call above. One line, and `pnpm openapi` +
generated types will point at it.

`tickets.info` is left alone on purpose — it is still the typeset line the
merged #13 renders. It now duplicates `venue.name`, `doorsAt` and
`minimumAge`, so it is a candidate for being composed in the component later;
that is a change to make deliberately, not as a side effect of this one.

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
3. **What types cannot see is guarded at runtime.** A `.json` import widens
   every string to `string` and every number to `number`, so literal unions,
   integers and parseable timestamps need `src/content/content.guards.ts`.
   They run once at startup and refuse to boot, naming the key:

   ```
   stoy26.json: tickets.price.from.currency is "KR". Expected one of: NOK, SEK, DKK, EUR.
   stoy26.json: tickets.price.from.amountMinor is 690.5. Expected a whole number of 0 or more.
   stoy26.json: lineup.artists[aurora].startsAt is "2026-10-17T23:15:00". Expected an ISO
     timestamp with an offset, e.g. 2026-10-17T23:15:00+02:00.
   stoy26.json: sponsors[NORDLYS].font is "archvio". Expected one of: archivo, grotesk, mono.
   ```

   The offset is required rather than optional: a timestamp without one is read
   as local time by every browser, so the same stage time would render an hour
   apart in Oslo and London.

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
- **The OpenAPI `servers` list is relative, not hardcoded.** `'/'` resolves
  against whatever origin serves the docs. An absolute `localhost` URL here
  makes the deployed "Try it out" button fetch the *reader's* machine over
  http from an https page, which fails as a CORS error. See `apiServers()`
  in `src/bootstrap.ts`.

Responses carry `Cache-Control: s-maxage=300`, so Vercel's CDN answers most
requests without waking the function.

Set `VITE_API_URL` in the frontend's Vercel project to this deployment's URL.

## Decisions made here that belong in issue #26

The content shape is a **superset** of the one proposed in #26. Paste this
version into the issue as the final one, or tell me to change it back:

| Change | Why |
| --- | --- |
| `tickets.price` is `{ label, from: { amountMinor, currency }, note, earlyBirdUntil }` | An amount is a number and a currency, not a string — see "Numbers are numbers" above |
| `lineup.artists[].time` became `startsAt`, a full timestamp | `"00:30"` sorted the night's last act first |
| `meta` gained `doorsAt` and `minimumAge` | They were buried inside a display string |
| `sponsors[].font` is a union, not a string | Only three faces exist |
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

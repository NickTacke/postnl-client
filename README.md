# postnl-client

A well-typed TypeScript client for the PostNL eCommerce API: V4-first, with the legacy endpoints supported where no V4 equivalent exists.

> Unofficial. Not affiliated with or endorsed by PostNL. You need your own PostNL API key.

## Install

```bash
bun add postnl-client
```

```bash
npm install postnl-client
pnpm add postnl-client
yarn add postnl-client
```

Requires Node 18+ (or Bun / Deno / any runtime with global `fetch` and `atob`). Ships ESM + CJS + types.

## Quick start

```ts
import { writeFileSync } from "node:fs";
import { PostNLClient } from "postnl-client";

const client = new PostNLClient({
  apiKey: process.env.POSTNL_APIKEY!,
  environment: "sandbox", // omit for "production"
});

// create + confirm a shipment in one call, then decode the label
const result = await client.shipping.create({
  shipmentType: "parcel",
  sender: {
    customerNumber: "11223344",
    customerCode: "DEVC",
    address: { countryIso: "NL", city: "Hoofddorp", street: "Siriusdreef", houseNumber: "42", postalCode: "2132WT" },
  },
  receiver: {
    address: { countryIso: "NL", city: "Utrecht", street: "Stationsplein", houseNumber: "1", postalCode: "3511ED" },
    contact: { email: "buyer@example.com", firstName: "Jane", lastName: "Doe" },
  },
  labelSettings: { outputType: "pdf" },
});

const item = result.items[0];
console.log(item?.barcode);
const label = item?.labels?.[0];
// label.bytes() is a Uint8Array; works in node, bun, and deno
if (label) writeFileSync("label.pdf", label.bytes());
```

See [`examples/`](./examples) for runnable scripts (`create-shipment.ts`, `track.ts`, `nearest-locations.ts`).

## The V4-first surface

V4 is the default everywhere a V4 endpoint exists. Older operations that PostNL never migrated (tracking, delivery options, locations, checkout, address) are exposed directly under their namespace. Where both a V4 and a legacy variant exist, the legacy one lives under `.legacy`.

| Call | Method + endpoint | Notes |
| --- | --- | --- |
| `client.barcode.generate(input)` | `POST /shipment/delivery/v4/barcode` | V4 |
| `client.barcode.legacy.generate(input)` | `GET /shipment/v1_1/barcode` | legacy |
| `client.shipping.create(input)` | `POST /shipment/delivery/v4/labelconfirm` | V4 (label + confirm) |
| `client.shipping.label(input)` | `POST /shipment/delivery/v4/label` | V4 (label only) |
| `client.shipping.confirm(input)` | `POST /shipment/delivery/v4/confirm` | V4 |
| `client.shipping.legacy.label(input, { confirm? })` | `POST /shipment/v2_2/label` | legacy; `confirm` defaults `true` |
| `client.shipping.legacy.confirm(input)` | `POST /shipment/v2/confirm` | legacy |
| `client.return.generate(input)` | `POST /shipment/delivery/v4/return/generate` | V4 |
| `client.tracking.byBarcode(barcode, opts?)` | `GET /shipment/v2/status/barcode/{barcode}` | legacy-only |
| `client.tracking.byReference(referenceId, opts)` | `GET /shipment/v2/status/reference/{referenceId}` | legacy-only |
| `client.tracking.signature(barcode)` | `GET /shipment/v2/status/signature/{barcode}` | legacy-only |
| `client.tracking.updated(customerNumber, opts)` | `GET /shipment/v2/status/{customernumber}/updatedshipments` | legacy-only |
| `client.deliveryDate.calculate(input)` | `GET /shipment/v2_2/calculate/date/delivery` | legacy-only |
| `client.deliveryDate.sentDate(input)` | `GET /shipment/v2_2/calculate/date/shipping` | legacy-only |
| `client.timeframe.get(input)` | `GET /shipment/v2_1/calculate/timeframes` | legacy-only |
| `client.location.nearest(input)` | `GET /shipment/v2_1/locations/nearest` | legacy-only |
| `client.location.nearestByGeocode(input)` | `GET /shipment/v2_1/locations/nearest/geocode` | legacy-only |
| `client.location.area(input)` | `GET /shipment/v2_1/locations/area` | legacy-only |
| `client.location.lookup(input)` | `GET /shipment/v2_1/locations/lookup` | legacy-only |
| `client.checkout.get(input)` | `POST /shipment/v1/checkout` | legacy-only |
| `client.address.check(input)` | `GET /shipment/checkout/v1/postalcodecheck` | legacy-only, **production-only** |
| `client.request(args)` | any | raw escape hatch (see below) |

## Environments

```ts
new PostNLClient({ apiKey, environment: "sandbox" });    // https://api-sandbox.postnl.nl
new PostNLClient({ apiKey, environment: "production" });  // https://api.postnl.nl (default)
```

`address.check` is production-only: calling it on `sandbox` rejects with a `PostNLError` before any request is sent.

## Authentication

A single API key, sent as the `apikey` header on every request. Get one from the [PostNL developer portal](https://developer.postnl.nl/).

```ts
new PostNLClient({ apiKey: process.env.POSTNL_APIKEY! });
```

## Error handling

Failed requests reject with a typed error. `PostNLApiError` is the base for all HTTP error responses and carries `status`, `code`, `detail`, and `raw`. Subclasses let you branch on the failure kind:

| Class | When |
| --- | --- |
| `PostNLAuthError` | 401 (bad / missing API key) |
| `PostNLRateLimitError` | 429 (has `retryAfter` in seconds when sent) |
| `PostNLBadRequestError` | 400 (validation / business errors) |
| `PostNLMethodNotAllowedError` | 405 |
| `PostNLServerError` | 5xx |
| `PostNLApiError` | any other non-2xx |

Two non-HTTP errors extend `PostNLError` directly: `PostNLValidationError` (response failed schema validation) and `PostNLTimeoutError`.

```ts
import { PostNLClient, PostNLApiError, PostNLRateLimitError } from "postnl-client";

try {
  await client.barcode.generate(/* ... */);
} catch (err) {
  if (err instanceof PostNLRateLimitError) {
    console.warn(`rate limited, retry after ${err.retryAfter}s`);
  } else if (err instanceof PostNLApiError) {
    console.error(`postnl ${err.status} (${err.code ?? "?"}): ${err.message}`);
  } else {
    throw err;
  }
}
```

## Labels and signatures

Label and signature payloads come back base64-encoded. Each decodes to a small helper object:

```ts
const label = result.items[0]?.labels?.[0];
if (label) {
  label.base64;       // raw base64 string
  label.contentType;  // e.g. "application/pdf" (derived from the output type)
  label.bytes();      // Uint8Array, ready to write to disk or stream
}
```

`client.tracking.signature(barcode)` returns the signature image the same way (`signature.signatureImage.bytes()`).

## Configuration

```ts
new PostNLClient({
  apiKey,
  environment: "production",
  timeoutMs: 60_000,        // per-attempt timeout (default 60s) -> PostNLTimeoutError
  fetch: customFetch,       // inject your own fetch (default: global fetch)
  retry: {
    maxRetries: 3,          // default 3
    backoffFactor: 2,       // default 2 (exponential)
    retryMethods: ["GET", "PUT"],                       // only idempotent methods by default
    retryStatuses: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  },
  hooks: {
    onRequest: (req) => console.debug(req.method, req.url),
    onResponse: (res) => console.debug(res.status),
    onError: (err) => console.error(err),
  },
});
```

Retries apply only to the methods in `retryMethods` (idempotent by default, so POSTs are never silently retried) and only for the listed statuses and transient network/timeout failures.

## Wire quirks normalized for you

The PostNL API has an inconsistent wire format. This client absorbs that so you work with clean, typed, camelCase objects:

- numbers and booleans returned as strings (`"2"`, `"true"`) are coerced to real `number` / `boolean`
- single-value-or-array fields are always given to you as arrays
- `{ string: ... }` wrapper objects are unwrapped
- `dd-MM-yyyy[ HH:mm:ss]` dates are parsed to `Date`; `Date` inputs are formatted back to the wire format
- PascalCase wire keys become camelCase

## Raw request escape hatch

For anything not yet wrapped, call the transport directly. Auth, retry, timeout, and hooks still apply; pass an optional Zod `schema` to validate/parse the response.

```ts
const data = await client.request({
  family: "legacy",
  method: "GET",
  path: "/shipment/v2/status/barcode/{barcode}",
  pathParams: { barcode: "3SDEVC1234567" },
  query: { detail: "true" },
});
```

## Releasing (maintainers)

Releases are driven by [Changesets](https://github.com/changesets/changesets) and the `release` GitHub Actions workflow, which publishes via npm [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers) — no `NPM_TOKEN` secret required.

1. On npmjs.com, configure a trusted publisher for the package: org/user `NickTacke`, repository `postnl-client`, workflow `release.yml`, action `npm publish`.
2. Merging a PR with a changeset to `main` opens an auto-generated "Version Packages" PR.
3. Merging that "Version Packages" PR versions the package and publishes it to npm via short-lived OIDC credentials (with provenance).

## License

MIT

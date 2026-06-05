# postnl-client

## 0.3.0

### Minor Changes

- Live sandbox validation pass across all endpoints; fixes for real response shapes the schemas rejected.

  - `shipping.legacy.label`: `barcode` is now optional on a shipment. The legacy Labelling endpoint (`/shipment/v2_2/label`, the all-in-one Shipping API) generates a unique barcode when none is supplied; the schema previously required it. `shipping.legacy.confirm` still requires `barcode` to identify the shipment.
  - `tracking.byBarcode` / `tracking.byReference`: a not-yet-scanned barcode returns `{ CurrentStatus: {}, Warnings: [...] }`. `CurrentStatus.Shipment` (and `CompleteStatus.Shipment`) are now optional, so these no longer throw.
  - `tracking.signature`: a no-signature response returns `Warnings` as a bare array (`[{Message,Code}]`); previously only the `{ Warning: ... }` wrapper was accepted. Both shapes now parse.
  - `checkout.get`: `Timeframe[].ShippingDate` arrives as `null` from the live API. Date fields are now null-tolerant (every `pnlDateField` consumer).
  - New `ProductCode.mailboxParcel` (`2928`) constant.

  Output-shape changes (the reason for the minor bump):

  - `location.*` `openingHours.<day>` is now `string[]` (was `string`). PostNL returns split opening hours as an array (e.g. `["09:15-12:30", "13:00-18:00"]`); single ranges become a one-element array.
  - `checkout.get` `warnings[].options` is now `string[]` (was `string`); the live API returns an array.

### Patch Changes

- Fixes from the live V4 sandbox validation pass (barcode/create/label/confirm validated end-to-end, real label PDF decoded):

  - `shipping.*` responses now parse against the live V4 wire shape: `productService.services` and `productService.bundles` arrive as plain strings (e.g. `"Delivery at neighbours"`), not objects. The schema previously expected objects only, so every real `create`/`label`/`confirm` response threw a `PostNLValidationError`. Both string and object entries are now accepted.
  - error parser now recognizes V4 gateway validation faults delivered as a bare array of `{fault:{faultstring,detail:{errorcode}}}` envelopes, surfacing the first message (+count) and `errorcode` instead of a generic "request failed (object)".

## 0.2.0

### Minor Changes

- Polish from the live sandbox validation pass. Ships as a minor because it includes small breaking API-surface changes, so `^0.1.x` consumers won't auto-upgrade into them:
  - remove the hardcoded `version` export that didn't track `package.json` (read your installed version from the package manifest instead).
  - `location` address fields are now camelCase for consistency: `countryCode`, `houseNumber`, `houseNumberExtension`, `postalCode`.
  - error parser now surfaces the specific `Description` from labelling error envelopes (e.g. "Address type 01 and 02 is required") instead of the generic `Error` ("Validation failed for shipment").

## 0.1.1

### Patch Changes

- fa5bd23: fix(timeframe): use the correct `TimeframeTimeFrame` wire key (capital F) so delivery slots are no longer silently dropped. fix(core): surface HTTP-200 inline `{Error:{ErrorCode,ErrorMessage}}` envelopes (e.g. `location.lookup` "no results found") as a `PostNLApiError` instead of swallowing them, and read the live `ErrorMessage` field. Both confirmed against the PostNL sandbox.

## 0.1.0

### Minor Changes

- e43b747: initial release: v4-first postnl ecommerce client (shipping, barcode, returns, tracking, delivery options, locations, checkout, address) with typed errors and quirk-normalized responses.

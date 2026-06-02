# postnl-client

## 0.2.0

### Minor Changes

- 0cf02c3: Polish from the live sandbox validation pass. Ships as a minor (0.2.0) because it includes small breaking API-surface changes, so `^0.1.x` consumers won't auto-upgrade into them:

  - remove the hardcoded `version` export that didn't track `package.json` (read your installed version from the package manifest instead).
  - `location` address fields are now camelCase for consistency: `countryCode`, `houseNumber`, `houseNumberExtension`, `postalCode`.
  - error parser now surfaces the specific `Description` from labelling error envelopes (e.g. "Address type 01 and 02 is required") instead of the generic `Error` ("Validation failed for shipment").

## 0.1.1

### Patch Changes

- fa5bd23: fix(timeframe): use the correct `TimeframeTimeFrame` wire key (capital F) so delivery slots are no longer silently dropped. fix(core): surface HTTP-200 inline `{Error:{ErrorCode,ErrorMessage}}` envelopes (e.g. `location.lookup` "no results found") as a `PostNLApiError` instead of swallowing them, and read the live `ErrorMessage` field. Both confirmed against the PostNL sandbox.

## 0.1.0

### Minor Changes

- e43b747: initial release: v4-first postnl ecommerce client (shipping, barcode, returns, tracking, delivery options, locations, checkout, address) with typed errors and quirk-normalized responses.

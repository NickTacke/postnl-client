# postnl-client

## 0.1.1

### Patch Changes

- fa5bd23: fix(timeframe): use the correct `TimeframeTimeFrame` wire key (capital F) so delivery slots are no longer silently dropped. fix(core): surface HTTP-200 inline `{Error:{ErrorCode,ErrorMessage}}` envelopes (e.g. `location.lookup` "no results found") as a `PostNLApiError` instead of swallowing them, and read the live `ErrorMessage` field. Both confirmed against the PostNL sandbox.

## 0.1.0

### Minor Changes

- e43b747: initial release: v4-first postnl ecommerce client (shipping, barcode, returns, tracking, delivery options, locations, checkout, address) with typed errors and quirk-normalized responses.

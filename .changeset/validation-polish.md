---
"postnl-client": minor
---

Polish from the live sandbox validation pass. Ships as a minor (0.2.0) because it includes small breaking API-surface changes, so `^0.1.x` consumers won't auto-upgrade into them:

- remove the hardcoded `version` export that didn't track `package.json` (read your installed version from the package manifest instead).
- `location` address fields are now camelCase for consistency: `countryCode`, `houseNumber`, `houseNumberExtension`, `postalCode`.
- error parser now surfaces the specific `Description` from labelling error envelopes (e.g. "Address type 01 and 02 is required") instead of the generic `Error` ("Validation failed for shipment").

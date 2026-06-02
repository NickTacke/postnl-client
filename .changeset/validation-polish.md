---
"postnl-client": patch
---

Polish from the live sandbox validation pass (minor breaking, pre-1.0):

- remove the hardcoded `version` export that didn't track `package.json` (read your installed version from the package manifest instead).
- `location` address fields are now camelCase for consistency: `countryCode`, `houseNumber`, `houseNumberExtension`, `postalCode`.
- error parser now surfaces the specific `Description` from labelling error envelopes (e.g. "Address type 01 and 02 is required") instead of the generic `Error` ("Validation failed for shipment").

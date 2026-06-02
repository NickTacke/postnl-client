---
"postnl-client": patch
---

fix(timeframe): use the correct `TimeframeTimeFrame` wire key (capital F) so delivery slots are no longer silently dropped. fix(core): surface HTTP-200 inline `{Error:{ErrorCode,ErrorMessage}}` envelopes (e.g. `location.lookup` "no results found") as a `PostNLApiError` instead of swallowing them, and read the live `ErrorMessage` field. Both confirmed against the PostNL sandbox.

// find the nearest postnl pickup points for a dutch postal code.
// run with: POSTNL_APIKEY=... bun run examples/nearest-locations.ts
// in your own project, import from "postnl-client" instead of "../src/index".
import { PostNLApiError, PostNLClient } from "../src/index";

const apiKey = process.env.POSTNL_APIKEY;
if (!apiKey) throw new Error("set POSTNL_APIKEY");

const client = new PostNLClient({ apiKey, environment: "sandbox" });

try {
  const { locations } = await client.location.nearest({
    countryCode: "NL",
    postalCode: "2132WT",
    houseNumber: 42,
    deliveryOptions: ["PG"],
  });

  for (const loc of locations) {
    const a = loc.address;
    console.log(
      `${loc.locationCode} ${loc.name} - ${a?.street} ${a?.houseNumber}, ${a?.postalCode} ${a?.city} (${loc.distance}m)`,
    );
  }
} catch (err) {
  if (err instanceof PostNLApiError) {
    console.error(`postnl error ${err.status}: ${err.message}`);
  } else {
    throw err;
  }
}

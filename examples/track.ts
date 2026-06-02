// track a shipment by barcode and print its status history.
// run with: POSTNL_APIKEY=... bun run examples/track.ts 3SDEVC1234567
// in your own project, import from "postnl-client" instead of "../src/index".
import { PostNLApiError, PostNLClient } from "../src/index";

const apiKey = process.env.POSTNL_APIKEY;
if (!apiKey) throw new Error("set POSTNL_APIKEY");

const barcode = process.argv[2] ?? "3SDEVC1234567";

const client = new PostNLClient({ apiKey, environment: "sandbox" });

try {
  // detail:true returns completeStatus (full history incl. events + old statuses)
  const status = await client.tracking.byBarcode(barcode, { detail: true, language: "NL" });
  const shipment = status.completeStatus;
  if (!shipment) {
    console.log("no complete status found for", barcode);
  } else {
    console.log("barcode:", shipment.barcode);
    console.log("current status:", shipment.status?.statusDescription);
    for (const event of shipment.events ?? []) {
      console.log(`  ${event.timeStamp} ${event.code} ${event.description}`);
    }
  }
} catch (err) {
  if (err instanceof PostNLApiError) {
    console.error(`postnl error ${err.status}: ${err.message}`);
  } else {
    throw err;
  }
}

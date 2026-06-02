// create a v4 shipment (label + confirm in one call) and decode the label.
// run with: POSTNL_APIKEY=... bun run examples/create-shipment.ts
// in your own project, import from "postnl-client" instead of "../src/index".
import { PostNLApiError, PostNLClient } from "../src/index";

const apiKey = process.env.POSTNL_APIKEY;
if (!apiKey) throw new Error("set POSTNL_APIKEY");

const client = new PostNLClient({ apiKey, environment: "sandbox" });

try {
  const result = await client.shipping.create({
    shipmentType: "parcel",
    sender: {
      customerNumber: "11223344",
      customerCode: "DEVC",
      address: {
        countryIso: "NL",
        city: "Hoofddorp",
        street: "Siriusdreef",
        houseNumber: "42",
        postalCode: "2132WT",
        companyName: "PostNL",
      },
    },
    receiver: {
      address: {
        countryIso: "NL",
        city: "Utrecht",
        street: "Stationsplein",
        houseNumber: "1",
        postalCode: "3511ED",
      },
      contact: { email: "buyer@example.com", firstName: "Jane", lastName: "Doe" },
    },
    items: [{ customerReferences: { shipmentReference: "order-1234" } }],
    labelSettings: { outputType: "pdf" },
  });

  const item = result.items[0];
  console.log("barcode:", item?.barcode);

  const label = item?.labels?.[0];
  if (label) {
    console.log("label content type:", label.contentType);
    await Bun.write(`label-${item?.barcode}.pdf`, label.bytes());
  }
} catch (err) {
  if (err instanceof PostNLApiError) {
    console.error(`postnl error ${err.status} (${err.code ?? "?"}): ${err.message}`);
  } else {
    throw err;
  }
}

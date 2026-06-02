import { BaseResource } from "../../core/base-resource";
import { PostNLError } from "../../core/errors";
import type { Transport } from "../../core/http";
import type { Environment } from "../../core/types";
import { type PostalcodeCheckAddress, postalcodeCheckAddressSchema } from "./schema";

export interface AddressCheckInput {
  postalCode: string;
  houseNumber: string | number;
  houseNumberAddition?: string;
}

// production-only endpoint; sandbox guarded before any fetch
export class AddressResource extends BaseResource {
  constructor(
    transport: Transport,
    private readonly environment: Environment,
  ) {
    super(transport);
  }

  // GET /shipment/checkout/v1/postalcodecheck
  check(input: AddressCheckInput): Promise<PostalcodeCheckAddress> {
    if (this.environment === "sandbox") {
      return Promise.reject(
        new PostNLError("address.check is production-only and not available on sandbox"),
      );
    }
    return this.call({
      operation: "addressCheck",
      query: {
        postalcode: input.postalCode,
        housenumber: String(input.houseNumber),
        housenumberaddition: input.houseNumberAddition,
      },
      responseSchema: postalcodeCheckAddressSchema,
    });
  }
}

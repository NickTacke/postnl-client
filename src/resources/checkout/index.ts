import { BaseResource } from "../../core/base-resource";
import { formatDate } from "../../core/codec/dates";
import {
  type CheckoutRequestInput,
  type CheckoutResponse,
  checkoutResponseSchema,
  toCheckoutRequestBody,
} from "./schema";

const asDateTime = (v: Date | string) => (v instanceof Date ? formatDate(v, "datetime") : v);

export class CheckoutResource extends BaseResource {
  // POST /shipment/v1/checkout
  get(input: CheckoutRequestInput): Promise<CheckoutResponse> {
    return this.call({
      operation: "checkoutGet",
      input: toCheckoutRequestBody(input, asDateTime(input.orderDate)),
      responseSchema: checkoutResponseSchema,
    });
  }
}

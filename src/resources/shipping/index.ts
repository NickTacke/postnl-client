import { BaseResource } from "../../core/base-resource";
import {
  type ConfirmV4Request,
  type LabellingV4Request,
  type ShipmentPostResponse,
  type ShipmentV4Request,
  confirmV4RequestSchema,
  labellingV4RequestSchema,
  shipmentPostResponseSchema,
  shipmentV4RequestSchema,
} from "./schema";

export class ShippingResource extends BaseResource {
  // legacy added in slice 4

  // create + confirm in one call (labelconfirm)
  create(input: ShipmentV4Request): Promise<ShipmentPostResponse> {
    return this.call({
      operation: "shippingCreate",
      input,
      requestSchema: shipmentV4RequestSchema,
      responseSchema: shipmentPostResponseSchema,
    });
  }

  // generate label without confirming
  label(input: LabellingV4Request): Promise<ShipmentPostResponse> {
    return this.call({
      operation: "shippingLabelV4",
      input,
      requestSchema: labellingV4RequestSchema,
      responseSchema: shipmentPostResponseSchema,
    });
  }

  // confirm a previously created shipment
  confirm(input: ConfirmV4Request): Promise<ShipmentPostResponse> {
    return this.call({
      operation: "shippingConfirmV4",
      input,
      requestSchema: confirmV4RequestSchema,
      responseSchema: shipmentPostResponseSchema,
    });
  }
}

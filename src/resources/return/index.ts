import { BaseResource } from "../../core/base-resource";
import { type ShipmentPostResponse, shipmentPostResponseSchema } from "../shipping/schema";
import { type ReturnGenerateRequest, returnGenerateRequestSchema } from "./schema";

export class ReturnResource extends BaseResource {
  // generate a return label
  generate(input: ReturnGenerateRequest): Promise<ShipmentPostResponse> {
    return this.call({
      operation: "returnGenerate",
      input,
      requestSchema: returnGenerateRequestSchema,
      responseSchema: shipmentPostResponseSchema,
    });
  }
}

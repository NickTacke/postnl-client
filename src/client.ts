import { type PostNLClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import { BarcodeResource } from "./resources/barcode";
import { ReturnResource } from "./resources/return";
import { ShippingResource } from "./resources/shipping";

export class PostNLClient {
  private readonly transport: Transport;
  readonly barcode: BarcodeResource;
  readonly shipping: ShippingResource;
  readonly return: ReturnResource;

  constructor(options: PostNLClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.barcode = new BarcodeResource(this.transport);
    this.shipping = new ShippingResource(this.transport);
    this.return = new ReturnResource(this.transport);
  }
}

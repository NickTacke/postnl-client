import { type PostNLClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import { BarcodeResource } from "./resources/barcode";
import { DeliveryDateResource } from "./resources/delivery-date";
import { LocationResource } from "./resources/location";
import { ReturnResource } from "./resources/return";
import { ShippingResource } from "./resources/shipping";
import { TimeframeResource } from "./resources/timeframe";
import { TrackingResource } from "./resources/tracking";

export class PostNLClient {
  private readonly transport: Transport;
  readonly barcode: BarcodeResource;
  readonly shipping: ShippingResource;
  readonly return: ReturnResource;
  readonly tracking: TrackingResource;
  readonly deliveryDate: DeliveryDateResource;
  readonly timeframe: TimeframeResource;
  readonly location: LocationResource;

  constructor(options: PostNLClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.barcode = new BarcodeResource(this.transport);
    this.shipping = new ShippingResource(this.transport);
    this.return = new ReturnResource(this.transport);
    this.tracking = new TrackingResource(this.transport);
    this.deliveryDate = new DeliveryDateResource(this.transport);
    this.timeframe = new TimeframeResource(this.transport);
    this.location = new LocationResource(this.transport);
  }
}

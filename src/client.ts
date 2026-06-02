import type { z } from "zod";
import { type PostNLClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { Family, HttpMethod } from "./core/types";
import { AddressResource } from "./resources/address";
import { BarcodeResource } from "./resources/barcode";
import { CheckoutResource } from "./resources/checkout";
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
  readonly checkout: CheckoutResource;
  readonly address: AddressResource;

  constructor(options: PostNLClientOptions) {
    const config = resolveConfig(options);
    this.transport = new Transport(config);
    this.barcode = new BarcodeResource(this.transport);
    this.shipping = new ShippingResource(this.transport);
    this.return = new ReturnResource(this.transport);
    this.tracking = new TrackingResource(this.transport);
    this.deliveryDate = new DeliveryDateResource(this.transport);
    this.timeframe = new TimeframeResource(this.transport);
    this.location = new LocationResource(this.transport);
    this.checkout = new CheckoutResource(this.transport);
    this.address = new AddressResource(this.transport, config.environment);
  }

  // low-level escape hatch for endpoints/params not yet covered
  async request<T>(args: {
    family: Family;
    method: HttpMethod;
    path: string;
    pathParams?: Record<string, string>;
    query?: Record<string, string | string[] | number | boolean | undefined>;
    body?: unknown;
    schema?: z.ZodType<T>;
  }): Promise<T> {
    const raw = await this.transport.send<T>({
      family: args.family,
      method: args.method,
      path: args.path,
      pathParams: args.pathParams,
      query: args.query,
      body: args.body,
    });
    return args.schema ? args.schema.parse(raw) : (raw as T);
  }
}

import type { CountryCode, DeliverydateOption, OriginCountryCode } from "../../constants/enums";
import { BaseResource } from "../../core/base-resource";
import { formatDate } from "../../core/codec/dates";
import {
  type DeliveryDateResponse,
  type SentDateResponse,
  deliveryDateResponseSchema,
  sentDateResponseSchema,
} from "./schema";

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// per-weekday cutoff/availability overrides; keys lowercased weekday names
type WeekdayCutOff = Partial<Record<`cutOffTime${Weekday}`, string>>;
type WeekdayAvailable = Partial<Record<`available${Weekday}`, boolean>>;

export interface DeliveryDateCalculateInput extends WeekdayCutOff, WeekdayAvailable {
  shippingDate: Date | string;
  shippingDuration: number;
  cutOffTime: string;
  postalCode: string;
  countryCode: CountryCode;
  options: DeliverydateOption[];
  originCountryCode?: OriginCountryCode;
  city?: string;
  street?: string;
  houseNumber?: number;
  houseNrExt?: string;
}

export interface SentDateInput {
  deliveryDate: Date | string;
  shippingDuration: number;
  postalCode: string;
  countryCode: CountryCode;
  originCountryCode?: OriginCountryCode;
  city?: string;
  street?: string;
  houseNumber?: number;
  houseNrExt?: string;
}

const asDateTime = (v: Date | string) => (v instanceof Date ? formatDate(v, "datetime") : v);
const asDate = (v: Date | string) => (v instanceof Date ? formatDate(v, "date") : v);

export class DeliveryDateResource extends BaseResource {
  // GET /shipment/v2_2/calculate/date/delivery
  calculate(input: DeliveryDateCalculateInput): Promise<DeliveryDateResponse> {
    const query: Record<string, string | number | boolean | undefined> = {
      ShippingDate: asDateTime(input.shippingDate),
      ShippingDuration: input.shippingDuration,
      CutOffTime: input.cutOffTime,
      PostalCode: input.postalCode,
      CountryCode: input.countryCode,
      Options: input.options.join(","),
      OriginCountryCode: input.originCountryCode ?? "NL",
      City: input.city,
      Street: input.street,
      HouseNumber: input.houseNumber,
      HouseNrExt: input.houseNrExt,
    };
    for (const day of WEEKDAYS) {
      query[`CutOffTime${day}`] = input[`cutOffTime${day}`];
      query[`Available${day}`] = input[`available${day}`];
    }
    return this.call({
      operation: "deliveryDateCalculate",
      query,
      responseSchema: deliveryDateResponseSchema,
    });
  }

  // GET /shipment/v2_2/calculate/date/shipping
  sentDate(input: SentDateInput): Promise<SentDateResponse> {
    return this.call({
      operation: "deliveryDateSent",
      query: {
        DeliveryDate: asDate(input.deliveryDate),
        ShippingDuration: input.shippingDuration,
        PostalCode: input.postalCode,
        CountryCode: input.countryCode,
        OriginCountryCode: input.originCountryCode ?? "NL",
        City: input.city,
        Street: input.street,
        HouseNumber: input.houseNumber,
        HouseNrExt: input.houseNrExt,
      },
      responseSchema: sentDateResponseSchema,
    });
  }
}

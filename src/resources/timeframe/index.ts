import type { CountryCode, TimeframeOption } from "../../constants/enums";
import { BaseResource } from "../../core/base-resource";
import { formatDate } from "../../core/codec/dates";
import { type TimeframeResponse, timeframeResponseSchema } from "./schema";

export interface TimeframeGetInput {
  allowSundaySorting: boolean;
  startDate: Date | string;
  endDate: Date | string;
  countryCode: CountryCode;
  postalCode: string;
  houseNumber: number;
  options: TimeframeOption[];
  houseNrExt?: string;
  city?: string;
  street?: string;
}

const asDate = (v: Date | string) => (v instanceof Date ? formatDate(v, "date") : v);

export class TimeframeResource extends BaseResource {
  // GET /shipment/v2_1/calculate/timeframes
  get(input: TimeframeGetInput): Promise<TimeframeResponse> {
    return this.call({
      operation: "timeframeGet",
      query: {
        AllowSundaySorting: input.allowSundaySorting,
        StartDate: asDate(input.startDate),
        EndDate: asDate(input.endDate),
        CountryCode: input.countryCode,
        PostalCode: input.postalCode,
        HouseNumber: input.houseNumber,
        Options: input.options.join(","),
        HouseNrExt: input.houseNrExt,
        City: input.city,
        Street: input.street,
      },
      responseSchema: timeframeResponseSchema,
    });
  }
}

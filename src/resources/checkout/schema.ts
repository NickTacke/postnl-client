import { z } from "zod";
import type {
  AddressType,
  CheckoutCutOffDay,
  CheckoutCutOffType,
  CheckoutOption,
  CountryCode,
} from "../../constants/enums";
import { pnlDateField, sustainabilitySchema } from "../../core/codec/fields";
import { pnlArray, pnlNum } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

// ---------- request (camelCase -> PascalCase) ----------

export interface CheckoutCutOffTimeInput {
  day: CheckoutCutOffDay;
  available?: boolean;
  type?: CheckoutCutOffType;
  time?: string;
}

export interface CheckoutAddressInput {
  addressType: AddressType;
  houseNr: number;
  zipcode: string;
  countrycode: CountryCode;
  street?: string;
  houseNrExt?: string;
  city?: string;
}

export interface CheckoutRequestInput {
  orderDate: Date | string;
  cutOffTimes: CheckoutCutOffTimeInput[];
  options: readonly CheckoutOption[];
  locations: number;
  days: number;
  addresses: CheckoutAddressInput[];
  shippingDuration?: number;
  holidaySorting?: boolean;
}

export function toCheckoutRequestBody(input: CheckoutRequestInput, orderDate: string) {
  return stripUndefined({
    OrderDate: orderDate,
    CutOffTimes: input.cutOffTimes.map((c) =>
      stripUndefined({ Day: c.day, Available: c.available, Type: c.type, Time: c.time }),
    ),
    Options: [...input.options],
    Locations: input.locations,
    Days: input.days,
    Addresses: input.addresses.map((a) =>
      stripUndefined({
        AddressType: a.addressType,
        HouseNr: a.houseNr,
        Zipcode: a.zipcode,
        Countrycode: a.countrycode,
        Street: a.street,
        HouseNrExt: a.houseNrExt,
        City: a.city,
      }),
    ),
    ShippingDuration: input.shippingDuration,
    HolidaySorting: input.holidaySorting,
  });
}

// ---------- response ----------

// CheckoutTimeFrame { From, To, Options(plain array), ShippingDate, Sustainability? }
const timeframeSchema = z
  .object({
    From: z.string().optional(),
    To: z.string().optional(),
    Options: pnlArray(z.string()),
    ShippingDate: pnlDateField,
    Sustainability: sustainabilitySchema.optional(),
  })
  .transform((t) =>
    stripUndefined({
      from: t.From,
      to: t.To,
      options: t.Options.length ? t.Options : undefined,
      shippingDate: t.ShippingDate,
      sustainability: t.Sustainability,
    }),
  );

const deliveryOptionSchema = z
  .object({
    DeliveryDate: pnlDateField,
    Timeframe: pnlArray(timeframeSchema),
  })
  .transform((d) => ({
    ...stripUndefined({ deliveryDate: d.DeliveryDate }),
    timeframe: d.Timeframe,
  }));

const pickupAddressSchema = z
  .object({
    Street: z.string().optional(),
    Zipcode: z.string().optional(),
    HouseNr: pnlNum().optional(),
    HouseNrExt: z.string().optional(),
    Countrycode: z.string().optional(),
    CompanyName: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({
      street: a.Street,
      zipcode: a.Zipcode,
      houseNr: a.HouseNr,
      houseNrExt: a.HouseNrExt,
      countrycode: a.Countrycode,
      companyName: a.CompanyName,
    }),
  );

// OpeningHoursPerDay { From, To }
const openingHoursPerDaySchema = z
  .object({ From: z.string().optional(), To: z.string().optional() })
  .transform((d) => stripUndefined({ from: d.From, to: d.To }));

const day = openingHoursPerDaySchema.optional();

const pickupOpeningHoursSchema = z
  .object({
    Monday: day,
    Tuesday: day,
    Wednesday: day,
    Thursday: day,
    Friday: day,
    Saturday: day,
    Sunday: day,
  })
  .transform((o) =>
    stripUndefined({
      monday: o.Monday,
      tuesday: o.Tuesday,
      wednesday: o.Wednesday,
      thursday: o.Thursday,
      friday: o.Friday,
      saturday: o.Saturday,
      sunday: o.Sunday,
    }),
  );

// CheckoutLocation { Address, PickupTime, OpeningHours, Distance(int), LocationCode(str), PartnerID }
const checkoutLocationSchema = z
  .object({
    Address: pickupAddressSchema.optional(),
    PickupTime: z.string().optional(),
    OpeningHours: pickupOpeningHoursSchema.optional(),
    Distance: pnlNum().optional(),
    LocationCode: z.string().optional(),
    PartnerID: z.string().optional(),
    Sustainability: sustainabilitySchema.optional(),
  })
  .transform((l) =>
    stripUndefined({
      address: l.Address,
      pickupTime: l.PickupTime,
      openingHours: l.OpeningHours,
      distance: l.Distance,
      locationCode: l.LocationCode,
      partnerId: l.PartnerID,
      sustainability: l.Sustainability,
    }),
  );

const pickupOptionSchema = z
  .object({
    PickupDate: pnlDateField,
    ShippingDate: pnlDateField,
    Option: z.string().optional(),
    Locations: pnlArray(checkoutLocationSchema),
  })
  .transform((p) => ({
    ...stripUndefined({
      pickupDate: p.PickupDate,
      shippingDate: p.ShippingDate,
      option: p.Option,
    }),
    locations: p.Locations,
  }));

// CheckoutWarning { DeliveryDate, Code, Description, Options(plain string) }
const warningSchema = z
  .object({
    DeliveryDate: pnlDateField,
    Code: z.string().optional(),
    Description: z.string().optional(),
    Options: z.string().optional(),
  })
  .transform((w) =>
    stripUndefined({
      deliveryDate: w.DeliveryDate,
      code: w.Code,
      description: w.Description,
      options: w.Options,
    }),
  );

export const checkoutResponseSchema = z
  .object({
    DeliveryOptions: pnlArray(deliveryOptionSchema),
    PickupOptions: pnlArray(pickupOptionSchema),
    Warnings: pnlArray(warningSchema),
  })
  .transform((r) => ({
    deliveryOptions: r.DeliveryOptions,
    pickupOptions: r.PickupOptions,
    warnings: r.Warnings,
  }));
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

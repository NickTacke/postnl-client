import { z } from "zod";
import { IGNORED_LOCATION_OPTIONS } from "../../constants/enums";
import { sustainabilitySchema } from "../../core/codec/fields";
import { pnlArray, pnlNum, pnlStringWrapped } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

const IGNORED = new Set<string>(IGNORED_LOCATION_OPTIONS);

// LocationsAddress { City, Countrycode, HouseNr(int), HouseNrExt, Remark, Street, Zipcode }
const addressSchema = z
  .object({
    City: z.string().optional(),
    Countrycode: z.string().optional(),
    HouseNr: pnlNum().optional(),
    HouseNrExt: z.string().optional(),
    Remark: z.string().optional(),
    Street: z.string().optional(),
    Zipcode: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({
      city: a.City,
      countryCode: a.Countrycode,
      houseNumber: a.HouseNr,
      houseNumberExtension: a.HouseNrExt,
      remark: a.Remark,
      street: a.Street,
      postalCode: a.Zipcode,
    }),
  );

// each day is the {string:"08:00-18:00"} wrapper
const day = pnlStringWrapped(z.string()).optional();

const openingHoursSchema = z
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

// Location; numeric response fields coerced via pnlNum (wire may stringify them).
// DeliveryOptions is the {string:[...]} wrapper -> pnlArray; internal codes filtered out.
const locationSchema = z
  .object({
    Address: addressSchema.optional(),
    DeliveryOptions: pnlArray(z.string()),
    Distance: pnlNum().optional(),
    Latitude: pnlNum().optional(),
    LocationCode: pnlNum().optional(),
    Longitude: pnlNum().optional(),
    Name: z.string().optional(),
    OpeningHours: openingHoursSchema.optional(),
    Sustainability: sustainabilitySchema.optional(),
    PartnerName: z.string().optional(),
    RetailNetworkID: z.string().optional(),
  })
  .transform((l) => {
    const deliveryOptions = l.DeliveryOptions.filter((o) => !IGNORED.has(o));
    return stripUndefined({
      address: l.Address,
      deliveryOptions: deliveryOptions.length ? deliveryOptions : undefined,
      distance: l.Distance,
      latitude: l.Latitude,
      locationCode: l.LocationCode,
      longitude: l.Longitude,
      name: l.Name,
      openingHours: l.OpeningHours,
      sustainability: l.Sustainability,
      partnerName: l.PartnerName,
      retailNetworkId: l.RetailNetworkID,
    });
  });
export type Location = z.infer<typeof locationSchema>;

// LocationsResponseMultiple { GetLocationsResult.ResponseLocation: Location[] (single-or-array) }
export const locationsResponseSchema = z
  .object({
    GetLocationsResult: z
      .object({ ResponseLocation: pnlArray(locationSchema) })
      .optional()
      .transform((r) => r?.ResponseLocation ?? []),
  })
  .transform((r) => ({ locations: r.GetLocationsResult }));
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;

// LocationResponseSingle { GetLocationsResult.ResponseLocation: Location (single) }
export const locationLookupResponseSchema = z
  .object({
    GetLocationsResult: z
      .object({ ResponseLocation: locationSchema.optional() })
      .optional()
      .transform((r) => r?.ResponseLocation),
  })
  .transform((r) => stripUndefined({ location: r.GetLocationsResult }));
export type LocationLookupResponse = z.infer<typeof locationLookupResponseSchema>;

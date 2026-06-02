import type { CountryCode, LocationDeliveryOption } from "../../constants/enums";
import { BaseResource } from "../../core/base-resource";
import { formatDate } from "../../core/codec/dates";
import {
  type LocationLookupResponse,
  type LocationsResponse,
  locationLookupResponseSchema,
  locationsResponseSchema,
} from "./schema";

interface CommonLocationOptions {
  deliveryDate?: Date | string;
  openingTime?: string;
  deliveryOptions?: LocationDeliveryOption[];
}

export interface LocationNearestInput extends CommonLocationOptions {
  countryCode: CountryCode;
  postalCode: string;
  city?: string;
  street?: string;
  houseNumber?: number;
  houseNumberExtension?: string;
}

export interface LocationNearestByGeocodeInput extends CommonLocationOptions {
  latitude: number;
  longitude: number;
  countryCode: CountryCode;
}

export interface LocationAreaInput extends CommonLocationOptions {
  latitudeNorth: number;
  longitudeWest: number;
  latitudeSouth: number;
  longitudeEast: number;
  countryCode: CountryCode;
}

export interface LocationLookupInput {
  // accepts the numeric locationCode read from a Location response
  locationCode: string | number;
}

const asDate = (v: Date | string | undefined) => (v instanceof Date ? formatDate(v, "date") : v);

export class LocationResource extends BaseResource {
  // GET /shipment/v2_1/locations/nearest
  nearest(input: LocationNearestInput): Promise<LocationsResponse> {
    return this.call({
      operation: "locationNearest",
      query: {
        CountryCode: input.countryCode,
        PostalCode: input.postalCode,
        City: input.city,
        Street: input.street,
        HouseNumber: input.houseNumber,
        HouseNumberExtension: input.houseNumberExtension,
        DeliveryDate: asDate(input.deliveryDate),
        OpeningTime: input.openingTime,
        DeliveryOptions: input.deliveryOptions?.join(","),
      },
      responseSchema: locationsResponseSchema,
    });
  }

  // GET /shipment/v2_1/locations/nearest/geocode
  nearestByGeocode(input: LocationNearestByGeocodeInput): Promise<LocationsResponse> {
    return this.call({
      operation: "locationNearestByGeocode",
      query: {
        Latitude: input.latitude,
        Longitude: input.longitude,
        CountryCode: input.countryCode,
        DeliveryDate: asDate(input.deliveryDate),
        OpeningTime: input.openingTime,
        DeliveryOptions: input.deliveryOptions?.join(","),
      },
      responseSchema: locationsResponseSchema,
    });
  }

  // GET /shipment/v2_1/locations/area
  area(input: LocationAreaInput): Promise<LocationsResponse> {
    return this.call({
      operation: "locationArea",
      query: {
        LatitudeNorth: input.latitudeNorth,
        LongitudeWest: input.longitudeWest,
        LatitudeSouth: input.latitudeSouth,
        LongitudeEast: input.longitudeEast,
        CountryCode: input.countryCode,
        DeliveryDate: asDate(input.deliveryDate),
        OpeningTime: input.openingTime,
        DeliveryOptions: input.deliveryOptions?.join(","),
      },
      responseSchema: locationsResponseSchema,
    });
  }

  // GET /shipment/v2_1/locations/lookup
  lookup(input: LocationLookupInput): Promise<LocationLookupResponse> {
    return this.call({
      operation: "locationLookup",
      query: { LocationCode: String(input.locationCode) },
      responseSchema: locationLookupResponseSchema,
    });
  }
}

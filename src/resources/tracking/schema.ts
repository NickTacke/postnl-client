import { z } from "zod";
import { type DecodedLabel, toDecodedLabel } from "../../core/base64";
import { parsePnlDate } from "../../core/codec/dates";
import { pnlArray, pnlNum } from "../../core/codec/helpers";

// shipping-status responses are pascalcase, stringify numbers, and use
// single-object-or-array + single-object wrappers. each schema .transform()s
// to a clean camelCase output. drops undefined keys to satisfy
// exactOptionalPropertyTypes downstream.
const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as { [K in keyof T]?: Exclude<T[K], undefined> };
};

// lenient date parse: try parsePnlDate, keep raw string when format is unknown.
// dd-MM-yyyy[ HH:mm:ss] and iso yyyy-MM-dd are handled; anything else stays raw.
const pnlDate = z
  .string()
  .optional()
  .transform((v): Date | string | undefined => {
    if (v == null) return undefined;
    try {
      return parsePnlDate(v);
    } catch {
      return v;
    }
  });

// ---------- shared nested schemas ----------

const customerSchema = z
  .object({
    CustomerCode: z.string().optional(),
    CustomerNumber: z.string().optional(),
    Name: z.string().optional(),
  })
  .transform((c) =>
    stripUndefined({
      customerCode: c.CustomerCode,
      customerNumber: c.CustomerNumber,
      name: c.Name,
    }),
  );

const dimensionSchema = z
  .object({
    Weight: pnlNum().optional(),
    Height: pnlNum().optional(),
    Length: pnlNum().optional(),
    Width: pnlNum().optional(),
    Volume: pnlNum().optional(),
  })
  .transform((d) =>
    stripUndefined({
      weight: d.Weight,
      height: d.Height,
      length: d.Length,
      width: d.Width,
      volume: d.Volume,
    }),
  );

const amountSchema = z
  .object({
    RemboursBedrag: z.string().optional(),
    VerzekerdBedrag: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({ remboursBedrag: a.RemboursBedrag, verzekerdBedrag: a.VerzekerdBedrag }),
  );

const addressSchema = z
  .object({
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    CompanyName: z.string().optional(),
    DepartmentName: z.string().optional(),
    CountryCode: z.string().optional(),
    Zipcode: z.string().optional(),
    Region: z.string().optional(),
    District: z.string().optional(),
    City: z.string().optional(),
    Street: z.string().optional(),
    HouseNumber: z.string().optional(),
    HouseNumberSuffix: z.string().optional(),
    Building: z.string().optional(),
    Floor: z.string().optional(),
    Remark: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({
      firstName: a.FirstName,
      lastName: a.LastName,
      companyName: a.CompanyName,
      departmentName: a.DepartmentName,
      countryCode: a.CountryCode,
      zipcode: a.Zipcode,
      region: a.Region,
      district: a.District,
      city: a.City,
      street: a.Street,
      houseNumber: a.HouseNumber,
      houseNumberSuffix: a.HouseNumberSuffix,
      building: a.Building,
      floor: a.Floor,
      remark: a.Remark,
    }),
  );

// codes stay strings; only TimeStamp parses to a date
const statusSchema = z
  .object({
    TimeStamp: pnlDate,
    StatusCode: z.string().optional(),
    StatusDescription: z.string().optional(),
    PhaseCode: z.string().optional(),
    PhaseDescription: z.string().optional(),
  })
  .transform((s) =>
    stripUndefined({
      timeStamp: s.TimeStamp,
      statusCode: s.StatusCode,
      statusDescription: s.StatusDescription,
      phaseCode: s.PhaseCode,
      phaseDescription: s.PhaseDescription,
    }),
  );

// Code/LocationCode etc are codes -> keep as strings; only TimeStamp is a date
const eventSchema = z
  .object({
    Code: z.string().optional(),
    Description: z.string().optional(),
    DestinationLocationCode: z.string().optional(),
    LocationCode: z.string().optional(),
    RouteCode: z.string().optional(),
    RouteNumber: z.string().optional(),
    TimeStamp: pnlDate,
  })
  .transform((e) =>
    stripUndefined({
      code: e.Code,
      description: e.Description,
      destinationLocationCode: e.DestinationLocationCode,
      locationCode: e.LocationCode,
      routeCode: e.RouteCode,
      routeNumber: e.RouteNumber,
      timeStamp: e.TimeStamp,
    }),
  );

// eta formats unverified -> parse leniently
const expectationSchema = z
  .object({ ETAFrom: pnlDate, ETATo: pnlDate })
  .transform((e) => stripUndefined({ etaFrom: e.ETAFrom, etaTo: e.ETATo }));

// ProductOptions is a single-object wrapper { ProductOption: {...} }; unwrap it
const productOptionsSchema = z
  .object({
    ProductOption: z
      .object({
        OptionCode: z.string().optional(),
        CharacteristicCode: z.string().optional(),
      })
      .optional(),
  })
  .transform((p) =>
    stripUndefined({
      optionCode: p.ProductOption?.OptionCode,
      characteristicCode: p.ProductOption?.CharacteristicCode,
    }),
  );

// top-level warnings model { Message, Code } (single-object-or-array)
const warningSchema = z
  .object({ Message: z.string().optional(), Code: z.string().optional() })
  .transform((w) => stripUndefined({ message: w.Message, code: w.Code }));

// ---------- shipment (current = subset, complete = superset) ----------

const baseShipmentSchema = z.object({
  MainBarcode: z.string().optional(),
  Barcode: z.string().optional(),
  ShipmentAmount: pnlNum().optional(),
  ShipmentCounter: pnlNum().optional(),
  Customer: customerSchema.optional(),
  ProductCode: z.string().optional(),
  ProductDescription: z.string().optional(),
  Reference: z.string().optional(),
  DeliveryDate: pnlDate,
  Dimension: dimensionSchema.optional(),
  Address: pnlArray(addressSchema),
  ProductOptions: pnlArray(productOptionsSchema),
  Status: statusSchema.optional(),
});

const toBaseShipment = (s: z.infer<typeof baseShipmentSchema>) =>
  stripUndefined({
    mainBarcode: s.MainBarcode,
    barcode: s.Barcode,
    shipmentAmount: s.ShipmentAmount,
    shipmentCounter: s.ShipmentCounter,
    customer: s.Customer,
    productCode: s.ProductCode,
    productDescription: s.ProductDescription,
    reference: s.Reference,
    deliveryDate: s.DeliveryDate,
    dimension: s.Dimension,
    addresses: s.Address.length ? s.Address : undefined,
    productOptions: s.ProductOptions.length ? s.ProductOptions : undefined,
    status: s.Status,
  });

const currentStatusShipmentSchema = baseShipmentSchema.transform((s) => toBaseShipment(s));

const completeStatusShipmentSchema = baseShipmentSchema
  .extend({
    Amount: amountSchema.optional(),
    Event: pnlArray(eventSchema),
    Expectation: expectationSchema.optional(),
    OldStatus: pnlArray(statusSchema),
  })
  .transform((s) =>
    stripUndefined({
      ...toBaseShipment(s),
      amount: s.Amount,
      events: s.Event.length ? s.Event : undefined,
      expectation: s.Expectation,
      oldStatuses: s.OldStatus.length ? s.OldStatus : undefined,
    }),
  );

// ---------- ShippingstatusResponse (byBarcode / byReference) ----------

export const shippingStatusResponseSchema = z
  .object({
    CurrentStatus: z.object({ Shipment: currentStatusShipmentSchema }).optional(),
    CompleteStatus: z.object({ Shipment: completeStatusShipmentSchema }).optional(),
    Warnings: pnlArray(warningSchema),
  })
  .transform((r) => ({
    ...stripUndefined({
      currentStatus: r.CurrentStatus?.Shipment,
      completeStatus: r.CompleteStatus?.Shipment,
    }),
    warnings: r.Warnings,
  }));
export type ShippingStatusResponse = z.infer<typeof shippingStatusResponseSchema>;

// ---------- signature ----------

const signatureWarningSchema = z
  .object({ Code: z.string().optional(), Description: z.string().optional() })
  .transform((w) => stripUndefined({ code: w.Code, description: w.Description }));

const signatureSchema = z
  .object({
    Barcode: z.string().optional(),
    SignatureDate: pnlDate,
    SignatureImage: z.string().optional(),
  })
  .transform((s) =>
    stripUndefined({
      barcode: s.Barcode,
      signatureDate: s.SignatureDate,
      signatureImage: s.SignatureImage ? toDecodedLabel(s.SignatureImage, "gif") : undefined,
    }),
  );

export const signatureResponseSchema = z
  .object({
    Signature: signatureSchema.optional(),
    // signature Warnings is a single-object wrapper { Warning: {...} }; unwrap to a 1-element array
    Warnings: z
      .object({ Warning: pnlArray(signatureWarningSchema) })
      .optional()
      .transform((w) => w?.Warning ?? []),
  })
  .transform((r) => ({
    ...stripUndefined({ signature: r.Signature }),
    warnings: r.Warnings,
  }));
export type SignatureResponse = z.infer<typeof signatureResponseSchema>;

export interface SignatureImage extends DecodedLabel {}

// ---------- updated shipments ----------

// distinct wire key: lowercase Timestamp (vs TimeStamp elsewhere)
const updatedShipmentStatusSchema = z
  .object({
    Timestamp: pnlDate,
    StatusCode: z.string().optional(),
    StatusDescription: z.string().optional(),
    PhaseCode: z.string().optional(),
    PhaseDescription: z.string().optional(),
  })
  .transform((s) =>
    stripUndefined({
      timestamp: s.Timestamp,
      statusCode: s.StatusCode,
      statusDescription: s.StatusDescription,
      phaseCode: s.PhaseCode,
      phaseDescription: s.PhaseDescription,
    }),
  );

const updatedShipmentSchema = z
  .object({
    Barcode: z.string().optional(),
    CreationDate: pnlDate,
    CustomerNumber: z.string().optional(),
    CustomerCode: z.string().optional(),
    Status: updatedShipmentStatusSchema.optional(),
  })
  .transform((s) =>
    stripUndefined({
      barcode: s.Barcode,
      creationDate: s.CreationDate,
      customerNumber: s.CustomerNumber,
      customerCode: s.CustomerCode,
      status: s.Status,
    }),
  );

// response is a list of updated shipments
export const updatedShipmentsResponseSchema = pnlArray(updatedShipmentSchema);
export type UpdatedShipmentsResponse = z.infer<typeof updatedShipmentsResponseSchema>;
export type UpdatedShipment = UpdatedShipmentsResponse[number];

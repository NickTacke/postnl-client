import { z } from "zod";
import {
  AssociatedDocumentType,
  Bundle,
  DeliveryConfirmation,
  Duration,
  GuaranteedBefore,
  Language,
  MergeType,
  MinimalAgeCheck,
  OutputType,
  PageOrientation,
  Positioning,
  ReceiverType,
  Service,
  ShipmentTypeV4,
} from "../../constants/enums";
import { toDecodedLabel } from "../../core/base64";
import { formatIsoDate } from "../../core/codec/dates";

// v4 dates are iso yyyy-MM-dd. accept a js date (format it, but not an invalid one) or a bare
// string passthrough. invalid dates / malformed strings fail the shape check below.
export const isoDate = z.preprocess(
  (v) => (v instanceof Date ? (Number.isNaN(v.getTime()) ? v : formatIsoDate(v)) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

// nested address building blocks (AddressPNPShipmentConfirm + InternationalAddressData)
export const internationalAddressDataSchema = z.object({
  area: z.string().optional(),
  buildingName: z.string().optional(),
  doorCode: z.string().optional(),
  floor: z.string().optional(),
  region: z.string().optional(),
});

export const addressV4Schema = z.object({
  countryIso: z.string(),
  city: z.string().optional(),
  companyName: z.string().optional(),
  departmentName: z.string().optional(),
  houseNumber: z.string().optional(),
  houseNumberAddition: z.string().optional(),
  postalCode: z.string().optional(),
  street: z.string().optional(),
  addressLine: z.string().optional(),
  internationalAddressData: internationalAddressDataSchema.optional(),
});

export const contactV4Schema = z.object({
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  language: z.enum(Language).optional(),
  mobileNumber: z.string().optional(),
});

// ReceiverPNPShipment
export const receiverV4Schema = z.object({
  address: addressV4Schema,
  contact: contactV4Schema.optional(),
  type: z.enum(ReceiverType).optional(),
});

// CustomerPNPShipment (sender)
export const senderV4Schema = z.object({
  customerNumber: z.string(),
  customerCode: z.string(),
  address: addressV4Schema,
  contact: contactV4Schema.optional(),
  undeliverableReturnAddress: addressV4Schema.optional(),
});

export const dimensionsSchema = z.object({
  length: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  volume: z.number().int().optional(),
  weight: z.number().int().optional(),
});

export const customerReferencesSchema = z.object({
  shipmentReference: z.string().optional(),
  costCenter: z.string().optional(),
  returnReference: z.string().optional(),
});

// Item1 (request items)
export const itemV4Schema = z.object({
  barcode: z.string().optional(),
  dimensions: dimensionsSchema.optional(),
  customerReferences: customerReferencesSchema.optional(),
});

// Label (labelSettings)
export const labelSettingsSchema = z.object({
  outputType: z.enum(OutputType).optional(),
  pageOrientation: z.enum(PageOrientation).default("portrait"),
  resolution: z.union([z.literal(200), z.literal(300), z.literal(600)]).default(200),
  mergeType: z.enum(MergeType).optional(),
  positioning: z.enum(Positioning).optional(),
});

export const deliveryWindowSchema = z.object({
  service: z.enum(Service).optional(),
  guaranteedBefore: z.enum(GuaranteedBefore).optional(),
  duration: z.enum(Duration).optional(),
});

export const servicesSchema = z.object({
  insuredValue: z.number().optional(),
  deliveryWindow: deliveryWindowSchema.optional(),
  statedAddressOnly: z.boolean().optional(),
  returnWhenNotHome: z.boolean().optional(),
  minimalAgeCheck: z.enum(MinimalAgeCheck).optional(),
  deliveryConfirmation: z.enum(DeliveryConfirmation).optional(),
  adrLq: z.boolean().optional(),
  registered: z.boolean().optional(),
});

// Content (customs item declaration)
export const contentSchema = z.object({
  countryOfOrigin: z.string(),
  description: z.string(),
  quantity: z.number().int(),
  value: z.number(),
  weight: z.number().int(),
  hsTariffNumber: z.string().optional(),
});

export const associatedDocumentSchema = z.object({
  type: z.enum(AssociatedDocumentType),
  number: z.string(),
});

// Customs / CustomsPNPShipmentLabel (labelSignature only present on label variant)
export const customsV4Schema = z.object({
  content: z.array(contentSchema),
  transactionCode: z.string(),
  currency: z.string(),
  handleAsNonDeliverable: z.boolean().optional(),
  associatedDocument: associatedDocumentSchema.optional(),
  senderIdentification: z.string().optional(),
  receiverIdentification: z.string().optional(),
  labelSignature: z.boolean().optional(),
});

// InternationalShipmentDataPNPShipment / ...Label
export const internationalShipmentDataV4Schema = z.object({
  pudo: z.boolean().optional(),
  customs: customsV4Schema.optional(),
  bundle: z.enum(Bundle).optional(),
});

export const deliveryLocationV4Schema = z.object({
  pickUpLocationId: z.string().optional(),
  address: addressV4Schema.optional(),
});

// ReturnOptionsPNPShipment / ...Label
export const returnOptionsV4Schema = z.object({
  labelType: z.string().optional(),
  returnPeriod: z.union([z.literal(35), z.literal(100), z.literal(200), z.literal(365)]).optional(),
  returnAddress: addressV4Schema.optional(),
  returnBarcode: z.string().optional(),
});

// shared shipment fields for create/label/confirm; confirm omits labelSettings
const shipmentV4BaseShape = {
  receiver: receiverV4Schema,
  sender: senderV4Schema,
  shipmentType: z.enum(ShipmentTypeV4),
  handOverDate: isoDate.optional(),
  deliveryLocation: deliveryLocationV4Schema.optional(),
  returnOptions: returnOptionsV4Schema.optional(),
  // should match items.length for multi-collo shipments
  itemCount: z.number().int().default(1),
  items: z.array(itemV4Schema).optional(),
  internationalShipmentData: internationalShipmentDataV4Schema.optional(),
  services: servicesSchema.optional(),
} as const;

// ShipmentPNPShipment (create / labelconfirm)
export const shipmentV4RequestSchema = z.object({
  ...shipmentV4BaseShape,
  labelSettings: labelSettingsSchema.optional(),
});
export type ShipmentV4Request = z.input<typeof shipmentV4RequestSchema>;

// ShipmentPNPShipmentLabel (label) — identical wire shape to create
export const labellingV4RequestSchema = z.object({
  ...shipmentV4BaseShape,
  labelSettings: labelSettingsSchema.optional(),
});
export type LabellingV4Request = z.input<typeof labellingV4RequestSchema>;

// Shipment (confirm) — no labelSettings
export const confirmV4RequestSchema = z.object(shipmentV4BaseShape);
export type ConfirmV4Request = z.input<typeof confirmV4RequestSchema>;

// response: Label2 { label (base64), outputType, labelType }. accept legacy `content` key too.
const labelResponseSchema = z
  .object({
    label: z.string().optional(),
    content: z.string().optional(),
    outputType: z.string().optional(),
    labelType: z.string().optional(),
  })
  .transform((l) => {
    const base64 = l.label ?? l.content ?? "";
    return {
      ...toDecodedLabel(base64, l.outputType ?? ""),
      outputType: l.outputType,
      labelType: l.labelType,
    };
  });

// untyped in sdk (List[Any]); doc examples show objects, but live v4 returns plain
// strings (e.g. "Delivery at neighbours") — accept either shape.
const productServiceEntry = z.union([z.string(), z.record(z.unknown())]);
export const productServiceSchema = z.object({
  productData: z.string().optional(),
  services: z.array(productServiceEntry).optional(),
  bundles: z.array(productServiceEntry).optional(),
});

// Item / ItemPNPShipmentLabel / ItemPNPGenerateShipmentReturnV4 (superset; labels optional)
export const responseItemSchema = z.object({
  shipmentReference: z.string().optional(),
  returnReference: z.string().optional(),
  barcode: z.string().optional(),
  returnBarcode: z.string().optional(),
  preannouncedProduct: z.string().optional(),
  codingText: z.string().optional(),
  productService: productServiceSchema.optional(),
  partnerBarcode: z.string().optional(),
  partnerId: z.string().optional(),
  labels: z.array(labelResponseSchema).optional(),
});

// ShipmentPostResponse { items: Item[], traceId, warnings }
export const shipmentPostResponseSchema = z.object({
  items: z.array(responseItemSchema).default([]),
  traceId: z.string().optional(),
  warnings: z.array(z.string()).optional(),
});
export type ShipmentPostResponse = z.infer<typeof shipmentPostResponseSchema>;

import { z } from "zod";
import {
  ConsolidationMode,
  NetworkType,
  OutputType,
  PageOrientation,
  PrintMethod,
  ReturnShipmentTypeV4,
} from "../../constants/enums";
import {
  addressV4Schema,
  contactV4Schema,
  customerReferencesSchema,
  dimensionsSchema,
  isoDate,
} from "../shipping/schema";

// CustomerPNPGenerateShipmentReturnV4
export const returnCustomerSchema = z.object({
  customerNumber: z.string(),
  customerCode: z.string(),
  address: addressV4Schema,
});

// ReceiverPNPGenerateShipmentReturnV4
export const returnReceiverSchema = z.object({
  customer: returnCustomerSchema.optional(),
  contact: contactV4Schema.optional(),
});

// Sender
export const returnSenderSchema = z.object({
  address: addressV4Schema,
  contact: contactV4Schema.optional(),
});

// LabelPNPGenerateShipmentReturnV4
export const returnLabelSchema = z.object({
  outputType: z.enum(OutputType),
  printMethod: z.enum(PrintMethod),
  pageOrientation: z.enum(PageOrientation).optional(),
  resolution: z.union([z.literal(200), z.literal(300), z.literal(600)]).optional(),
});

// Domestic
export const returnDomesticSchema = z.object({
  returnPeriod: z.union([z.literal(20), z.literal(35)]).optional(),
  valuableReturn: z.boolean().optional(),
});

// International
export const returnInternationalSchema = z.object({
  consolidationMode: z.enum(ConsolidationMode).optional(),
  networkType: z.enum(NetworkType).optional(),
});

// CollectionService
export const returnCollectionServiceSchema = z.object({
  timeWindow: isoDate.optional(),
  // should match items.length for multi-collo shipments
  itemCount: z.number().int().default(1),
});

// ReturnOptionsPNPGenerateShipmentReturnV4
export const returnOptionsSchema = z.object({
  domestic: returnDomesticSchema.optional(),
  international: returnInternationalSchema.optional(),
  collectionService: returnCollectionServiceSchema.optional(),
});

// Items
export const returnItemSchema = z.object({
  barcode: z.string().optional(),
  dimensions: dimensionsSchema.optional(),
  customerReferences: customerReferencesSchema.optional(),
});

// ReturnShipment
export const returnGenerateRequestSchema = z.object({
  receiver: returnReceiverSchema,
  sender: returnSenderSchema,
  labelSettings: returnLabelSchema,
  shipmentType: z.enum(ReturnShipmentTypeV4),
  returnOptions: returnOptionsSchema.optional(),
  items: z.array(returnItemSchema).optional(),
});
export type ReturnGenerateRequest = z.input<typeof returnGenerateRequestSchema>;

import { z } from "zod";
import type { AddressType, LabellingCurrency, ShipmentTypeLegacy } from "../../constants/enums";
import { toDecodedLabel } from "../../core/base64";
import { formatDate } from "../../core/codec/dates";
import { pnlArray } from "../../core/codec/helpers";

// legacy send requests use native types + PascalCase wire keys.
// public api is camelCase in; each schema .transform()s to the wire shape.
// undefined wire keys are stripped so exactOptionalPropertyTypes stays happy downstream.
// drops undefined keys so output types model them as optional (matches stripped runtime shape)
const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as { [K in keyof T]?: Exclude<T[K], undefined> };
};

// MessageTimeStamp is dd-MM-yyyy HH:mm:ss; accept a Date or pre-formatted string, default now
const messageTimeStamp = z.preprocess(
  (v) => (v instanceof Date ? formatDate(v, "datetime") : v),
  z.string(),
);

// Address
export const legacyAddressSchema = z
  .object({
    addressType: z.custom<AddressType>(),
    countrycode: z.string(),
    area: z.string().optional(),
    buildingname: z.string().optional(),
    city: z.string().optional(),
    companyName: z.string().optional(),
    department: z.string().optional(),
    doorcode: z.string().optional(),
    firstName: z.string().optional(),
    floor: z.string().optional(),
    houseNr: z.string().optional(),
    houseNrExt: z.string().optional(),
    name: z.string().optional(),
    region: z.string().optional(),
    street: z.string().optional(),
    streetHouseNrExt: z.string().optional(),
    zipcode: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({
      AddressType: a.addressType,
      Countrycode: a.countrycode,
      Area: a.area,
      Buildingname: a.buildingname,
      City: a.city,
      CompanyName: a.companyName,
      Department: a.department,
      Doorcode: a.doorcode,
      FirstName: a.firstName,
      Floor: a.floor,
      HouseNr: a.houseNr,
      HouseNrExt: a.houseNrExt,
      Name: a.name,
      Region: a.region,
      Street: a.street,
      StreetHouseNrExt: a.streetHouseNrExt,
      Zipcode: a.zipcode,
    }),
  );

// Contact
export const legacyContactSchema = z
  .object({
    contactType: z.string(),
    email: z.string().optional(),
    smsNr: z.string().optional(),
    telNr: z.string().optional(),
  })
  .transform((c) =>
    stripUndefined({
      ContactType: c.contactType,
      Email: c.email,
      SMSNr: c.smsNr,
      TelNr: c.telNr,
    }),
  );

// Dimension (Weight in grams, native int)
export const legacyDimensionSchema = z
  .object({
    weight: z.number().int(),
    height: z.number().int().optional(),
    length: z.number().int().optional(),
    volume: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .transform((d) =>
    stripUndefined({
      Weight: d.weight,
      Height: d.height,
      Length: d.length,
      Volume: d.volume,
      Width: d.width,
    }),
  );

// Amount (Value is native float)
export const legacyAmountSchema = z
  .object({
    amountType: z.string(),
    value: z.number(),
    accountName: z.string().optional(),
    bic: z.string().optional(),
    currency: z.custom<LabellingCurrency>().optional(),
    iban: z.string().optional(),
    reference: z.string().optional(),
    transactionNumber: z.string().optional(),
  })
  .transform((a) =>
    stripUndefined({
      AmountType: a.amountType,
      Value: a.value,
      AccountName: a.accountName,
      BIC: a.bic,
      Currency: a.currency,
      IBAN: a.iban,
      Reference: a.reference,
      TransactionNumber: a.transactionNumber,
    }),
  );

// Group
export const legacyGroupSchema = z
  .object({
    groupType: z.string(),
    mainBarcode: z.string(),
    groupSequence: z.number().int().optional(),
    groupCount: z.number().int().optional(),
  })
  .transform((g) =>
    stripUndefined({
      GroupType: g.groupType,
      MainBarcode: g.mainBarcode,
      GroupSequence: g.groupSequence,
      GroupCount: g.groupCount,
    }),
  );

// ProductOption
export const legacyProductOptionSchema = z
  .object({ characteristic: z.string(), option: z.string() })
  .transform((p) => ({ Characteristic: p.characteristic, Option: p.option }));

// LabellingCustomsContent
export const legacyCustomsContentSchema = z
  .object({
    description: z.string(),
    quantity: z.number().int(),
    weight: z.number().int(),
    value: z.number(),
    hsTariffNr: z.string().optional(),
    countryOfOrigin: z.string().optional(),
  })
  .transform((c) =>
    stripUndefined({
      Description: c.description,
      Quantity: c.quantity,
      Weight: c.weight,
      Value: c.value,
      HSTariffNr: c.hsTariffNr,
      CountryOfOrigin: c.countryOfOrigin,
    }),
  );

// CustomsLabellingAPI (booleans are native)
export const legacyCustomsSchema = z
  .object({
    currency: z.custom<LabellingCurrency>(),
    shipmentType: z.custom<ShipmentTypeLegacy>(),
    content: z.array(legacyCustomsContentSchema),
    certificate: z.boolean().optional(),
    certificateNr: z.string().optional(),
    license: z.boolean().optional(),
    licenseNr: z.string().optional(),
    invoice: z.boolean().optional(),
    invoiceNr: z.string().optional(),
    handleAsNonDeliverable: z.boolean().optional(),
    trustedShipperId: z.string().optional(),
    importerReferenceCode: z.string().optional(),
    transactionCode: z.string().optional(),
    transactionDescription: z.string().optional(),
  })
  .transform((c) =>
    stripUndefined({
      Currency: c.currency,
      ShipmentType: c.shipmentType,
      Content: c.content,
      Certificate: c.certificate,
      CertificateNr: c.certificateNr,
      License: c.license,
      LicenseNr: c.licenseNr,
      Invoice: c.invoice,
      InvoiceNr: c.invoiceNr,
      HandleAsNonDeliverable: c.handleAsNonDeliverable,
      TrustedShipperID: c.trustedShipperId,
      ImporterReferenceCode: c.importerReferenceCode,
      TransactionCode: c.transactionCode,
      TransactionDescription: c.transactionDescription,
    }),
  );

// ExtraField
export const legacyExtraFieldSchema = z
  .object({ key: z.string().optional(), value: z.string().optional() })
  .transform((e) => stripUndefined({ Key: e.key, Value: e.value }));

// shared shipment shape for labelling + confirming (confirming ignores extraFields)
const legacyShipmentShape = {
  addresses: z.array(legacyAddressSchema),
  barcode: z.string(),
  dimension: legacyDimensionSchema,
  productCodeDelivery: z.string(),
  amounts: z.array(legacyAmountSchema).optional(),
  codingText: z.string().optional(),
  collectionTimeStampStart: z.string().optional(),
  collectionTimeStampEnd: z.string().optional(),
  contacts: z.array(legacyContactSchema).optional(),
  content: z.string().optional(),
  costCenter: z.string().optional(),
  customerOrderNumber: z.string().optional(),
  customs: legacyCustomsSchema.optional(),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().optional(),
  downPartnerBarcode: z.string().optional(),
  downPartnerId: z.string().optional(),
  downPartnerLocation: z.string().optional(),
  groups: z.array(legacyGroupSchema).optional(),
  hazardousMaterial: z.string().optional(),
  productCodeCollect: z.string().optional(),
  productOptions: z.array(legacyProductOptionSchema).optional(),
  receiverDateOfBirth: z.string().optional(),
  reference: z.string().optional(),
  referenceCollect: z.string().optional(),
  remark: z.string().optional(),
  returnBarcode: z.string().optional(),
  returnReference: z.string().optional(),
  timeslotId: z.string().optional(),
} as const;

type LegacyShipmentParsed = z.infer<z.ZodObject<typeof legacyShipmentShape>>;

const toWireShipment = (s: LegacyShipmentParsed) =>
  stripUndefined({
    Addresses: s.addresses,
    Barcode: s.barcode,
    Dimension: s.dimension,
    ProductCodeDelivery: s.productCodeDelivery,
    Amounts: s.amounts,
    CodingText: s.codingText,
    CollectionTimeStampStart: s.collectionTimeStampStart,
    CollectionTimeStampEnd: s.collectionTimeStampEnd,
    Contacts: s.contacts,
    Content: s.content,
    CostCenter: s.costCenter,
    CustomerOrderNumber: s.customerOrderNumber,
    Customs: s.customs,
    DeliveryAddress: s.deliveryAddress,
    DeliveryDate: s.deliveryDate,
    DownPartnerBarcode: s.downPartnerBarcode,
    DownPartnerID: s.downPartnerId,
    DownPartnerLocation: s.downPartnerLocation,
    Groups: s.groups,
    HazardousMaterial: s.hazardousMaterial,
    ProductCodeCollect: s.productCodeCollect,
    ProductOptions: s.productOptions,
    ReceiverDateOfBirth: s.receiverDateOfBirth,
    Reference: s.reference,
    ReferenceCollect: s.referenceCollect,
    Remark: s.remark,
    ReturnBarcode: s.returnBarcode,
    ReturnReference: s.returnReference,
    TimeslotID: s.timeslotId,
  });

// LabellingCustomerShipment
export const legacyLabellingShipmentSchema = z
  .object({ ...legacyShipmentShape, extraFields: z.array(legacyExtraFieldSchema).optional() })
  .transform((s) => stripUndefined({ ...toWireShipment(s), ExtraFields: s.extraFields }));

// LabellingCustomer
export const legacyCustomerSchema = z
  .object({
    customerCode: z.string(),
    customerNumber: z.string(),
    address: legacyAddressSchema.optional(),
    collectionLocation: z.string().optional(),
    contactPerson: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
  })
  .transform((c) =>
    stripUndefined({
      CustomerCode: c.customerCode,
      CustomerNumber: c.customerNumber,
      Address: c.address,
      CollectionLocation: c.collectionLocation,
      ContactPerson: c.contactPerson,
      Email: c.email,
      Name: c.name,
    }),
  );

// LabellingCustomerMessage
export const legacyLabellingMessageSchema = z
  .object({
    messageId: z.string(),
    messageTimeStamp: messageTimeStamp.optional(),
    printertype: z.string(),
  })
  .transform((m) =>
    stripUndefined({
      MessageID: m.messageId,
      MessageTimeStamp: m.messageTimeStamp ?? formatDate(new Date(), "datetime"),
      Printertype: m.printertype,
    }),
  );

// LabellingRequest
export const labellingRequestSchema = z
  .object({
    customer: legacyCustomerSchema,
    message: legacyLabellingMessageSchema,
    shipments: z.array(legacyLabellingShipmentSchema),
    labelSignature: z.boolean().optional(),
  })
  .transform((r) =>
    stripUndefined({
      Customer: r.customer,
      Message: r.message,
      Shipments: r.shipments,
      LabelSignature: r.labelSignature,
    }),
  );
export type LabellingRequest = z.input<typeof labellingRequestSchema>;

// ConfirmingMessage
export const legacyConfirmingMessageSchema = z
  .object({ messageId: z.string(), messageTimeStamp: messageTimeStamp.optional() })
  .transform((m) => ({
    MessageID: m.messageId,
    MessageTimeStamp: m.messageTimeStamp ?? formatDate(new Date(), "datetime"),
  }));

// ConfirmingShipment (no ExtraFields vs labelling)
export const legacyConfirmingShipmentSchema = z
  .object(legacyShipmentShape)
  .transform((s) => toWireShipment(s));

// ConfirmingRequest
export const confirmingRequestSchema = z
  .object({
    customer: legacyCustomerSchema,
    message: legacyConfirmingMessageSchema,
    shipments: z.array(legacyConfirmingShipmentSchema),
  })
  .transform((r) => ({ Customer: r.customer, Message: r.message, Shipments: r.shipments }));
export type ConfirmingRequest = z.input<typeof confirmingRequestSchema>;

// ---------- responses ----------

// LabellingLabel: decode via OutputType, fall back to inferring from Labeltype
const legacyLabelSchema = z
  .object({
    Content: z.string().optional(),
    Labeltype: z.string().optional(),
    OutputType: z.string().optional(),
  })
  .transform((l) => {
    const format = l.OutputType ?? l.Labeltype ?? "";
    return {
      ...toDecodedLabel(l.Content ?? "", format),
      labeltype: l.Labeltype,
      outputType: l.OutputType,
    };
  });

const warningSchema = z
  .object({ Code: z.string().optional(), Description: z.string().optional() })
  .transform((w) => stripUndefined({ code: w.Code, description: w.Description }));

// Errors is List[Any] in the sdk; entries may be non-objects, pass through untouched
const errorSchema = z.unknown();

// LabellingResponseShipment
const labellingResponseShipmentSchema = z
  .object({
    ProductCodeDelivery: z.string().optional(),
    Labels: pnlArray(legacyLabelSchema),
    Barcode: z.string().optional(),
    Errors: pnlArray(errorSchema),
    Warnings: pnlArray(warningSchema),
  })
  .transform((s) => ({
    labels: s.Labels,
    ...stripUndefined({
      productCodeDelivery: s.ProductCodeDelivery,
      barcode: s.Barcode,
      errors: s.Errors.length ? s.Errors : undefined,
      warnings: s.Warnings.length ? s.Warnings : undefined,
    }),
  }));

const legacyMergedLabelSchema = z
  .object({ Barcodes: pnlArray(z.string()), Labels: pnlArray(legacyLabelSchema) })
  .transform((m) => ({ barcodes: m.Barcodes, labels: m.Labels }));

// LabellingResponse
export const labellingResponseSchema = z
  .object({
    MergedLabels: pnlArray(legacyMergedLabelSchema),
    ResponseShipments: pnlArray(labellingResponseShipmentSchema),
  })
  .transform((r) => ({
    responseShipments: r.ResponseShipments,
    ...(r.MergedLabels.length ? { mergedLabels: r.MergedLabels } : {}),
  }));
export type LabellingResponse = z.infer<typeof labellingResponseSchema>;

// ConfirmingResponseShipment
const confirmingResponseShipmentSchema = z
  .object({
    Barcode: z.string().optional(),
    Errors: pnlArray(errorSchema),
    Warnings: pnlArray(warningSchema),
  })
  .transform((s) =>
    stripUndefined({
      barcode: s.Barcode,
      errors: s.Errors.length ? s.Errors : undefined,
      warnings: s.Warnings.length ? s.Warnings : undefined,
    }),
  );

// ConfirmingResponse
export const confirmingResponseSchema = z
  .object({ ResponseShipments: pnlArray(confirmingResponseShipmentSchema) })
  .transform((r) => ({ responseShipments: r.ResponseShipments }));
export type ConfirmingResponse = z.infer<typeof confirmingResponseSchema>;

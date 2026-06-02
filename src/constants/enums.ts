// wire enum values mirrored 1:1 from the official sdk *_enum.py files
export const BarcodeType = ["2S", "3S", "CC", "CP", "CD", "CF", "LA", "RI", "UE"] as const;
export type BarcodeType = (typeof BarcodeType)[number];

export const ShipmentTypeV4 = [
  "parcel",
  "letterbox",
  "packet",
  "parcelnonstandard",
  "letter",
] as const;
export type ShipmentTypeV4 = (typeof ShipmentTypeV4)[number];

export const ReturnShipmentTypeV4 = ["parcel", "letterbox", "packet", "parcelnonstandard"] as const;
export type ReturnShipmentTypeV4 = (typeof ReturnShipmentTypeV4)[number];

export const ReceiverType = ["business", "consumer"] as const;
export type ReceiverType = (typeof ReceiverType)[number];

export const OutputType = ["zpl", "pdf", "gif", "jpg", "png"] as const;
export type OutputType = (typeof OutputType)[number];

export const ReturnOutputType = ["pdf", "gif", "jpg", "png"] as const;
export type ReturnOutputType = (typeof ReturnOutputType)[number];

export const PageOrientation = ["portrait", "landscape"] as const;
export type PageOrientation = (typeof PageOrientation)[number];

export const Resolution = [200, 300, 600] as const;
export type Resolution = (typeof Resolution)[number];

export const MergeType = ["singlepdf", "pdfa6toa4"] as const;
export type MergeType = (typeof MergeType)[number];

export const Positioning = ["topleft", "topright", "bottomleft", "bottomright"] as const;
export type Positioning = (typeof Positioning)[number];

export const PrintMethod = ["consumerPrint", "retailPrint"] as const;
export type PrintMethod = (typeof PrintMethod)[number];

export const ReturnPeriod = [35, 100, 200, 365] as const;
export type ReturnPeriod = (typeof ReturnPeriod)[number];

export const ReturnPeriodV4 = [20, 35] as const;
export type ReturnPeriodV4 = (typeof ReturnPeriodV4)[number];

export const Bundle = ["track_trace", "insured", "insured_plus"] as const;
export type Bundle = (typeof Bundle)[number];

export const Language = ["NL", "FR", "EN"] as const;
export type Language = (typeof Language)[number];

export const StatusLanguage = ["NL", "EN", "CN", "DE", "FR"] as const;
export type StatusLanguage = (typeof StatusLanguage)[number];

export const MinimalAgeCheck = ["16+", "18+"] as const;
export type MinimalAgeCheck = (typeof MinimalAgeCheck)[number];

export const DeliveryConfirmation = ["signature", "deliverycode"] as const;
export type DeliveryConfirmation = (typeof DeliveryConfirmation)[number];

export const GuaranteedBefore = ["10:00", "12:00", "17:00"] as const;
export type GuaranteedBefore = (typeof GuaranteedBefore)[number];

export const Duration = ["24hours", "non24hours"] as const;
export type Duration = (typeof Duration)[number];

export const ConsolidationMode = ["none", "bulk"] as const;
export type ConsolidationMode = (typeof ConsolidationMode)[number];

export const NetworkType = ["commercial", "postal"] as const;
export type NetworkType = (typeof NetworkType)[number];

export const AssociatedDocumentType = ["certificate", "invoice", "license"] as const;
export type AssociatedDocumentType = (typeof AssociatedDocumentType)[number];

export const CountryCode = ["NL", "BE"] as const;
export type CountryCode = (typeof CountryCode)[number];

export const OriginCountryCode = ["NL", "BE"] as const;
export type OriginCountryCode = (typeof OriginCountryCode)[number];

export const Currency = ["EUR", "GBP", "USD", "CNY"] as const;
export type Currency = (typeof Currency)[number];

// note: labelling legacy currency keeps the upstream "USS" typo from the sdk
export const LabellingCurrency = ["EUR", "USS"] as const;
export type LabellingCurrency = (typeof LabellingCurrency)[number];

export const AddressType = ["01", "02"] as const;
export type AddressType = (typeof AddressType)[number];

export const ShipmentTypeLegacy = [
  "Gift",
  "Documents",
  "Commercial Goods",
  "Commercial Sample",
  "Returned Goods",
] as const;
export type ShipmentTypeLegacy = (typeof ShipmentTypeLegacy)[number];

export const DeliverydateOption = [
  "Daytime",
  "Evening",
  "Morning",
  "Noon",
  "Sunday",
  "Today",
  "Afternoon",
] as const;
export type DeliverydateOption = (typeof DeliverydateOption)[number];

export const TimeframeOption = [
  "Daytime",
  "Today",
  "Sameday",
  "Evening",
  "Morning",
  "Noon",
  "Sunday",
  "Afternoon",
] as const;
export type TimeframeOption = (typeof TimeframeOption)[number];

export const CheckoutOption = [
  "Daytime",
  "Evening",
  "Sunday",
  "Sameday",
  "Today",
  "08:00-10:00",
  "08:00-12:00",
  "08:00-17:00",
  "Pickup",
] as const;
export type CheckoutOption = (typeof CheckoutOption)[number];

export const CheckoutWarningOption = [
  "Daytime",
  "Evening",
  "Sameday",
  "Sunday",
  "Today",
  "08:00-10:00",
  "08:00-12:00",
  "08:00-17:00",
  "08:00-09:00",
  "Pickup",
] as const;
export type CheckoutWarningOption = (typeof CheckoutWarningOption)[number];

export const CheckoutCutOffDay = ["00", "01", "02", "03", "04", "05", "06", "07"] as const;
export type CheckoutCutOffDay = (typeof CheckoutCutOffDay)[number];

export const CheckoutCutOffType = ["Regular", "Sameday", "Today"] as const;
export type CheckoutCutOffType = (typeof CheckoutCutOffType)[number];

export const LocationDeliveryOption = ["PG", "PA", "PG_EX"] as const;
export type LocationDeliveryOption = (typeof LocationDeliveryOption)[number];

// internal location codes to ignore when present in responses
export const IGNORED_LOCATION_OPTIONS = ["RETA", "UL", "PU", "DO", "BW", "RT", "BWUL"] as const;

export const SustainabilityCode = ["00", "01", "02", "03"] as const;
export type SustainabilityCode = (typeof SustainabilityCode)[number];

export const Service = ["evening"] as const;
export type Service = (typeof Service)[number];

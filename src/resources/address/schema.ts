import { z } from "zod";
import { pnlArray, pnlNum } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

// PostalcodeCheckAddress: already camelCase wire; houseNumber int (pnlNum defensive), formattedAddress string[]
export const postalcodeCheckAddressSchema = z
  .object({
    city: z.string().optional(),
    postalCode: z.string().optional(),
    streetName: z.string().optional(),
    houseNumber: pnlNum().optional(),
    houseNumberAddition: z.string().optional(),
    formattedAddress: pnlArray(z.string()).optional(),
  })
  .transform((a) =>
    stripUndefined({
      city: a.city,
      postalCode: a.postalCode,
      streetName: a.streetName,
      houseNumber: a.houseNumber,
      houseNumberAddition: a.houseNumberAddition,
      formattedAddress: a.formattedAddress?.length ? a.formattedAddress : undefined,
    }),
  );

export type PostalcodeCheckAddress = z.infer<typeof postalcodeCheckAddressSchema>;

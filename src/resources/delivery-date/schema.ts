import { z } from "zod";
import { parsePnlDate } from "../../core/codec/dates";
import { pnlArray } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

// response dates are dd-MM-yyyy
const pnlDateField = z
  .string()
  .optional()
  .transform((v) => (v == null ? undefined : parsePnlDate(v)));

// sustainability { Code, Description }
const sustainabilitySchema = z
  .object({ Code: z.string().optional(), Description: z.string().optional() })
  .transform((s) => stripUndefined({ code: s.Code, description: s.Description }));

// Options is the {string: value} | {string: [...]} wrapper; pnlArray handles both -> string[]
export const deliveryDateResponseSchema = z
  .object({
    DeliveryDate: pnlDateField,
    Options: pnlArray(z.string()),
    Sustainability: sustainabilitySchema.optional(),
  })
  .transform((r) =>
    stripUndefined({
      deliveryDate: r.DeliveryDate,
      options: r.Options.length ? r.Options : undefined,
      sustainability: r.Sustainability,
    }),
  );
export type DeliveryDateResponse = z.infer<typeof deliveryDateResponseSchema>;

export const sentDateResponseSchema = z
  .object({
    SentDate: pnlDateField,
    Options: pnlArray(z.string()),
  })
  .transform((r) =>
    stripUndefined({
      sentDate: r.SentDate,
      options: r.Options.length ? r.Options : undefined,
    }),
  );
export type SentDateResponse = z.infer<typeof sentDateResponseSchema>;

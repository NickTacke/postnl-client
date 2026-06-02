import { z } from "zod";
import { parsePnlDate } from "../../core/codec/dates";
import { pnlArray } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

// response dates are dd-MM-yyyy
const pnlDateField = z
  .string()
  .optional()
  .transform((v) => (v == null ? undefined : parsePnlDate(v)));

const sustainabilitySchema = z
  .object({ Code: z.string().optional(), Description: z.string().optional() })
  .transform((s) => stripUndefined({ code: s.Code, description: s.Description }));

// TimeframeTimeframe { From, To, Options({string:...}), Sustainability? }; times stay strings
const timeframeTimeframeSchema = z
  .object({
    From: z.string().optional(),
    To: z.string().optional(),
    Options: pnlArray(z.string()),
    Sustainability: sustainabilitySchema.optional(),
  })
  .transform((t) =>
    stripUndefined({
      from: t.From,
      to: t.To,
      options: t.Options.length ? t.Options : undefined,
      sustainability: t.Sustainability,
    }),
  );

// Timeframe { Date, Timeframes.TimeframeTimeframe[] (single-or-array) }
const timeframeSchema = z
  .object({
    Date: pnlDateField,
    Timeframes: z
      .object({ TimeframeTimeframe: pnlArray(timeframeTimeframeSchema) })
      .optional()
      .transform((t) => t?.TimeframeTimeframe ?? []),
  })
  .transform((t) => ({
    ...stripUndefined({ date: t.Date }),
    timeframes: t.Timeframes,
  }));

// ReasonNoTimeframe { Code, Date, Description, Options({string:...}), Sustainability? }
const reasonNoTimeframeSchema = z
  .object({
    Code: z.string().optional(),
    Date: pnlDateField,
    Description: z.string().optional(),
    Options: pnlArray(z.string()),
    Sustainability: sustainabilitySchema.optional(),
  })
  .transform((r) =>
    stripUndefined({
      code: r.Code,
      date: r.Date,
      description: r.Description,
      options: r.Options.length ? r.Options : undefined,
      sustainability: r.Sustainability,
    }),
  );

export const timeframeResponseSchema = z
  .object({
    Timeframes: z
      .object({ Timeframe: pnlArray(timeframeSchema) })
      .optional()
      .transform((t) => t?.Timeframe ?? []),
    ReasonNoTimeframes: z
      .object({ ReasonNoTimeframe: pnlArray(reasonNoTimeframeSchema) })
      .optional()
      .transform((r) => r?.ReasonNoTimeframe ?? []),
  })
  .transform((r) => ({
    timeframes: r.Timeframes,
    reasonNoTimeframes: r.ReasonNoTimeframes,
  }));
export type TimeframeResponse = z.infer<typeof timeframeResponseSchema>;

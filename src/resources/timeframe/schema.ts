import { z } from "zod";
import { pnlDateField, sustainabilitySchema } from "../../core/codec/fields";
import { pnlArray } from "../../core/codec/helpers";
import { stripUndefined } from "../../core/codec/object";

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

// Timeframe { Date, Timeframes.TimeframeTimeFrame[] (single-or-array) }
// note: live wire key is TimeframeTimeFrame (capital F), not TimeframeTimeframe
const timeframeSchema = z
  .object({
    Date: pnlDateField,
    Timeframes: z
      .object({ TimeframeTimeFrame: pnlArray(timeframeTimeframeSchema) })
      .optional()
      .transform((t) => t?.TimeframeTimeFrame ?? []),
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

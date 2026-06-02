import { z } from "zod";
import { parsePnlDate } from "./dates";
import { stripUndefined } from "./object";

// optional dd-MM-yyyy response date -> Date (null-tolerant)
export const pnlDateField = z
  .string()
  .optional()
  .transform((v) => (v == null ? undefined : parsePnlDate(v)));

// sustainability { Code, Description } -> { code, description }
export const sustainabilitySchema = z
  .object({ Code: z.string().optional(), Description: z.string().optional() })
  .transform((s) => stripUndefined({ code: s.Code, description: s.Description }));

import { z } from "zod";

// ============================================================
// CALCULATOR SUB-SCHEMAS
// ============================================================

export const MaterialPricesSchema = z.object({
  standard: z.number().min(0, "Harga standard harus positif"),
  premium: z.number().min(0, "Harga premium harus positif"),
  luxury: z.number().min(0, "Harga luxury harus positif"),
});

export type MaterialPrices = z.infer<typeof MaterialPricesSchema>;

// ============================================================
// CALCULATOR SETTINGS SCHEMA
// ============================================================

export const CalculatorSettingsSchema = z.object({
  _id: z.string(),
  id: z.literal("CALC-SETTINGS"),
  areaMultiplier: z.number().min(0, "Multiplier area harus positif"),
  pricePerRoom: z.number().min(0, "Harga per ruangan harus positif"),
  materials: MaterialPricesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CalculatorSettings = z.infer<typeof CalculatorSettingsSchema>;

// ============================================================
// REQUEST PAYLOAD SCHEMAS
// ============================================================

export const UpdateCalculatorPayloadSchema = z.object({
  areaMultiplier: z.number().min(0, "Multiplier area harus positif").optional(),
  pricePerRoom: z.number().min(0, "Harga per ruangan harus positif").optional(),
  materials: MaterialPricesSchema.partial().optional(),
});

export type UpdateCalculatorPayload = z.infer<
  typeof UpdateCalculatorPayloadSchema
>;

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const CalculatorResponseSchema = z.object({
  status: z.literal("success"),
  data: CalculatorSettingsSchema,
});

export type CalculatorResponse = z.infer<typeof CalculatorResponseSchema>;

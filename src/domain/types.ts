import z from "zod";

export type CarStateMessage = {
  carId: string;
  batteryIndex?: string;
  topic: string;
  value: unknown;
};

export const CarStateSchema = z.object({
  id: z.number().optional(),
  car_id: z.number().int().positive(),
  time: z.date(),
  state_of_charge: z.number().int().gte(0).lte(100),
  latitude: z.number(),
  longitude: z.number(),
  gear: z.number().gte(0).lte(6).int(),
  speed: z.number().nonnegative(),
});

export type CarState = z.infer<typeof CarStateSchema>;

export type CarStateDraft = Omit<
  Partial<CarState>,
  "state_of_charge" | "gear"
> & {
  soc?: Record<string, number>;
  gear?: string | number;
  [key: string]: unknown;
};

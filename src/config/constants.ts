import "dotenv/config";
import z from "zod/v4";

const envSchema = z.object({
  MQTT_URL: z.string(),
  MQTT_USERNAME: z.string(),
  MQTT_PASSWORD: z.string(),
  RABBITMQ_URL: z.string(),
  POSTGRES_URL: z.string(),
  RABBITMQ_QUEUE_NAME: z.string().default("car_info"),
  BATTERY_CAPACITY_1: z.coerce.number().default(15000),
  BATTERY_CAPACITY_2: z.coerce.number().default(20000),
});

export const env = envSchema.parse(process.env);

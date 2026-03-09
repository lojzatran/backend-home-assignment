import amqplib from "amqplib";
import { env } from "../config/constants";
import {
  CarStateSchema,
  type CarStateDraft,
  type CarStateMessage,
} from "../domain/types";
import z from "zod";
import rabbitMq from "../infrastructure/rabbitMq";
import postgres from "../infrastructure/postgres";
import CarStateCache from "../domain/CarStateCache";

let carStateCache = new CarStateCache();

const consumeRabbitMQMessages = async () => {
  const channel = await rabbitMq.connect();
  channel.consume(
    env.RABBITMQ_QUEUE_NAME,
    async (msg: amqplib.ConsumeMessage | null) => {
      if (msg) {
        let content: CarStateMessage;
        try {
          content = JSON.parse(msg.content.toString());
          carStateCache.updateFromMessage(content);
          console.log("Received RabbitMQ message:", content);
        } catch (error) {
          console.error(error);
          channel.nack(msg, false, false);
          return;
        }
        channel.ack(msg);
      }
    },
  );
};

const saveCarStateToDatabase = async () => {
  const carStateDraftSnapshot: CarStateDraft = carStateCache.snapshot();

  const result = CarStateSchema.safeParse(carStateDraftSnapshot);
  if (result.success) {
    console.log("Saving car state to database:", carStateDraftSnapshot);
    await postgres.executeQuery(
      `INSERT INTO vehicle_state (car_id, time, state_of_charge, latitude, longitude, gear, speed)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        carStateDraftSnapshot.car_id,
        carStateDraftSnapshot.time,
        carStateDraftSnapshot.state_of_charge,
        carStateDraftSnapshot.latitude,
        carStateDraftSnapshot.longitude,
        carStateDraftSnapshot.gear,
        carStateDraftSnapshot.speed,
      ],
    );
  } else {
    console.error("Invalid car state:", z.prettifyError(result.error));
  }
};

const startWriterLoop = async () => {
  while (true) {
    try {
      await saveCarStateToDatabase();
    } catch (error) {
      console.error("Failed to save car state:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
  }
};

const main = async () => {
  await postgres.connect();
  await consumeRabbitMQMessages();
  await startWriterLoop();
};

main();

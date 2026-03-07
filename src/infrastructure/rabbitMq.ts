import { env } from "../config/constants";
import amqplib from "amqplib";

const connect = async () => {
  const connection = await amqplib.connect(env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(env.RABBITMQ_QUEUE_NAME, { durable: false });
  return channel;
};

const sendToQueue = async (
  channel: amqplib.Channel,
  payload: unknown,
) => {
  channel.sendToQueue(
    env.RABBITMQ_QUEUE_NAME,
    Buffer.from(JSON.stringify(payload)),
    { persistent: false },
  );
};

export default { connect, sendToQueue };

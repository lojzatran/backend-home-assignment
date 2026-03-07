import type { CarStateMessage } from "../domain/types";
import rabbitMq from "../infrastructure/rabbitMq";
import mqtt from "../infrastructure/mqtt";

const createRabbitMqMessage = (
  topic: string,
  message: string,
): CarStateMessage | null => {
  const regex = /car\/(\d+)\/(?:battery\/(\d+)\/)?(?:.*\/)?([^\/]+)$/;
  const match = topic.match(regex);
  if (match) {
    const carId = match[1];
    const batteryIndex = match[2] || undefined;
    const topicSegment = match[3];
    try {
      const parsed = JSON.parse(message);
      return {
        carId,
        batteryIndex,
        topic: topicSegment,
        value: parsed.value !== undefined ? parsed.value : message,
      };
    } catch (e) {
      return {
        carId,
        batteryIndex,
        topic: topicSegment,
        value: message,
      };
    }
  }
  return null;
};

const dispatchMqttMessagesToRabbitChannel = async () => {
  const channel = await rabbitMq.connect();
  const mqttClient = await mqtt.connectAndSubscribe();

  mqttClient.on("message", async (topic, message) => {
    console.log("Received MQTT message:", topic, message.toString());
    const rabbitMqMessage = createRabbitMqMessage(topic, message.toString());
    if (rabbitMqMessage) {
      await rabbitMq.sendToQueue(channel, rabbitMqMessage);
      console.log("Message sent to RabbitMQ");
    }
  });
};

dispatchMqttMessagesToRabbitChannel();

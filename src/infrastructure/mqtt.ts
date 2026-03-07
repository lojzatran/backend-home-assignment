import mqtt from "mqtt";
import { env } from "../config/constants";

const connectAndSubscribe = async () => {
  const mqttClient = mqtt.connect(env.MQTT_URL, {
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT");
    mqttClient.subscribe("car/#", (err) => {
      if (!err) {
        console.log("Subscribed to car/#");
      }
    });
  });

  return mqttClient;
};

export default { connectAndSubscribe };

import { CarStateDraft, CarStateMessage } from "./types";
import { env } from "../config/constants";

export default class CarStateCache {
  private carStateDraft: CarStateDraft = {
    car_id: 1,
  };

  updateFromMessage(message: CarStateMessage) {
    if (message.topic === "soc" && message.batteryIndex) {
      if (!this.carStateDraft.soc) {
        this.carStateDraft.soc = {};
      }
      const soc = this.carStateDraft.soc;
      soc[message.batteryIndex] = message.value as number;
      return;
    }

    this.carStateDraft[message.topic] = message.value;
  }

  snapshot(): CarStateDraft {
    return {
      ...this.carStateDraft,
      time: new Date(),
      state_of_charge:
        this.carStateDraft.soc &&
        this.mapSoC(this.carStateDraft.soc["0"], this.carStateDraft.soc["1"]),
      gear: this.carStateDraft.gear && this.mapGear(this.carStateDraft.gear),
      speed:
        this.carStateDraft.speed && this.mapSpeed(this.carStateDraft.speed),
    };
  }

  mapGear(gear: string | number): number | undefined {
    if (gear === "N" || gear === "n") return 0;
    const gearNum = Number(gear);
    return isNaN(gearNum) ? undefined : gearNum;
  }

  mapSpeed(speedMs: number): number {
    return speedMs * 3.6;
  }

  mapSoC(soc1: number | undefined, soc2: number | undefined): number {
    const s1 = soc1 || 0;
    const s2 = soc2 || 0;
    const totalCapacity = env.BATTERY_CAPACITY_1 + env.BATTERY_CAPACITY_2;
    return Math.round(
      (s1 * env.BATTERY_CAPACITY_1 + s2 * env.BATTERY_CAPACITY_2) /
        totalCapacity,
    );
  }
}

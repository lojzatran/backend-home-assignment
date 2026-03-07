import pg from "pg";
import { env } from "../config/constants";

export const pgClient = new pg.Client(env.POSTGRES_URL);

export const connect = async () => {
  await pgClient.connect();
};

const executeQuery = async (query: string, params: any[]) => {
  try {
    await pgClient.query(query, params);
    console.log("Saved car state to database");
  } catch (error) {
    console.error("Failed to save car state:", error);
  }
};

export default { connect, executeQuery };

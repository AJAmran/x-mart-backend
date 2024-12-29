import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";
import { config } from "./config";

dotenv.config();
const a = 30;

async function main() {
  try {
    await mongoose.connect(config.mongoUri);

    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (error) {}
}

main();

import { eq } from "drizzle-orm";

import { db } from "../client.js";
import { households } from "../schema.js";

async function checkDefaultHousehold() {
  try {
    const result = await db
      .select()
      .from(households)
      .where(eq(households.id, "default"));

    if (result.length > 0) {
      console.log("✅ Дефолтный household найден:");
      console.log(JSON.stringify(result[0], null, 2));
    } else {
      console.log("❌ Дефолтный household не найден");
    }
  } catch (error) {
    console.error("Ошибка при проверке:", error);
  }
  process.exit(0);
}

checkDefaultHousehold();

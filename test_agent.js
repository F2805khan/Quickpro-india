import "./backend/config/env.js";
import Agent from "./backend/models/Agent.js";

async function test() {
  try {
    const agent = await Agent.create({
      name: "hari test 3",
      phone: "1234567890",
      status: "online"
    });
    console.log("Success:", agent);
  } catch (error) {
    console.error("Agent creation failed:", JSON.stringify(error, null, 2));
    if (error.message) console.error(error.message);
  }
}

test();

import { Agent } from "./models/index.js";

async function testUpdate() {
  try {
    const agent = await Agent.findOne();
    if (!agent) {
      console.log("No agent found");
      process.exit(0);
    }
    console.log("Updating agent ID:", agent.id);
    
    await agent.update({
      verificationStatus: 'verified'
    });
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err.message, err);
  }
  process.exit(0);
}

testUpdate();

import { Agent } from "../models/index.js";

// GET /api/admin/agents
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/agents
export const createAgent = async (req, res) => {
  try {
    const { name, phone, photo, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const agent = await Agent.create({
      name,
      phone: phone || "",
      photo: photo || "",
      status: status || "offline",
    });

    res.status(201).json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/agents/:id
export const updateAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const updates = req.body;
    
    // Prevent overriding the ID
    delete updates._id;
    delete updates.id;

    const agent = await Agent.update(agentId, updates);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    res.json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/agents/:id
export const deleteAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const success = await Agent.delete(agentId);
    
    if (!success) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

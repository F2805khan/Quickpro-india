import { Agent, AdminAlert } from "../models/index.js";
import { logAuditAction } from "../utils/auditLogger.js";

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
    const { name, phone, photo, status, verification_status, skills, rating, completed_jobs_count, earnings, latitude, longitude } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newAgentData = {
      name,
      ...(phone !== undefined && { phone }),
      ...(photo !== undefined && { photo }),
      ...(status !== undefined && { status }),
      ...(verification_status !== undefined && { verification_status }),
      ...(skills !== undefined && { skills }),
      ...(rating !== undefined && { rating }),
      ...(completed_jobs_count !== undefined && { completed_jobs_count }),
      ...(earnings !== undefined && { earnings }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude })
    };

    const agent = await Agent.create(newAgentData);

    if (agent) {
      await logAuditAction("CREATE", "Agent", agent.id || agent._id, req.user || { email: "admin@system.local" }, { name: agent.name });
      
      if (agent.verification_status === "Pending Verification") {
        try {
          await AdminAlert.create({
            type: "AGENT_SIGNUP",
            title: "New Agent Signed Up",
            message: `Agent ${agent.name} is waiting for verification.`,
            is_read: false
          });
        } catch (alertError) {
          console.error("Failed to create admin alert:", alertError);
        }
      }
    }

    res.status(201).json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ 
      message: error.message || "Server error",
      details: error.details || error
    });
  }
};

// PUT /api/admin/agents/bulk
export const bulkUpdateAgents = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No agent IDs provided" });
    }

    const promises = ids.map(id => Agent.update(id, updates));
    await Promise.all(promises);

    await logAuditAction("BULK_UPDATE", "Agent", "multiple", req.user || { email: "admin@system.local" }, { ids, updates });

    res.json({ message: "Agents updated successfully" });
  } catch (error) {
    console.error("Error bulk updating agents:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/agents/:id
export const updateAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const updates = req.body;
    
    delete updates._id;
    delete updates.id;
    delete updates.photo;

    const agent = await Agent.update(agentId, updates);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    await logAuditAction("UPDATE", "Agent", agentId, req.user || { email: "admin@system.local" }, updates);
    
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
    
    await logAuditAction("DELETE", "Agent", agentId, req.user || { email: "admin@system.local" });
    
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

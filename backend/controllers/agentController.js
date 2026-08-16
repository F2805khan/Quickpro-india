import { Agent, AgentStats, File, AdminAlert, Booking } from "../models/index.js";
import { logAuditAction } from "../utils/auditLogger.js";
import { supabase } from "../config/supabase.js";

// GET /api/admin/agents
export const getAgents = async (req, res) => {
  try {
    const { status, verificationStatus, search, sort, dir, page = 1, limit = 50 } = req.query;
    let where = {};
    if (status && status !== 'All') where.status = status.toLowerCase();
    if (verificationStatus && verificationStatus !== 'All') where.verificationStatus = verificationStatus.toLowerCase();

    if (search) {
      where.or = [
        { name: { like: search } },
        { phone: { like: search } },
        { email: { like: search } }
      ];
    }

    const order = sort ? [[sort, dir || 'asc']] : [['createdAt', 'desc']];

    const agents = await Agent.findAll({
      where,
      order,
      limit: parseInt(limit)
    });

    const mappedAgents = agents.map(a => {
      const data = a.toJSON ? a.toJSON() : a;
      return {
        ...data,
        photo: data.photo || data.photoUrl || data.profilePhotoFileId,
        skills: Array.isArray(data.skills) ? data.skills : (data.serviceCategory ? data.serviceCategory.split(",").map(s => s.trim()) : [])
      };
    });
    res.json(mappedAgents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/agents/:id
export const getAgentById = async (req, res) => {
  try {
    console.log("getAgentById called with ID:", req.params.id);
    const agent = await Agent.findByPk(req.params.id);
    if (!agent) {
      console.log("getAgentById returning 404 for ID:", req.params.id);
      return res.status(404).json({ message: "Agent not found" });
    }
    
    let stats = null;
    try {
      stats = await AgentStats.findByPk(req.params.id);
    } catch (statsError) {
      console.warn(`Could not fetch stats for agent ${req.params.id}:`, statsError.message);
      // Fallback gracefully if agent_stats table is missing
    }

    console.log("getAgentById success for ID:", req.params.id);
    res.json({ ...agent.toJSON(), stats: stats ? stats.toJSON() : null });
  } catch (error) {
    console.error("Error fetching agent details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/agents
export const createAgent = async (req, res) => {
  try {
    const { 
      name, phone, email, profilePhotoFileId, status, verificationStatus, skills, 
      latitude, longitude, dob, gender, address, pincode, panCard, panImageId,
      secondIdProofId, serviceCategory, subServices, experienceYears, languages,
      serviceAreaPincodes, availability, jobRadiusKm, bankAccount, ifscCode,
      accountHolderName, upiId, cancelledChequeId, vehicleType, vehicleNumber,
      drivingLicenseId, acceptTerms, consentBackgroundCheck, digitalSignature,
      emergencyContactName, emergencyContactPhone
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newAgentData = {
      name,
      ...(phone && { phone }),
      ...(email && { email }),
      ...(profilePhotoFileId && { profilePhotoFileId }),
      ...(status && { status }),
      ...(verificationStatus && { verificationStatus }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(skills && { skills: Array.isArray(skills) ? skills.join(", ") : String(skills) }),
      ...(dob !== undefined && { dob }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(pincode !== undefined && { pincode }),
      ...(panCard !== undefined && { panCard }),
      ...(panImageId !== undefined && { panImageId }),
      ...(secondIdProofId !== undefined && { secondIdProofId }),
      ...(serviceCategory !== undefined && { serviceCategory }),
      ...(subServices !== undefined && { subServices }),
      ...(experienceYears !== undefined && { experienceYears }),
      ...(languages !== undefined && { languages }),
      ...(serviceAreaPincodes !== undefined && { serviceAreaPincodes }),
      ...(availability !== undefined && { availability }),
      ...(jobRadiusKm !== undefined && { jobRadiusKm }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(ifscCode !== undefined && { ifscCode }),
      ...(accountHolderName !== undefined && { accountHolderName }),
      ...(upiId !== undefined && { upiId }),
      ...(cancelledChequeId !== undefined && { cancelledChequeId }),
      ...(vehicleType !== undefined && { vehicleType }),
      ...(vehicleNumber !== undefined && { vehicleNumber }),
      ...(drivingLicenseId !== undefined && { drivingLicenseId }),
      ...(acceptTerms !== undefined && { acceptTerms }),
      ...(consentBackgroundCheck !== undefined && { consentBackgroundCheck }),
      ...(digitalSignature !== undefined && { digitalSignature }),
      ...(emergencyContactName !== undefined && { emergencyContactName }),
      ...(emergencyContactPhone !== undefined && { emergencyContactPhone })
    };

    const agent = await Agent.create(newAgentData);

    if (agent) {
      await logAuditAction("CREATE", "Agent", agent._id || agent.id, req.user || { email: "admin@system.local" }, { name: agent.name });
      
      if (verificationStatus === "under_review") {
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

    for (const id of ids) {
      const agent = await Agent.findByPk(id);
      if (agent) {
        await agent.update(updates);
      }
    }

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
    const { 
      name, phone, email, profilePhotoFileId, skills, latitude, longitude,
      dob, gender, address, pincode, panCard, panImageId, secondIdProofId,
      serviceCategory, subServices, experienceYears, languages, serviceAreaPincodes,
      availability, jobRadiusKm, bankAccount, ifscCode, accountHolderName, upiId,
      cancelledChequeId, vehicleType, vehicleNumber, drivingLicenseId, acceptTerms,
      consentBackgroundCheck, digitalSignature, emergencyContactName, emergencyContactPhone
    } = req.body;
    
    const dbUpdates = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(profilePhotoFileId !== undefined && { profilePhotoFileId }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(skills !== undefined && { skills: Array.isArray(skills) ? skills.join(", ") : String(skills) }),
      ...(dob !== undefined && { dob }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(pincode !== undefined && { pincode }),
      ...(panCard !== undefined && { panCard }),
      ...(panImageId !== undefined && { panImageId }),
      ...(secondIdProofId !== undefined && { secondIdProofId }),
      ...(serviceCategory !== undefined && { serviceCategory }),
      ...(subServices !== undefined && { subServices }),
      ...(experienceYears !== undefined && { experienceYears }),
      ...(languages !== undefined && { languages }),
      ...(serviceAreaPincodes !== undefined && { serviceAreaPincodes }),
      ...(availability !== undefined && { availability }),
      ...(jobRadiusKm !== undefined && { jobRadiusKm }),
      ...(bankAccount !== undefined && { bankAccount }),
      ...(ifscCode !== undefined && { ifscCode }),
      ...(accountHolderName !== undefined && { accountHolderName }),
      ...(upiId !== undefined && { upiId }),
      ...(cancelledChequeId !== undefined && { cancelledChequeId }),
      ...(vehicleType !== undefined && { vehicleType }),
      ...(vehicleNumber !== undefined && { vehicleNumber }),
      ...(drivingLicenseId !== undefined && { drivingLicenseId }),
      ...(acceptTerms !== undefined && { acceptTerms }),
      ...(consentBackgroundCheck !== undefined && { consentBackgroundCheck }),
      ...(digitalSignature !== undefined && { digitalSignature }),
      ...(emergencyContactName !== undefined && { emergencyContactName }),
      ...(emergencyContactPhone !== undefined && { emergencyContactPhone })
    };

    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    await agent.update(dbUpdates);
    
    await logAuditAction("UPDATE", "Agent", agentId, req.user || { email: "admin@system.local" }, dbUpdates);
    
    res.json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ 
      message: error.message || "Server error"
    });
  }
};

// POST /api/admin/agents/:id/status
export const updateAgentStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const agent = await Agent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    await agent.update({ status });

    await logAuditAction("STATUS_CHANGE", "Agent", req.params.id, req.user || { email: "admin@system.local" }, { status, reason });

    res.json({ message: "Agent status updated", agent });
  } catch (error) {
    console.error("Error updating agent status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/agents/:id/verify
export const verifyAgent = async (req, res) => {
  try {
    const { verificationStatus, reason } = req.body;
    const validStatuses = ['not_submitted', 'under_review', 'verified', 'rejected'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const agent = await Agent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    await agent.update({ 
      verificationStatus 
    });

    await logAuditAction("VERIFY", "Agent", req.params.id, req.user || { email: "admin@system.local" }, { verificationStatus, reason });

    res.json({ message: "Agent verification status updated", agent });
  } catch (error) {
    console.error("Error verifying agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/agents/:id
export const deleteAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    await agent.destroy();
    
    await logAuditAction("DELETE", "Agent", agentId, req.user || { email: "admin@system.local" });
    
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/agents/:id/documents
export const getAgentDocuments = async (req, res) => {
  try {
    console.log("getAgentDocuments called with ID:", req.params.id);
    const files = await File.findAll({
      where: { ownerId: req.params.id, ownerType: 'agent' }
    });
    res.json(files);
  } catch (error) {
    console.error("Error fetching agent documents:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/agents/:id/documents/:fileId/view
export const viewAgentDocument = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.fileId);
    if (!file || file.ownerId !== req.params.id) {
      return res.status(404).json({ message: "File not found" });
    }

    // Generate signed URL (valid for 5 minutes)
    const { data, error } = await supabase.storage
      .from('agent_documents')
      .createSignedUrl(file.storagePath, 300);

    if (error) {
      console.error("Supabase storage error:", error);
      return res.status(500).json({ message: "Failed to generate signed URL" });
    }

    // Audit log this sensitive viewing
    await logAuditAction("VIEW_DOCUMENT", "File", file._id || file.id, req.user || { email: "admin@system.local" }, { fileType: file.fileType });

    res.json({ signedUrl: data.signedUrl, expiresAt: Date.now() + 300000 });
  } catch (error) {
    console.error("Error viewing agent document:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/agents/:id/jobs
export const getAgentJobs = async (req, res) => {
  try {
    console.log("getAgentJobs called with ID:", req.params.id);
    const bookings = await Booking.findAll({
      where: { providerId: req.params.id }, // We are mapping agent to providerId in Booking
      order: [['createdAt', 'desc']],
      limit: 50
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching agent jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/agents/:id/stats
export const getAgentStats = async (req, res) => {
  try {
    let stats = null;
    try {
      stats = await AgentStats.findByPk(req.params.id);
    } catch (e) {
      console.warn(`Could not fetch stats for agent ${req.params.id}:`, e.message);
    }
    res.json(stats || {});
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/agents/:id/documents
export const uploadAgentDocument = async (req, res) => {
  try {
    const agentId = req.params.id;
    const { fileType, storagePath, originalName, mimeType, size } = req.body;
    
    if (!storagePath) {
      return res.status(400).json({ message: "No storagePath provided" });
    }

    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const fileRecord = await File.create({
      ownerId: agentId,
      ownerType: 'agent',
      fileType: fileType || 'other',
      storagePath: storagePath,
      originalName: originalName || 'upload',
      mimeType: mimeType || 'application/octet-stream',
      size: size || 0
    });

    // Update agent's specific column if this is a known KYC doc type
    const updates = {};
    if (fileType === 'aadhaar_front') updates.aadhaarFileId = fileRecord.id;
    if (fileType === 'aadhaar_back') updates.aadhaarBackFileId = fileRecord.id;
    if (fileType === 'pan_card') updates.panImageId = fileRecord.id;
    if (fileType === 'profile_photo') updates.profilePhotoFileId = fileRecord.id;
    
    if (Object.keys(updates).length > 0) {
      await agent.update(updates);
    }

    await logAuditAction("UPLOAD_DOCUMENT", "File", fileRecord.id, req.user || { email: "admin@system.local" }, { fileType, agentId });

    res.status(201).json(fileRecord);
  } catch (error) {
    console.error("Error creating document record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

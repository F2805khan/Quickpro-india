import { SupabaseModel } from "./SupabaseModel.js";

class Agent extends SupabaseModel {
  static get tableName() {
    return "agents";
  }

  static get columnMap() {
    return {
      profilePhotoFileId: "profile_photo_file_id",
      isOnline: "is_online",
      lastSeenAt: "last_seen_at",
      aadhaarNumber: "aadhaar_number",
      aadhaarFileId: "aadhaar_file_id",
      aadhaarBackFileId: "aadhaar_back_file_id",
      verificationStatus: "verification_status",
      verifiedBy: "verified_by",
      verifiedAt: "verified_at",
      rejectionReason: "rejection_reason",
      completedJobsCount: "completed_jobs_count",
      documentationUrl: "documentation_url",
      kycRequired: "kyc_required"
    };
  }
}

export default Agent;

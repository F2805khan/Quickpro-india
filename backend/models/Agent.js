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
      dob: "dob",
      gender: "gender",
      address: "address",
      pincode: "pincode",
      panCard: "pan_card",
      panImageId: "pan_image_id",
      secondIdProofId: "second_id_proof_id",
      serviceCategory: "service_category",
      subServices: "sub_services",
      experienceYears: "experience_years",
      languages: "languages",
      serviceAreaPincodes: "service_area_pincodes",
      availability: "availability",
      jobRadiusKm: "job_radius_km",
      bankAccount: "bank_account",
      ifscCode: "ifsc_code",
      accountHolderName: "account_holder_name",
      upiId: "upi_id",
      cancelledChequeId: "cancelled_cheque_id",
      vehicleType: "vehicle_type",
      vehicleNumber: "vehicle_number",
      drivingLicenseId: "driving_license_id",
      acceptTerms: "accept_terms",
      consentBackgroundCheck: "consent_background_check",
      digitalSignature: "digital_signature",
      emergencyContactName: "emergency_contact_name",
      emergencyContactPhone: "emergency_contact_phone",
      kycRequired: "kyc_required"
    };
  }
}

export default Agent;

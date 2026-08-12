import { SupabaseModel } from "./SupabaseModel.js";

class File extends SupabaseModel {
  static get tableName() {
    return "files";
  }

  static get columnMap() {
    return {
      ownerType: "owner_type",
      ownerId: "owner_id",
      fileType: "file_type",
      storagePath: "storage_path",
      mimeType: "mime_type",
      sizeBytes: "size_bytes",
      uploadedAt: "uploaded_at"
    };
  }
}

export default File;

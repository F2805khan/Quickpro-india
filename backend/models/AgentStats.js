import { SupabaseModel } from "./SupabaseModel.js";

class AgentStats extends SupabaseModel {
  static get tableName() {
    return "agent_stats";
  }

  static get primaryKey() {
    return "agent_id";
  }

  static get columnMap() {
    return {
      agentId: "agent_id",
      totalJobs: "total_jobs",
      completedJobs: "completed_jobs",
      rejectedJobs: "rejected_jobs",
      cancelledJobs: "cancelled_jobs",
      avgRating: "avg_rating",
      lastJobAt: "last_job_at"
    };
  }
}

export default AgentStats;

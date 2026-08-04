import { AdminAlert } from "../models/index.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await AdminAlert.findAll();
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAlertRead = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await AdminAlert.update(id, { is_read: true });
    res.json(alert);
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({ message: "Server error" });
  }
};

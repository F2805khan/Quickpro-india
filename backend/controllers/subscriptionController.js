import { Subscription } from "../models/index.js";

export const getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.query; // in prod, get from session
    const subscriptions = await Subscription.find(userId ? { userId } : {});
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { userId, planName, planType, price } = req.body;
    
    const expiresAt = new Date();
    if (planType === "annual") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      userId,
      planName,
      planType,
      price,
      status: "active",
      expiresAt
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

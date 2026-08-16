import { Op } from "sequelize";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

const publicUser = (user) => ({
  _id: user._id,
  userId: user.userId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  city: user.city,
  latitude: user.latitude,
  longitude: user.longitude,
  subscriptionStatus: user.subscriptionStatus,
  role: user.role,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ user: publicUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, address, email, city, latitude, longitude, subscriptionStatus } = req.body;
  const updates = {};

  if (email !== undefined && email?.trim()) {
    const nextEmail = email.trim().toLowerCase();
    if (nextEmail !== user.email) {
      const taken = await User.findOne({
        where: { email: nextEmail, _id: { [Op.ne]: user._id } }
      });
      if (taken) {
        res.status(409);
        throw new Error("Email already in use");
      }
      updates.email = nextEmail;
    }
  }

  if (name !== undefined) {
    const nextName = String(name).trim();
    if (!nextName) {
      res.status(400);
      throw new Error("Name cannot be empty");
    }
    updates.name = nextName;
  }

  if (phone !== undefined && phone?.trim()) {
    const nextPhone = phone.trim();
    if (nextPhone !== user.phone) {
      const taken = await User.findOne({
        where: { phone: nextPhone, _id: { [Op.ne]: user._id } }
      });
      if (taken) {
        res.status(409);
        throw new Error("Phone already in use");
      }
    }
    updates.phone = nextPhone;
  }

  if (address !== undefined) {
    updates.address = address ? String(address).trim() : "";
  }

  if (city !== undefined) {
    updates.city = city ? String(city).trim() : "";
  }

  for (const [field, value, min, max] of [
    ["latitude", latitude, -90, 90],
    ["longitude", longitude, -180, 180]
  ]) {
    if (value === undefined) continue;
    if (value === null || String(value).trim() === "") {
      updates[field] = null;
      continue;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      res.status(400);
      throw new Error(`Invalid ${field}`);
    }
    updates[field] = parsed;
  }

  if (subscriptionStatus !== undefined) {
    if (!["active", "cancelled"].includes(subscriptionStatus)) {
      res.status(400);
      throw new Error("Invalid subscription status");
    }
    updates.subscriptionStatus = subscriptionStatus;
  }

  await User.persistProfileUpdates(user, updates);

  res.json({ user: publicUser(user) });
});

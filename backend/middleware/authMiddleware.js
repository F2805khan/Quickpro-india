import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }

  try {
    req.user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password", "otpCode", "otpExpires"]
      }
    });
  } catch (error) {
    console.error("Database error in auth middleware:", error);
    res.status(500);
    throw new Error("Internal server error: Database unreachable");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    next();
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
    next();
    return;
  }

  try {
    req.user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password", "otpCode", "otpExpires"]
      }
    });
  } catch (error) {
    console.error("Database error in optional auth middleware:", error);
    req.user = null;
  }

  next();
});

export const isPrivileged = (user) => user?.role === "owner" || user?.role === "admin";

export const owner = (req, res, next) => {
  if (req.user?.role === "owner") {
    next();
    return;
  }

  res.status(403);
  next(new Error("Owner access required"));
};

export const admin = (req, res, next) => {
  if (isPrivileged(req.user)) {
    next();
    return;
  }

  res.status(403);
  next(new Error("Admin access required"));
};

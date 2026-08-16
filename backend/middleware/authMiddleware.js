import { supabase } from "../config/supabase.js";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

const verifySupabaseToken = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Not authorized, token invalid or expired");
  }
  return data.user;
};

const getOrSyncUser = async (authUser) => {
  let user = await User.findByPk(authUser.id, {
    attributes: {
      exclude: ["password", "otpCode", "otpExpires"]
    }
  });

  if (!user) {
    // Lazy sync: create the user record in public.users if it doesn't exist
    const meta = authUser.user_metadata || {};
    try {
      user = await User.create({
        _id: authUser.id, // SupabaseModel maps _id to id
        email: authUser.email,
        phone: authUser.phone || meta.phone,
        name: meta.full_name || meta.name || ""
      });
      // The _id gets populated by SupabaseModel if successful
      if (user && !user._id) user._id = authUser.id;
    } catch (err) {
      console.error("Failed to lazy sync user during auth:", err);
      return null;
    }
  }

  return user;
};

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  let authUser;
  try {
    authUser = await verifySupabaseToken(token);
  } catch (error) {
    res.status(401);
    throw error;
  }

  try {
    req.user = await getOrSyncUser(authUser);
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

  try {
    const authUser = await verifySupabaseToken(token);
    req.user = await getOrSyncUser(authUser);
  } catch {
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

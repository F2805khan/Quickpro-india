import { Op } from "./sequelizeMock.js";
import User from "../models/User.js";
import { supabase } from "../config/supabase.js";

const normalize = (value) => (value?.trim() ? value.trim() : undefined);
const normalizeLower = (value) => normalize(value)?.toLowerCase();

const ensureAdminUser = async () => {
  const adminUserId = normalizeLower(process.env.ADMIN_USER_ID);
  const adminEmail = normalizeLower(process.env.ADMIN_EMAIL);
  const adminPhone = normalize(process.env.ADMIN_PHONE);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || (!adminUserId && !adminEmail && !adminPhone)) {
    console.warn(
      "Admin bootstrap skipped. Set ADMIN_USER_ID/ADMIN_EMAIL/ADMIN_PHONE and ADMIN_PASSWORD in backend/.env."
    );
    return;
  }

  try {
    const identity = [
      adminUserId ? { userId: adminUserId } : null,
      adminEmail ? { email: adminEmail } : null,
      adminPhone ? { phone: adminPhone } : null
    ].filter(Boolean);

    let admin = await User.findOne({
      where: { [Op.or]: identity }
    });

    if (!admin) {
      admin =
        (await User.findOne({ where: { role: "owner" } })) ||
        (await User.findOne({ where: { role: "admin" } }));
    }

    const adminEmailToSync = adminEmail || (adminUserId ? `${adminUserId}@quickpro.local` : null);

    if (!admin) {
      // Local admin does not exist. Check if Supabase user exists
      let supabaseUserId = null;
      if (adminEmailToSync) {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        let existing = (usersData?.users || []).find(u => u.email === adminEmailToSync);
        if (!existing) {
          const { data: created } = await supabase.auth.admin.createUser({
            email: adminEmailToSync,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: "owner" }
          });
          if (created?.user) supabaseUserId = created.user.id;
        } else {
          supabaseUserId = existing.id;
        }
      }

      admin = await User.create({
        _id: supabaseUserId, // uses Supabase ID if available
        name: normalize(process.env.ADMIN_NAME) || "Quickpro India Control",
        userId: adminUserId,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: "owner",
        authProvider: "password"
      });
    } else {
      // Local admin exists. Ensure Supabase matches the local ID
      const localId = admin._id;
      if (adminEmailToSync) {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existing = (usersData?.users || []).find(u => u.email === adminEmailToSync);
        
        if (existing && existing.id !== localId) {
          // Delete the wrong-ID user from Auth to free up the email
          await supabase.auth.admin.deleteUser(existing.id);
        }

        if (!existing || existing.id !== localId) {
          // Recreate in Auth with the correct local DB ID
          await supabase.auth.admin.createUser({
            id: localId,
            email: adminEmailToSync,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: "owner" }
          });
        } else {
          // Exists with correct ID, just update password/role
          await supabase.auth.admin.updateUserById(localId, {
            password: adminPassword,
            user_metadata: { ...existing.user_metadata, role: "owner" }
          });
        }
      }

      admin.role = "owner";
      admin.authProvider = "password";
      const preferredName = normalize(process.env.ADMIN_NAME) || "Quickpro India Control";
      if (!admin.name || admin.name.toLowerCase() === "quickfix admin") {
        admin.name = preferredName;
      }
      if (adminUserId && admin.userId !== adminUserId) admin.userId = adminUserId;
      if (adminEmail && admin.email !== adminEmail) admin.email = adminEmail;
      if (adminPhone && admin.phone !== adminPhone) admin.phone = adminPhone;
      admin.password = adminPassword;
      await admin.save();
    }

    console.log(`Owner ready: ${admin.userId || admin.email || admin.phone}`);
  } catch (error) {
    console.error("Admin bootstrap failed:", error?.message || error);
    console.warn("The server will start but admin login may not work until the schema migration is applied.");
  }
};

export default ensureAdminUser;

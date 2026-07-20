import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = typeof req.auth === "function" ? req.auth().userId : req.auth.userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // Fallback: If user isn't in MongoDB (e.g., webhook failed/unconfigured), fetch from Clerk and create them
      if (!user) {
        console.log(`User ${clerkId} not found in DB. Auto-syncing from Clerk...`);
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        user = await User.create({
          clerkId,
          email,
          name: name || "Unknown User",
          profileImage: clerkUser.imageUrl,
        });

        // Also create the Stream user
        await upsertStreamUser({
          id: clerkId,
          name: name || "Unknown User",
          image: clerkUser.imageUrl,
        });
        console.log(`Successfully auto-synced user ${clerkId}`);
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];


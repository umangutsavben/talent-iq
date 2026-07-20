import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, default: "" },
    clerkId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function seedUser() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to MongoDB");

    const existingUser = await User.findOne({ clerkId: "user_3GmNm8iJ856qzyopsfACyS8doRy" });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      process.exit(0);
    }

    const user = await User.create({
      clerkId: "user_3GmNm8iJ856qzyopsfACyS8doRy",
      email: "umangutsavben@gmail.com",
      name: "UMANG KUMAR",
      profileImage: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zR21ObTlRVGdVVzRBYnhpUXg0SU1QTzNJRW8ifQ",
    });

    console.log("✅ User created successfully:", user);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedUser();

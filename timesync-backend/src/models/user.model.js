const bcrypt = require("bcryptjs");
const db = require("../config/db.config")();

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

const userModel = {
  create: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [userData.username, userData.email, hashedPassword]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  // Add other user-related database operations
};

module.exports = mongoose.model("User", userSchema);
module.exports = userModel;

require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const JWT_SECRET =
  "a527f9602e023dd7cd8f6d7af76feb32dcb68da9f3144bfb709848b7d588818ce1c22d4003de94cf921d491a2f3bdb4067f50c1386719e3b81ae6026bbacbe31";

// Sequelize setup
const sequelize = new Sequelize(
  "postgresql://lovetaps_9aha_user:njrEuOyfI4H75rDELF8szb76C9Xq4C7D@dpg-d34fsijipnbc73fuioc0-a.oregon-postgres.render.com/lovetaps_9aha",
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false, // Set to console.log to see SQL queries
  }
);

// Define User model - this will create the 'users' table
const User = sequelize.define(
  "User",
  {
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    connectionid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // generates a random v4 uuid
      allowNull: false,
    },
    avatar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false, // Set to true if you want createdAt/updatedAt columns
  }
);

// Initialize database and create tables
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to the database");

    // This will create the tables if they don't exist
    await sequelize.sync();
    console.log("✅ Database tables created/synchronized");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
}

// Initialize database on startup
initDB();

// Register a new user
app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" + req.body });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
    });
    res.json({ message: "User registered", userid: user.userid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login
app.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password, token } = req.body;
  if (!username || !password || !token)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    await user.update({ token });

    res.json({
      username: user.username,
      token: user.token,
      connectionId: user.connectionid,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by connectionId
app.post("/user-by-connectionId", async (req, res) => {
  const { connectionId } = (req.body);
  connectionId = connectionId.trim().toLowerCase();
  console.log(req.body);

  try {
    const user = await User.findOne({
      where: sequelize.where(
        // cast uuid to text, then do a LIKE prefix match
        sequelize.cast(sequelize.col("connectionid"), "text"),
        { [Op.like]: `${connectionId}%` }
      ),
    });

    console.log(user);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      username: user.username,
      token: user.token,
      connectionId: user.connectionid,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update-avatar", async (req, res) => {
  console.log(req.body);
  const { username, avatar } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({ avatar });

    res.json({
      message: "Avatar updated successfully",
      user: { username: user.username, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "*", // Allow requests from this specific origin
    methods: ["GET", "POST"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

app.use(express.json());

const JWT_SECRET =
  "a527f9602e023dd7cd8f6d7af76feb32dcb68da9f3144bfb709848b7d588818ce1c22d4003de94cf921d491a2f3bdb4067f50c1386719e3b81ae6026bbacbe31";

// PostgreSQL connection
let pool;
try {
  pool = new Pool({
    connectionString:
      "postgresql://lovetaps_user:O3tE6aYat2xQUEkd04Hs6EerKztUPD9k@dpg-cujmtmjv2p9s7383q0m0-a/lovetaps",
    ssl: { rejectUnauthorized: false },
  });
  console.log("✅ Connected to the database");
} catch (err) {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
}

// Register a new user
app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" + req.body });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );
    res.json({ message: "User registered", userid: result.rows[0].userid });
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
      
    let user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword)
        return res.status(401).json({ error: "Invalid credentials" });
  
  
    await pool.query("UPDATE users SET Token = $1 WHERE username = $2", [
      token,
      username,
    ]);
    user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    res.json({
      username: user.rows[0].username,
      token: user.rows[0].token,
      connectionId: user.rows[0].connectionid,
      avatar: user.rows[0].avatar
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by connectionId
app.post("/user-by-connectionId", async (req, res) => {
  const { connectionId } = req.body;
  console.log(req.body);

  try {
    const user = await pool.query(`SELECT * FROM users WHERE SUBSTRING(connectionid::TEXT FROM 1 FOR 13) ='${connectionId}'`);
    console.log(user);
    console.log(
      "Executing Query: SELECT * FROM users WHERE LEFT(connectionid, 13) =",
      connectionId
    );
    if (user.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({
      username: user.rows[0].username,
      token: user.rows[0].token,
      connectionId: user.rows[0].connectionid,
      avatar: user.rows[0].avatar
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
    const updatedUser = await pool.query(
      `UPDATE users SET avatar = ${avatar} WHERE username ='${username}' RETURNING username, avatar`
    )

    console.log(req.body);


    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Avatar updated successfully", user: updatedUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

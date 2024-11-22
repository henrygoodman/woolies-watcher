import express from "express";
import { Pool } from "pg";

const app = express();
const port = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ message: "Server is running", time: result.rows[0] });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

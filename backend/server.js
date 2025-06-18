import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

// ------------ DB setup -------------
const db = new Low(new JSONFile("db.json"), { users: [] });
await db.read();

function findUser(nick) {
  return db.data.users.find((u) => u.nick.toLowerCase() === nick.toLowerCase());
}

const MODIFIERS = ["reveal", "shuffle", "skip"];

// ------------ App setup ------------
const app = express();
app.use(cors());
app.use(express.json());

// Create or return existing user
app.post("/users", async (req, res) => {
  const { nick } = req.body;
  if (!nick) return res.status(400).json({ error: "nick required" });
  let user = findUser(nick);
  if (!user) {
    user = {
      id: nanoid(),
      nick,
      inventory: MODIFIERS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {}),
    };
    db.data.users.push(user);
    await db.write();
  }
  return res.json(user);
});

// Get user by nick
app.get("/users/:nick", (req, res) => {
  const user = findUser(req.params.nick);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

// Gain random modifier
app.post("/users/:nick/gain", async (req, res) => {
  const user = findUser(req.params.nick);
  if (!user) return res.status(404).json({ error: "User not found" });
  const mod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
  user.inventory[mod] += 1;
  await db.write();
  return res.json({ modifier: mod, inventory: user.inventory });
});

// Use modifier
app.post("/users/:nick/use", async (req, res) => {
  const { modifier } = req.body;
  const user = findUser(req.params.nick);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!MODIFIERS.includes(modifier)) {
    return res.status(400).json({ error: "Invalid modifier" });
  }
  if (user.inventory[modifier] <= 0) {
    return res.status(400).json({ error: "No modifier available" });
  }
  user.inventory[modifier] -= 1;
  await db.write();
  return res.json({ inventory: user.inventory });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));

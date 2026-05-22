import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User } from "@/lib/types";

// Keep users in a local json file inside the workspace
const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

// Helper to ensure database directory and file exist
function ensureDatabase() {
  const dir = path.dirname(USERS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]), "utf8");
  }
}

export function getUsers(): User[] {
  ensureDatabase();
  try {
    const data = fs.readFileSync(USERS_FILE_PATH, "utf8");
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error("Error reading users database", error);
    return [];
  }
}

export function saveUsers(users: User[]) {
  ensureDatabase();
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to users database", error);
  }
}

export async function createUser(name: string, email: string, passwordPlain: string): Promise<User> {
  const users = getUsers();
  
  // Check if user exists
  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);

  const newUser: User = {
    id: Math.random().toString(36).substring(2, 11),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`, // dynamic avatar
  };

  users.push(newUser);
  saveUsers(users);
  
  return newUser;
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

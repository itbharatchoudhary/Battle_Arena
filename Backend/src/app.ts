import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rungraph from "./ai/graph.ai.js";

const app = express();

// ✅ CORS config
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json());

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// In-memory user storage (replace with database in production)
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'premium';
  avatar: string;
  createdAt: Date;
}

interface Usage {
  userId: string;
  used: number;
  limit: number;
}

const users: User[] = [];
const usages: Usage[] = [];

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      plan: 'free',
      avatar: '👤',
      createdAt: new Date()
    };

    users.push(user);

    // Create usage record
    usages.push({
      userId: user.id,
      used: 0,
      limit: 5
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/invoke", authenticateToken, async (req: any, res: any) => {
  try {
    const { input } = req.body;
    const userId = req.user.id;

    //  VALIDATION
    if (!input || input.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Input is required"
      });
    }

    // Find user and usage
    const user = users.find(u => u.id === userId);
    const usage = usages.find(u => u.userId === userId);

    if (!user || !usage) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check usage limit for free users
    if (user.plan === 'free' && usage.used >= usage.limit) {
      return res.status(403).json({
        success: false,
        message: "Usage limit reached. Please upgrade your plan."
      });
    }

    const result = await rungraph(input);

    // Increment usage for free users
    if (user.plan === 'free') {
      usage.used += 1;
    }

    res.status(200).json({
      message: "Graph executes successfully",
      success: true,
      data: result
    });

  } catch (error) {
    console.error(" FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error executing graph",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Plans data
const plansData = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["5 uses per month", "Basic AI models", "Standard response time"]
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    features: ["Unlimited uses", "Priority processing", "Advanced AI models", "Faster responses"]
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    features: ["Everything in Pro", "Custom AI training", "API access", "24/7 support"]
  }
];

app.get("/user/profile", authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    avatar: user.avatar
  });
});

app.get("/user/usage", authenticateToken, (req: any, res: any) => {
  const usage = usages.find(u => u.userId === req.user.id);
  if (!usage) {
    return res.status(404).json({ error: "Usage data not found" });
  }

  res.json({
    used: usage.used,
    limit: usage.limit
  });
});

app.get("/plans", (req, res) => {
  res.json(plansData);
});

app.post("/upgrade", authenticateToken, (req: any, res: any) => {
  const { planId } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const usage = usages.find(u => u.userId === req.user.id);

  if (!user || !usage) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!plansData.find(p => p.id === planId)) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  user.plan = planId as 'free' | 'pro' | 'premium';
  usage.used = 0; // reset usage on upgrade
  res.json({ success: true, message: "Plan upgraded" });
});

export default app;
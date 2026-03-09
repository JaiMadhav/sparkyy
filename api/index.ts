import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "dotenv/config";
import Razorpay from "razorpay";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// Razorpay Create Order Endpoint
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: "Razorpay API keys are not configured." });
    }
    
    const razorpay = new Razorpay({ key_id, key_secret });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency: "INR",
      receipt: receipt,
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Razorpay Verify Payment Endpoint
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({ error: "Razorpay API keys are not configured." });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Catch-all for API 404s
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    // Note: On Vercel, static files are served by the platform, not Express.
    // This block is for other production environments.
    const distPath = path.resolve(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;

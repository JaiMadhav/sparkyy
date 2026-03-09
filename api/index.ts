import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "dotenv/config";
import Razorpay from "razorpay";

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

// Razorpay Payment Link Endpoint
app.post("/api/create-payment-link", async (req, res) => {
  console.log("POST /api/create-payment-link - Request Body:", JSON.stringify(req.body));
  try {
    const { amount, receipt, customer, callback_url } = req.body;
    
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("Razorpay API keys are missing in environment variables.");
      return res.status(500).json({ 
        error: "Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables." 
      });
    }
    
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    console.log(`Creating payment link for amount: ${amount}, receipt: ${receipt}`);

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      accept_partial: false,
      description: "SPARK EV Charging Service",
      customer: {
        name: customer?.name || "Guest User",
        email: customer?.email || "guest@example.com",
        contact: customer?.phone || "+919999999999"
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      notes: {
        booking_id: receipt
      },
      callback_url: callback_url,
      callback_method: "get"
    };
    
    const paymentLink = await razorpay.paymentLink.create(options);
    console.log("Payment link created successfully:", paymentLink.id);
    res.json(paymentLink);
  } catch (error: any) {
    console.error("Razorpay Error Details:", JSON.stringify(error, null, 2));
    
    let errorMessage = "Failed to create payment link";
    
    if (error?.error?.description) {
      errorMessage = error.error.description;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    res.status(500).json({ error: errorMessage });
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

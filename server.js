import express from "express";
import Stripe from "stripe";

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Health check
app.get("/", (req, res) => {
  res.send("Giftettes backend is running");
});

// Create Stripe Connect Express account (UK ONLY)
app.post("/api/fundraiser/create", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
      capabilities: {
        transfers: { requested: true }
      }
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://giftettes.com/stripe/refresh",
      return_url: "https://giftettes.com/stripe/return",
      type: "account_onboarding"
    });

    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

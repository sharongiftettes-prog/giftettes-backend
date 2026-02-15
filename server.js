import express from "express";
import Stripe from "stripe";

const app = express();
app.use(express.json());

// Use the newly named environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_2);

// Quick health check endpoint
app.get("/", (req, res) => {
  res.send("Giftettes backend is running");
});

// Create Stripe Connect Express account for a fundraiser
app.post("/api/fundraiser/create", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB", // UK only
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

    // Respond with account ID and onboarding URL
    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(400).json({ error

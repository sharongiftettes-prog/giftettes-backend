import express from "express";
import Stripe from "stripe";

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// quick test so we know the server is alive
app.get("/", (req, res) => {
  res.send("Giftettes backend is running");
});

// create Stripe Connect Express account for a fundraiser
app.post("/api/fundraiser/create", async (req, res) => {

    const account = await stripe.accounts.create({
      type: "express",
      country: "GB", // change later if needed
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

    res.json({ onboardingUrl: accountLink.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

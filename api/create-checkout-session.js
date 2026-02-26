import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, currency = "INR" } = req.body;

    const line_items = items.map((i) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: { name: i.name, images: i.image ? [i.image] : [] },
        unit_amount: Math.round(i.amount * 100),
      },
      quantity: i.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.SITE_URL}/?success=1`,
      cancel_url: `${process.env.SITE_URL}/?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

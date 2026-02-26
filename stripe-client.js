import { cart } from "./store.js";

export async function payWithStripe(currency = "INR") {
  const items = cart.map((p) => ({
    name: p.name,
    amount: p.price,
    qty: p.quantity,
    image: (p.images && p.images[0]) || p.image || ""
  }));

  const r = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, currency })
  });

  const data = await r.json();
  if (data.url) window.location.href = data.url;
  else alert(data.error || "Payment error");
}

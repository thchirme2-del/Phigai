import { cart } from "./store.js";

async function payWithStripe() {
  if (!cart || cart.length === 0) {
    alert("Your bag is empty. Add at least 1 product.");
    return;
  }

  const items = cart.map((p) => ({
    name: p.name,
    amount: Number(p.price),
    qty: Number(p.quantity || 1),
    image: p.image || ""
  }));

  const r = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, currency: "INR" })
  });

  const data = await r.json();
  if (data.url) window.location.href = data.url;
  else alert(data.error || "Payment error");
}

document.getElementById("confirm-order")?.addEventListener("click", payWithStripe);

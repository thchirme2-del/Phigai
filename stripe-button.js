async function payWithStripe() {
  const r = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { name: "Phigai Order", amount: 1000, qty: 1 }
      ],
      currency: "INR"
    })
  });

  const data = await r.json();
  if (data.url) window.location.href = data.url;
  else alert("Payment error");
}

document.getElementById("confirm-order")?.addEventListener("click", payWithStripe);

/* Fleet United product catalog.
   Static config only. No secret keys belong in this file.

   Payments, when the shop is ready to charge:
   - Create a Stripe Payment Link per product in a Stripe sandbox first
     (Dashboard → Payment Links, or Checkout Sessions if you add a server).
   - Put that URL on the product as stripeLink.
   - Set status to "in_stock".
   While stripeLink is null, or the item is not in stock, checkout emails a
   pre-order request and does not send the buyer to Stripe.
   One Payment Link cannot describe a mixed cart. That case stays on the
   mailto path until a server can create a Checkout Session. */
(function (root) {
  var products = [
    {
      id: "mud-flaps",
      name: "Custom Logo Mud Flaps",
      category: "mud-flaps",
      categoryLabel: "Mud flaps",
      status: "out_of_stock",
      statusLabel: "Out of stock",
      stripeLink: null,
      url: "shop/mud-flaps/",
      image: "assets/products/mud-flaps-600.jpg",
      imageAlt: "Rear of a grain hopper trailer with plain black rubber mud flaps behind the wheels (illustrative photo)",
      spec: "24×30 or 24×36, rubber or poly, logo hot-stamped or molded in"
    },
    {
      id: "led-marker-lights",
      name: "LED Marker & Clearance Lights",
      category: "lighting",
      categoryLabel: "Lighting",
      status: "out_of_stock",
      statusLabel: "Out of stock",
      stripeLink: null,
      url: "shop/led-marker-lights/",
      image: "assets/products/led-marker-lights-600.jpg",
      imageAlt: "Round amber LED marker light in a chrome housing on a trailer",
      spec: "Sealed LED marker lights in amber or red"
    },
    {
      id: "ratchet-straps",
      name: "Ratchet Straps",
      category: "cargo",
      categoryLabel: "Cargo",
      status: "out_of_stock",
      statusLabel: "Out of stock",
      stripeLink: null,
      url: "shop/ratchet-straps/",
      image: "assets/products/ratchet-straps-600.jpg",
      imageAlt: "Yellow polyester webbing wound on a steel ratchet",
      spec: "Polyester webbing with a steel ratchet, 2\" or 4\" wide"
    },
    {
      id: "gladhands",
      name: "Gladhands & Seals",
      category: "air",
      categoryLabel: "Air systems",
      status: "out_of_stock",
      statusLabel: "Out of stock",
      stripeLink: null,
      url: "shop/gladhands/",
      image: "assets/products/gladhands-600.jpg",
      imageAlt: "Two gladhand couplings with rubber seals on red and blue air lines",
      spec: "Air brake coupling heads, with replacement rubber seals"
    },
    {
      id: "air-brake-coils",
      name: "Coiled Air Brake Lines",
      category: "air",
      categoryLabel: "Air systems",
      status: "coming_soon",
      statusLabel: "Coming soon",
      stripeLink: null,
      url: "shop/air-brake-coils/",
      image: "assets/products/air-brake-coils-600.jpg",
      imageAlt: "Red and blue coiled air brake lines hanging at the back of a tractor",
      spec: "Coiled emergency/supply (red) and service (blue) air lines"
    }
  ];

  var byId = {};
  products.forEach(function (product) {
    byId[product.id] = product;
  });

  function paymentPlan(lines) {
    if (!lines || !lines.length) {
      return { mode: "preorder_mailto", reason: "empty" };
    }
    var link = null;
    for (var i = 0; i < lines.length; i++) {
      var product = byId[lines[i].id];
      if (!product || product.status !== "in_stock" || !product.stripeLink) {
        return { mode: "preorder_mailto", reason: "unavailable_or_unlinked" };
      }
      if (link && link !== product.stripeLink) {
        return { mode: "preorder_mailto", reason: "mixed_payment_links" };
      }
      link = product.stripeLink;
    }
    return { mode: "stripe_payment_link", url: link };
  }

  root.FU_CATALOG = {
    email: "linda.cross@fleetunitedusa.com",
    pricingLabel: "Fleet pricing on request",
    products: products,
    byId: byId,
    paymentPlan: paymentPlan
  };
})(typeof window !== "undefined" ? window : this);

/* Cart, gallery lightbox, notify-me, and pre-order checkout.
   No payment is collected. Stripe is only used later if a product
   stripeLink is set and that product is marked in_stock. */
(function () {
  var script = document.currentScript;
  var ROOT = new URL("../", script && script.src ? script.src : window.location.href);
  var CATALOG = window.FU_CATALOG || {
    email: "hello@fleetunitedusa.com",
    pricingLabel: "Fleet pricing on request",
    products: [],
    byId: {},
    paymentPlan: function () { return { mode: "preorder_mailto" }; }
  };
  var KEY = "fu-preorder-cart";
  var LAST = "fu-last-preorder";
  var memory = null;
  var lastFocus = null;
  var focusRestore = null;
  var drawer;
  var overlay;

  function asset(path) {
    if (!path) return "";
    if (/^(https?:|data:|\/)/.test(path)) return path;
    return new URL(path, ROOT).href;
  }

  function page(path) {
    return new URL(path, ROOT).href;
  }

  function readCart() {
    if (!memory) {
      try {
        var raw = localStorage.getItem(KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        memory = Array.isArray(parsed) ? parsed.filter(function (line) {
          return line && typeof line.id === "string" && CATALOG.byId[line.id];
        }) : [];
      } catch (err) {
        memory = [];
      }
    }
    return memory.map(function (line) {
      return {
        id: line.id,
        qty: clampQty(line.qty),
        options: Object.assign({}, line.options || {})
      };
    });
  }

  function writeCart(items) {
    memory = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) { /* private mode */ }
    renderAll();
  }

  function clampQty(value) {
    var qty = parseInt(value, 10);
    if (!qty || qty < 1) return 1;
    if (qty > 999) return 999;
    return qty;
  }

  function lineKey(line) {
    var keys = Object.keys(line.options || {}).sort();
    return line.id + "|" + keys.map(function (key) { return key + "=" + line.options[key]; }).join("|");
  }

  function addLine(line) {
    var items = readCart();
    var key = lineKey(line);
    var found = false;
    items.forEach(function (item) {
      if (lineKey(item) === key) {
        item.qty = clampQty(item.qty + line.qty);
        found = true;
      }
    });
    if (!found) items.push(line);
    writeCart(items);
    var product = CATALOG.byId[line.id];
    announce("Added " + line.qty + " " + (product ? product.name : "item") + " to your pre-order request.");
  }

  function rememberFocus(node) {
    if (!node || !node.getAttribute) return;
    var token = node.getAttribute("data-focus");
    var scope = node.closest("#fu-drawer, #cart-page, #order-summary");
    if (token && scope) focusRestore = { token: token, scope: scope };
  }

  function restoreFocus() {
    if (!focusRestore || !focusRestore.scope || !focusRestore.scope.isConnected) {
      focusRestore = null;
      return;
    }
    var next = focusRestore.scope.querySelector('[data-focus="' + CSS.escape(focusRestore.token) + '"]');
    focusRestore = null;
    if (next) next.focus();
  }

  function updateQty(key, qty) {
    var items = readCart().map(function (item) {
      if (lineKey(item) === key) item.qty = clampQty(qty);
      return item;
    });
    writeCart(items);
  }

  function removeLine(key) {
    writeCart(readCart().filter(function (item) { return lineKey(item) !== key; }));
    announce("Removed from your pre-order request.");
  }

  function countItems(items) {
    return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function optionPairs(options) {
    return Object.keys(options || {}).map(function (key) {
      return key + ": " + options[key];
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "class") node.className = attrs[key];
        else if (key === "text") node.textContent = attrs[key];
        else if (key.indexOf("data-") === 0) node.setAttribute(key, attrs[key]);
        else if (attrs[key] === true) node.setAttribute(key, "");
        else if (attrs[key] !== false && attrs[key] != null) node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function soonTile(label) {
    var mark = el("span", { class: "soon-mark", "aria-hidden": "true" }, [
      el("span"), el("span"), el("span")
    ]);
    return el("div", { class: "soon-tile", role: "img", "aria-label": "Photo coming soon for " + label }, [
      mark,
      el("p", { class: "soon-kicker", text: "Photo coming soon" }),
      el("p", { class: "soon-name", text: label })
    ]);
  }

  function mediaNode(product) {
    var wrap = el("div", { class: "line-media" });
    if (product && product.image) {
      wrap.appendChild(el("img", { src: asset(product.image), alt: "" }));
    } else {
      wrap.appendChild(soonTile(product && product.placeholder ? product.placeholder : "Photo coming soon"));
    }
    return wrap;
  }

  function renderLines(container, items, compact) {
    container.textContent = "";
    if (!items.length) {
      var empty = el("p", { class: "fu-empty" });
      empty.appendChild(document.createTextNode("Your pre-order request is empty. "));
      empty.appendChild(el("a", { href: page("shop/"), text: "Browse the shop" }));
      empty.appendChild(document.createTextNode("."));
      container.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var product = CATALOG.byId[item.id];
      if (!product) return;
      var key = lineKey(item);
      var title = el("h3");
      title.appendChild(el("a", { href: page(product.url), text: product.name }));
      var meta = el("p", { text: optionPairs(item.options).join(" · ") || "Options set on your quote" });
      var note = el("p", { text: product.statusLabel + ". Options set on your quote." });
      var dec = el("button", { type: "button", "data-focus": key + ":dec", "aria-label": "Decrease quantity of " + product.name, text: "−" });
      var inc = el("button", { type: "button", "data-focus": key + ":inc", "aria-label": "Increase quantity of " + product.name, text: "+" });
      var input = el("input", {
        type: "number",
        inputmode: "numeric",
        min: "1",
        max: "999",
        value: String(item.qty),
        "data-focus": key + ":qty",
        "aria-label": "Quantity of " + product.name
      });
      dec.addEventListener("click", function () { rememberFocus(dec); updateQty(key, item.qty - 1); });
      inc.addEventListener("click", function () { rememberFocus(inc); updateQty(key, item.qty + 1); });
      input.addEventListener("change", function () { rememberFocus(input); updateQty(key, input.value); });
      var stepper = el("div", { class: "mini-stepper" }, [dec, input, inc]);
      var remove = el("button", { type: "button", class: "line-remove", "data-focus": key + ":remove", text: "Remove" });
      remove.setAttribute("aria-label", "Remove " + product.name);
      remove.addEventListener("click", function () { rememberFocus(remove); removeLine(key); });
      var row = el("div", { class: "line-row" }, [stepper, remove]);
      var copy = el("div", {}, [title, meta, note, row]);
      container.appendChild(el("article", { class: "line" }, [mediaNode(product), copy]));
    });
    if (!compact) {
      var pricing = el("p", { class: "price-line", text: CATALOG.pricingLabel });
      container.appendChild(pricing);
    }
  }

  function ensureDrawer() {
    if (document.getElementById("fu-drawer")) {
      drawer = document.getElementById("fu-drawer");
      overlay = document.querySelector(".fu-overlay");
      return;
    }
    overlay = el("div", { class: "fu-overlay", "data-cart-close": "true", hidden: true });
    var close = el("button", { type: "button", class: "fu-drawer-close", "data-cart-close": "true", text: "Close" });
    close.setAttribute("aria-label", "Close pre-order cart");
    var head = el("div", { class: "fu-drawer-head" }, [
      el("h2", { id: "fu-drawer-title", text: "Pre-order request" }),
      close
    ]);
    var note = el("p", {
      class: "fu-drawer-note",
      text: "Out of stock or coming soon. This list is a pre-order request saved on this device. No payment is taken."
    });
    var body = el("div", { class: "fu-drawer-body", "data-cart-lines": "true" });
    var live = el("p", { class: "visually-hidden", id: "fu-cart-live", "aria-live": "polite" });
    var view = el("a", { class: "s-btn s-btn-ghost", href: page("cart/"), text: "View cart" });
    var review = el("a", { class: "s-btn s-btn-red", href: page("checkout/"), "data-cart-review": "true", text: "Review request" });
    var actions = el("div", { class: "fu-drawer-actions", "data-cart-actions": "true" }, [view, review]);
    var foot = el("div", { class: "fu-drawer-foot" }, [
      el("p", { class: "price-line", text: CATALOG.pricingLabel }),
      actions
    ]);
    drawer = el("aside", {
      class: "fu-drawer",
      id: "fu-drawer",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "fu-drawer-title",
      hidden: true
    }, [head, note, live, body, foot]);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    overlay.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", function (event) {
      if (event.target.closest("[data-cart-close]")) closeDrawer();
    });
    drawer.addEventListener("keydown", trapDrawer);
  }

  function focusable(root) {
    return Array.prototype.slice.call(root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (node) { return !node.closest("[hidden]"); });
  }

  function trapDrawer(event) {
    if (event.key !== "Tab" || !drawer || drawer.hidden) return;
    var nodes = focusable(drawer);
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openDrawer() {
    ensureDrawer();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    drawer.hidden = false;
    document.body.classList.add("fu-lock");
    setInert(true);
    var close = drawer.querySelector(".fu-drawer-close");
    if (close) close.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    overlay.hidden = true;
    drawer.hidden = true;
    document.body.classList.remove("fu-lock");
    setInert(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setInert(on) {
    ["header", "main", "footer"].forEach(function (tag) {
      var node = document.querySelector(tag);
      if (node) node.inert = on;
    });
  }

  function announce(message) {
    var live = document.getElementById("fu-cart-live");
    if (live) live.textContent = message;
  }

  function renderDrawer(items) {
    ensureDrawer();
    var body = drawer.querySelector("[data-cart-lines]");
    renderLines(body, items, true);
    var actions = drawer.querySelector("[data-cart-actions]");
    if (!actions) return;
    actions.textContent = "";
    actions.appendChild(el("a", { class: "s-btn s-btn-ghost", href: page("cart/"), text: "View cart" }));
    if (items.length) {
      actions.appendChild(el("a", { class: "s-btn s-btn-red", href: page("checkout/"), text: "Review request" }));
    } else {
      actions.appendChild(el("a", { class: "s-btn s-btn-red", href: page("shop/"), text: "Browse the shop" }));
    }
  }

  function renderCartPage(items) {
    var root = document.getElementById("cart-page");
    if (!root) return;
    root.textContent = "";
    var lines = el("div", { class: "cart-lines" });
    renderLines(lines, items, false);
    root.appendChild(lines);
    if (!items.length) return;
    var note = el("p", {
      class: "fine-print",
      text: "These items are out of stock or coming soon. Submitting a request does not reserve them and no payment is taken."
    });
    var actions = el("div", { class: "fu-drawer-actions" }, [
      el("a", { class: "s-btn s-btn-ghost", href: page("shop/"), text: "Keep browsing" }),
      el("a", { class: "s-btn s-btn-red", href: page("checkout/"), text: "Review request" })
    ]);
    root.appendChild(note);
    root.appendChild(actions);
  }

  function renderSummary(items) {
    var root = document.getElementById("order-summary");
    if (!root) return;
    renderLines(root, items, true);
    var split = document.getElementById("checkout-split");
    var empty = document.getElementById("checkout-empty");
    var submit = document.getElementById("checkout-submit");
    if (split && empty) {
      var isEmpty = items.length === 0;
      empty.hidden = !isEmpty;
      split.hidden = isEmpty;
      if (submit) submit.disabled = isEmpty;
    }
  }

  function renderCount(items) {
    var total = countItems(items);
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(total);
    });
    document.querySelectorAll("[data-cart-open]").forEach(function (node) {
      node.setAttribute("aria-label", "Open pre-order cart, " + total + (total === 1 ? " item" : " items"));
    });
  }

  function renderAll() {
    var items = readCart();
    renderCount(items);
    if (document.getElementById("fu-drawer") || document.querySelector("[data-cart-open]")) renderDrawer(items);
    renderCartPage(items);
    renderSummary(items);
    restoreFocus();
  }

  function selectedOptions(scope) {
    var options = {};
    scope.querySelectorAll(".options input[type='radio']:checked").forEach(function (input) {
      options[input.name] = input.value;
    });
    return options;
  }

  function quantityOf(scope) {
    var input = scope.querySelector("[data-qty-input]");
    return input ? clampQty(input.value) : 1;
  }

  function mailto(subject, body) {
    var href = "mailto:" + CATALOG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    if (href.length > 1800) {
      body = body.slice(0, 900) + "\n\n[Message shortened. Please add any remaining notes in your email.]";
      href = "mailto:" + CATALOG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
    return href;
  }

  function openMailto(href) {
    var link = document.createElement("a");
    link.href = href;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function bindProduct() {
    var buy = document.querySelector("[data-product]");
    if (!buy) return;
    var id = buy.getAttribute("data-product");
    var name = buy.getAttribute("data-product-name") || (CATALOG.byId[id] && CATALOG.byId[id].name) || "Product";
    var qtyInput = buy.querySelector("[data-qty-input]");
    function setQty(next) {
      if (!qtyInput) return;
      qtyInput.value = String(clampQty(next));
    }
    var dec = buy.querySelector("[data-qty-dec]");
    var inc = buy.querySelector("[data-qty-inc]");
    if (dec) dec.addEventListener("click", function () { setQty(quantityOf(buy) - 1); syncQuote(); });
    if (inc) inc.addEventListener("click", function () { setQty(quantityOf(buy) + 1); syncQuote(); });
    if (qtyInput) qtyInput.addEventListener("change", function () { setQty(qtyInput.value); syncQuote(); });
    buy.querySelectorAll(".options input").forEach(function (input) {
      input.addEventListener("change", syncQuote);
    });

    function syncQuote() {
      var quote = buy.querySelector("[data-quote]");
      if (!quote) return;
      var lines = ["Please quote this for our fleet.", "", "Product: " + name].concat(optionPairs(selectedOptions(buy)));
      lines.push("Quantity: " + quantityOf(buy));
      lines.push("Options: set on your quote");
      lines.push("", "Company:", "Fleet size:", "Ship to:");
      quote.href = mailto("Fleet quote request — " + name, lines.join("\n"));
    }
    syncQuote();

    var add = buy.querySelector("[data-add]");
    if (add) {
      add.addEventListener("click", function () {
        addLine({ id: id, qty: quantityOf(buy), options: selectedOptions(buy) });
        openDrawer();
      });
    }

    var notify = document.getElementById("notify-form");
    if (notify) {
      notify.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!notify.reportValidity()) return;
        var email = (notify.querySelector("input[type='email']") || {}).value || "";
        var body = [
          "Please email me when this is available.",
          "",
          "Product: " + name,
          "Notify: " + email.trim()
        ].concat(optionPairs(selectedOptions(buy)));
        body.push("Options: set on your quote");
        body.push("", "No payment. This is an availability request only.");
        openMailto(mailto("Notify me when available — " + name, body.join("\n")));
        var done = buy.querySelector("[data-notify-done]");
        if (done) {
          done.hidden = false;
          done.textContent = "Your email app should open a message to " + CATALOG.email + ". Send it and we will reply when this is available.";
        }
      });
    }
  }

  function bindGallery() {
    var gallery = document.querySelector("[data-gallery]");
    if (!gallery || gallery.getAttribute("data-gallery") === "placeholder") return;
    var images = Array.prototype.slice.call(gallery.querySelectorAll(".stage img"));
    if (!images.length) return;
    var dialog = document.getElementById("fu-lightbox");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "fu-lightbox";
      dialog.className = "fu-lightbox";
      dialog.innerHTML = '<div class="fu-lightbox-bar"><button type="button" data-light-prev>Previous</button><p data-light-count></p><button type="button" data-light-zoom>Zoom</button><button type="button" data-light-close>Close</button><button type="button" data-light-next>Next</button></div><div class="fu-lightbox-frame"><img alt=""></div><p class="fu-lightbox-cap" data-light-cap></p>';
      document.body.appendChild(dialog);
    }
    var photo = dialog.querySelector("img");
    var cap = dialog.querySelector("[data-light-cap]");
    var count = dialog.querySelector("[data-light-count]");
    var index = 0;

    function current() {
      var radios = gallery.querySelectorAll('input[name="photo"]');
      for (var i = 0; i < radios.length; i++) if (radios[i].checked) return i;
      return 0;
    }

    function show(next) {
      index = (next + images.length) % images.length;
      var img = images[index];
      var radio = gallery.querySelectorAll('input[name="photo"]')[index];
      if (radio) radio.checked = true;
      photo.src = img.getAttribute("data-full") || img.currentSrc || img.src;
      photo.alt = img.alt;
      photo.classList.remove("is-zoomed");
      cap.textContent = img.getAttribute("data-caption") || "";
      count.textContent = "Photo " + (index + 1) + " of " + images.length;
      var live = document.getElementById("gallery-live");
      if (live) live.textContent = img.alt;
    }

    function open(event) {
      if (event) event.preventDefault();
      show(current());
      if (typeof dialog.showModal === "function") dialog.showModal();
      var close = dialog.querySelector("[data-light-close]");
      if (close) close.focus();
    }

    gallery.querySelectorAll("[data-zoom], .stage img").forEach(function (node) {
      node.addEventListener("click", open);
    });
    dialog.querySelector("[data-light-close]").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector("[data-light-prev]").addEventListener("click", function () { show(index - 1); });
    dialog.querySelector("[data-light-next]").addEventListener("click", function () { show(index + 1); });
    dialog.querySelector("[data-light-zoom]").addEventListener("click", function () { photo.classList.toggle("is-zoomed"); });
    photo.addEventListener("click", function () { photo.classList.toggle("is-zoomed"); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
    });
    gallery.querySelectorAll('input[name="photo"]').forEach(function (radio, radioIndex) {
      radio.addEventListener("change", function () {
        if (dialog.open) show(radioIndex);
        else {
          var live = document.getElementById("gallery-live");
          if (live && images[radioIndex]) live.textContent = images[radioIndex].alt;
        }
      });
    });
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;
    function closeMenu() {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
      var nav = document.getElementById("nav");
      if (nav) nav.classList.remove("menu-open");
    }
    function openMenu() {
      links.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "Close";
      var nav = document.getElementById("nav");
      if (nav) nav.classList.add("menu-open");
    }
    toggle.addEventListener("click", function () {
      if (links.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    window.fuCloseMenu = closeMenu;
  }

  function orderText(order) {
    var lines = [
      "Fleet United pre-order request",
      "No payment is taken. Items are out of stock or coming soon.",
      CATALOG.pricingLabel + ".",
      "",
      "Contact",
      "Name: " + order.name,
      "Email: " + order.email,
      "Phone: " + (order.phone || "—"),
      "Company: " + order.company,
      "Fleet size: " + order.fleet,
      "",
      "Shipping",
      order.address1,
      order.address2 || "",
      order.city + ", " + order.state + " " + order.zip,
      "United States",
      "",
      "Items"
    ];
    order.items.forEach(function (item, index) {
      var product = CATALOG.byId[item.id];
      lines.push((index + 1) + ") " + (product ? product.name : item.id));
      optionPairs(item.options).forEach(function (pair) { lines.push("   " + pair); });
      lines.push("   Options: set on your quote");
      lines.push("   Quantity: " + item.qty);
      lines.push("   Status: " + (product ? product.statusLabel : "Out of stock"));
      lines.push("   Pricing: " + CATALOG.pricingLabel);
    });
    lines.push("");
    lines.push("Notes");
    lines.push(order.notes || "—");
    lines.push("");
    lines.push("Please reply with a fleet quote. Nothing has been paid.");
    return lines.filter(function (line) { return line !== ""; }).join("\n").replace(/\n{3,}/g, "\n\n");
  }

  function bindCheckout() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var items = readCart();
      if (!items.length) return;
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var order = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        company: String(data.get("company") || "").trim(),
        fleet: String(data.get("fleet") || "").trim(),
        address1: String(data.get("address1") || "").trim(),
        address2: String(data.get("address2") || "").trim(),
        city: String(data.get("city") || "").trim(),
        state: String(data.get("state") || "").trim(),
        zip: String(data.get("zip") || "").trim(),
        notes: String(data.get("notes") || "").trim(),
        items: items
      };
      var plan = CATALOG.paymentPlan(items);
      if (plan.mode === "stripe_payment_link" && plan.url) {
        window.location.href = plan.url;
        return;
      }
      var subject = "Pre-order request — " + order.company;
      var href = mailto(subject, orderText(order));
      try {
        sessionStorage.setItem(LAST, JSON.stringify({ order: order, mailto: href }));
      } catch (err) { /* ignore */ }
      var submit = document.getElementById("checkout-submit");
      if (submit) submit.disabled = true;
      openMailto(href);
      window.setTimeout(function () {
        window.location.href = page("checkout/confirmation/");
      }, 700);
    });
  }

  function bindConfirmation() {
    var root = document.getElementById("confirm-detail");
    if (!root) return;
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(LAST) || "null"); } catch (err) { saved = null; }
    if (!saved || !saved.order) {
      root.textContent = "If your email app did not open, write to " + CATALOG.email + " with the parts you need.";
      return;
    }
    writeCart([]);
    var order = saved.order;
    root.textContent = "";
    var list = el("ul");
    (order.items || []).forEach(function (item) {
      var product = CATALOG.byId[item.id];
      var bits = (product ? product.name : item.id) + " × " + item.qty;
      var opts = optionPairs(item.options);
      if (opts.length) bits += " — " + opts.join(", ");
      list.appendChild(el("li", { text: bits }));
    });
    var recap = el("div", { class: "recap" }, [
      el("h2", { text: "What you requested" }),
      el("p", { text: order.company + " · " + order.name + " · " + order.email }),
      list,
      el("p", { text: CATALOG.pricingLabel + ". No payment was taken." })
    ]);
    root.appendChild(recap);
    var again = document.getElementById("open-email-again");
    if (again && saved.mailto) again.href = saved.mailto;
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-cart-open]");
    if (!opener) return;
    event.preventDefault();
    if (drawer && !drawer.hidden) closeDrawer();
    else openDrawer();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var dialog = document.getElementById("fu-lightbox");
    if (dialog && dialog.open) return;
    if (drawer && !drawer.hidden) {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (window.fuCloseMenu) window.fuCloseMenu();
  });

  window.addEventListener("storage", function (event) {
    if (event.key === KEY) {
      memory = null;
      renderAll();
    }
  });

  ensureDrawer();
  bindMenu();
  bindProduct();
  bindGallery();
  bindCheckout();
  bindConfirmation();
  renderAll();
})();

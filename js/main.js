(() => {
  'use strict';

  /* ---------- mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  navToggle?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Sluit menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  /* ---------- search panel ---------- */
  const searchToggle = document.getElementById('searchToggle');
  const searchPanel = document.getElementById('searchPanel');
  const searchClose = document.getElementById('searchClose');
  const openSearch = () => {
    searchPanel.classList.add('is-open');
    searchToggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => searchPanel.querySelector('input')?.focus(), 150);
  };
  const closeSearch = () => {
    searchPanel.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
  };
  searchToggle?.addEventListener('click', () => {
    searchPanel.classList.contains('is-open') ? closeSearch() : openSearch();
  });
  searchClose?.addEventListener('click', closeSearch);

  /* ---------- product gallery ---------- */
  const mainImg = document.getElementById('mainProductImg');
  document.querySelectorAll('.product__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.product__thumb').forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = thumb.dataset.img;
        mainImg.style.opacity = '1';
      }, 140);
    });
  });

  /* ---------- nutrition tabs ---------- */
  document.querySelectorAll('.nutrition__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nutrition__tab').forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.nutrition__pane').forEach(p => {
        const active = p.dataset.pane === tab.dataset.tab;
        p.classList.toggle('is-active', active);
        p.hidden = !active;
      });
    });
  });

  /* ---------- faq accordion ---------- */
  document.querySelectorAll('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- shop filter pills (assortment) ---------- */
  const filterPills = document.querySelectorAll('.filter-pill');
  const assortGrid = document.getElementById('assortGrid');
  const assortCards = assortGrid ? assortGrid.querySelectorAll('.assort-card') : [];
  const assortCount = document.getElementById('assortCount');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const filter = pill.dataset.filter;
      assortGrid.classList.toggle('is-filtering', filter !== 'all');
      let shown = 0;
      assortCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-shown', match);
        if (match) shown++;
      });
      if (assortCount) assortCount.textContent = `${shown} product${shown === 1 ? '' : 'en'}`;
    });
  });

  /* ---------- cart drawer (mock) ---------- */
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOpenBtn = document.getElementById('cartOpen');
  const cartCloseBtn = document.getElementById('cartClose');
  const cartBody = document.getElementById('cartBody');
  const cartFoot = document.getElementById('cartFoot');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.getElementById('cartSubtotal');

  let cartQty = 0;
  let cartMoney = 0;

  const fmt = n => '€' + n.toFixed(2).replace('.', ',');

  const openCart = () => {
    cartOverlay.classList.add('is-open');
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    cartOverlay.classList.remove('is-open');
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopDodging();
  };

  cartOpenBtn?.addEventListener('click', openCart);
  cartCloseBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  const EMPTY_CART_HTML = `
    <div class="cart-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17M10 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <p>Je winkelwagen is nog leeg.</p>
      <button class="btn btn--ghost btn--sm" data-close-cart>Verder winkelen</button>
    </div>
  `;

  const ORDER_CONFIRM_HTML = `
    <div class="cart-empty cart-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.3" stroke="currentColor" stroke-width="1.4"/><path d="M8 12.4l2.6 2.6L16 9.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <p>Bestelling geplaatst ✓<br>Bedankt! Dit is een demo — er is niets echt besteld of betaald.</p>
      <button class="btn btn--ghost btn--sm" data-close-cart>Verder winkelen</button>
    </div>
  `;

  // mock cart holds a single line for the one product; unit price is the
  // average of whatever was added so the qty stepper can scale it cleanly
  let cartUnitPrice = 0;

  const renderCart = () => {
    if (cartQty <= 0) {
      cartBody.innerHTML = EMPTY_CART_HTML;
      cartFoot.hidden = true;
      cartCount.hidden = true;
      cartCount.textContent = '0';
      return;
    }
    cartBody.innerHTML = `
      <div class="cart-line">
        <img src="assets/product-jar.png" alt="">
        <div class="cart-line__info">
          <h4>Vegan Proteïne Poeder — Vanille</h4>
          <div class="cart-line__stepper" aria-label="Aantal aanpassen">
            <button type="button" class="cart-line__step" data-step="-1" aria-label="Verminder aantal">−</button>
            <span class="cart-line__qty" aria-live="polite">${cartQty}</span>
            <button type="button" class="cart-line__step" data-step="1" aria-label="Verhoog aantal">+</button>
          </div>
        </div>
        <div class="cart-line__right">
          <div class="cart-line__price">${fmt(cartMoney)}</div>
          <button type="button" class="cart-line__remove" aria-label="Verwijder product">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M6 4V2.6c0-.3.3-.6.6-.6h2.8c.3 0 .6.3.6.6V4m-6.5 0 .6 9c0 .5.5 1 1 1h4.8c.5 0 1-.5 1-1l.6-9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    `;
    cartFoot.hidden = false;
    cartSubtotal.textContent = fmt(cartMoney);
    cartCount.hidden = false;
    cartCount.textContent = String(cartQty);
  };

  // adds to the (mock) cart — qty = number of jars, lineTotal = price charged for this add
  const addToCart = (qty, lineTotal) => {
    cartQty += qty;
    cartMoney += lineTotal;
    cartUnitPrice = cartMoney / cartQty;
    renderCart();
    openCart();
  };

  // click delegation: the cart body is re-rendered on every change, so a
  // single listener on the (stable) container beats rebinding after each render
  cartBody?.addEventListener('click', e => {
    const step = e.target.closest('.cart-line__step');
    const remove = e.target.closest('.cart-line__remove');
    const close = e.target.closest('[data-close-cart]');
    if (step) {
      cartQty = Math.max(1, cartQty + parseInt(step.dataset.step, 10));
      cartMoney = Math.round(cartUnitPrice * cartQty * 100) / 100;
      renderCart();
    } else if (remove) {
      cartQty = 0;
      cartMoney = 0;
      cartUnitPrice = 0;
      renderCart();
    } else if (close) {
      closeCart();
    }
  });

  /* ---------- checkout (mock) ---------- */
  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', () => {
    if (cartQty <= 0) return;
    stopDodging();
    const original = checkoutBtn.textContent;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Bezig…';
    setTimeout(() => {
      cartQty = 0;
      cartMoney = 0;
      cartUnitPrice = 0;
      cartBody.innerHTML = ORDER_CONFIRM_HTML;
      cartFoot.hidden = true;
      cartCount.hidden = true;
      cartCount.textContent = '0';
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = original;
    }, 700);
  });

  /* ---------- checkout button dodges the cursor (easter egg) ---------- */
  const DODGE_RADIUS = 120; // px — button jumps once the cursor gets this close
  let dodging = false;

  const startDodging = () => {
    if (dodging || !checkoutBtn) return;
    dodging = true;
    const rect = checkoutBtn.getBoundingClientRect();
    checkoutBtn.style.width = rect.width + 'px';
    checkoutBtn.style.left = rect.left + 'px';
    checkoutBtn.style.top = rect.top + 'px';
    checkoutBtn.classList.add('is-dodging');
    document.body.appendChild(checkoutBtn);
  };

  function stopDodging() {
    if (!dodging || !checkoutBtn) return;
    dodging = false;
    checkoutBtn.classList.remove('is-dodging');
    checkoutBtn.style.left = '';
    checkoutBtn.style.top = '';
    checkoutBtn.style.width = '';
    cartFoot.insertBefore(checkoutBtn, cartFoot.querySelector('.cart-drawer__demo'));
  }

  // tries a handful of random spots and jumps to whichever lands furthest from the cursor
  const jumpAwayFrom = (x, y) => {
    const w = checkoutBtn.offsetWidth;
    const h = checkoutBtn.offsetHeight;
    const margin = 12;
    const maxLeft = Math.max(margin, window.innerWidth - w - margin);
    const maxTop = Math.max(margin, window.innerHeight - h - margin);
    let best = null, bestDist = -1;
    for (let i = 0; i < 12; i++) {
      const left = margin + Math.random() * (maxLeft - margin);
      const top = margin + Math.random() * (maxTop - margin);
      const dist = Math.hypot(left + w / 2 - x, top + h / 2 - y);
      if (dist > bestDist) { bestDist = dist; best = { left, top }; }
    }
    checkoutBtn.style.left = best.left + 'px';
    checkoutBtn.style.top = best.top + 'px';
  };

  document.addEventListener('mousemove', e => {
    if (!checkoutBtn || checkoutBtn.disabled || cartQty <= 0 || !cartDrawer.classList.contains('is-open')) {
      if (dodging) stopDodging();
      return;
    }
    const rect = checkoutBtn.getBoundingClientRect();
    const dist = Math.hypot(rect.left + rect.width / 2 - e.clientX, rect.top + rect.height / 2 - e.clientY);
    if (dist < DODGE_RADIUS) {
      if (!dodging) startDodging();
      jumpAwayFrom(e.clientX, e.clientY);
    }
  });

  /* ---------- bundle pricing (product section) ---------- */
  const bundleOpts = document.querySelectorAll('.bundle-opt');
  const addToCartPrice = document.getElementById('addToCartPrice');
  const stickyBuyPrice = document.getElementById('stickyBuyPrice');

  const getBundleState = () => {
    const active = document.querySelector('.bundle-opt.is-active') || bundleOpts[0];
    const qty = parseInt(active.dataset.qty, 10);
    const unit = parseFloat(active.dataset.unit);
    const total = Math.round(unit * qty * 100) / 100;
    return { qty, total };
  };

  const refreshBundlePrice = () => {
    const { total } = getBundleState();
    if (addToCartPrice) addToCartPrice.textContent = fmt(total);
    if (stickyBuyPrice) stickyBuyPrice.textContent = fmt(total);
  };

  bundleOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      bundleOpts.forEach(o => { o.classList.remove('is-active'); o.setAttribute('aria-checked', 'false'); });
      opt.classList.add('is-active');
      opt.setAttribute('aria-checked', 'true');
      refreshBundlePrice();
    });
  });
  refreshBundlePrice();

  document.getElementById('addToCart')?.addEventListener('click', () => {
    const { qty, total } = getBundleState();
    addToCart(qty, total);
  });
  document.getElementById('stickyAddToCart')?.addEventListener('click', () => {
    const { qty, total } = getBundleState();
    addToCart(qty, total);
  });
  document.getElementById('heroAddToCart')?.addEventListener('click', () => {
    addToCart(1, 39.95);
  });

  /* ---------- sticky add-to-cart bar ---------- */
  const stickyBuy = document.getElementById('stickyBuy');
  const buyRow = document.querySelector('.product__buy-row');
  const siteFooter = document.querySelector('.site-footer');
  let pastBuyRow = false;
  let footerVisible = false;

  const syncStickyBuy = () => {
    const shouldShow = pastBuyRow && !footerVisible;
    stickyBuy?.classList.toggle('is-visible', shouldShow);
    stickyBuy?.setAttribute('aria-hidden', String(!shouldShow));
  };

  if ('IntersectionObserver' in window && buyRow) {
    new IntersectionObserver(([entry]) => {
      pastBuyRow = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
      syncStickyBuy();
    }, { threshold: 0 }).observe(buyRow);
  }
  if ('IntersectionObserver' in window && siteFooter) {
    new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      syncStickyBuy();
    }, { threshold: 0 }).observe(siteFooter);
  }

  /* ---------- newsletter (mock submit) ---------- */
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input');
    const btn = form.querySelector('button');
    const original = btn.textContent;
    btn.textContent = 'Aangemeld ✓';
    input.value = '';
    setTimeout(() => { btn.textContent = original; }, 2600);
  });

  /* ---------- header shadow on scroll ---------- */
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8 ? 'var(--shadow-sm)' : 'none';
  }, { passive: true });

  /* ---------- scroll reveal (small elements only — never gate primary content) ---------- */
  const revealTargets = document.querySelectorAll('.usp__item, .recipe-card, .review-card');
  revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

  const revealAll = () => revealTargets.forEach(el => el.classList.add('is-visible'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealAll();
  }

  // safety net: guarantee everything is visible even if IO never fires
  // (e.g. programmatic scroll, print/export, unusual viewport handling)
  setTimeout(revealAll, 1500);
})();

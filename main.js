document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initGSAP();
    loadProducts();
    initCart();
    initWishlist();
    initProfileDrawer();
    initProductDetailFlow();
    initCheckout();
    setupNavigation();
    initLocalization();
    initReviewSystem();
});

let currentCurrency = 'INR';
const exchangeRates = { INR: 1.0, USD: 0.012, EUR: 0.011 };
const currencySymbols = { INR: '₹', USD: '$', EUR: '€' };
const currencyThemeColors = {
    INR: '#F9F7F2', 
    USD: '#F0F0F0', 
    EUR: '#F2F4F7'  
};

let cart = [];
let wishlist = [];
let selectedSize = null;
let currentProduct = null;
let currentRating = 0;

const userData = {
    name: "Aria Chen",
    email: "aria.chen@studio.com",
    locations: [
        { id: 1, type: "Principal Residence", city: "South Mumbai", state: "Maharashtra", pin: "400001" },
        { id: 2, type: "Summer Studio", city: "New Delhi", state: "Delhi", pin: "110001" }
    ]
};

function formatPrice(amount) {
    const converted = amount * exchangeRates[currentCurrency];
    const symbol = currencySymbols[currentCurrency];
    return currentCurrency === 'INR' 
        ? `${symbol}${Math.round(converted).toLocaleString('en-IN')}`
        : `${symbol}${converted.toFixed(2)}`;
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();
    tl.to('#hero-sub', { opacity: 1, y: 0, duration: 1, delay: 0.5 })
      .to('#hero-title', { opacity: 1, y: 0, duration: 1.2 }, "-=0.5")
      .to('.hero-btn-container', { opacity: 1, y: 0, duration: 1 }, "-=0.8");
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const container = document.getElementById('product-grid');
        
        container.innerHTML = products.map(product => `
            <div class="product-card group relative reveal-up" onclick="navigateToProduct('${product.id}')">
                <div class="relative aspect-[3/4] overflow-hidden bg-white shadow-sm cursor-pointer">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                    <img src="${product.hoverImage}" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                </div>
                <div class="mt-6 flex justify-between items-start">
                    <div>
                        <h4 class="text-xs uppercase tracking-[0.15em] font-medium">${product.name}</h4>
                        <p class="text-[9px] text-phigai-charcoal/40 mt-1 uppercase">${product.category}</p>
                    </div>
                    <span class="font-serif italic text-lg">${formatPrice(product.price)}</span>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    } catch (err) { console.error("Load fail", err); }
}

function initProductDetailFlow() {
    const landing = document.getElementById('landing-view');
    const pdView = document.getElementById('product-detail-view');
    const backBtn = document.getElementById('back-to-collection');
    const pdSizeBtns = document.querySelectorAll('.pd-size-btn');
    const sizeError = document.getElementById('pd-size-error');

    window.navigateToProduct = async (id) => {
        const res = await fetch('products.json');
        const prods = await res.json();
        const p = prods.find(x => x.id === id);
        if (!p) return;

        currentProduct = p;
        selectedSize = null;

        document.getElementById('pd-name').textContent = p.name;
        document.getElementById('pd-cat').textContent = p.category;
        document.getElementById('pd-price').textContent = formatPrice(p.price);
        document.getElementById('pd-desc').textContent = p.description;

        const gallery = document.getElementById('pd-gallery');
        const shots = [p.image, p.hoverImage, p.image, p.hoverImage];
        gallery.innerHTML = shots.map(img => `<img src="${img}" class="w-full aspect-[3/4] object-cover bg-white opacity-0 reveal-img">`).join('');
        
        renderReviews();
        updateWishBtnUI();

        pdSizeBtns.forEach(btn => btn.classList.remove('active'));
        sizeError.style.opacity = '0';

        window.scrollTo(0, 0);
        landing.classList.add('opacity-0');
        setTimeout(() => {
            landing.style.display = 'none';
            pdView.style.display = 'block';
            pdView.scrollTop = 0;
            setTimeout(() => {
                pdView.classList.remove('hidden');
                pdView.classList.add('opacity-100');
                lucide.createIcons();
                gsap.to('.reveal-img', { opacity: 1, duration: 1, stagger: 0.2 });
            }, 50);
        }, 700);
    };

    backBtn.onclick = () => {
        pdView.classList.add('opacity-0');
        setTimeout(() => {
            pdView.style.display = 'none';
            landing.style.display = 'block';
            setTimeout(() => landing.classList.remove('opacity-0'), 50);
        }, 700);
    };

    pdSizeBtns.forEach(btn => {
        btn.onclick = () => {
            pdSizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
            sizeError.style.opacity = '0';
        };
    });

    document.getElementById('pd-add-btn').onclick = () => {
        if (!selectedSize) {
            sizeError.style.opacity = '1';
            return;
        }
        addToCart(currentProduct.id, selectedSize);
    };
}

function renderReviews() {
    if (!currentProduct) return;
    const reviewsContainer = document.getElementById('pd-reviews');
    reviewsContainer.innerHTML = currentProduct.reviews.map(r => `
        <div class="space-y-4 reveal-up">
            <div class="flex gap-1">
                ${Array(5).fill().map((_, i) => `<i data-lucide="star" class="w-2 h-2 ${i < r.rating ? 'fill-phigai-beige text-phigai-beige' : 'text-phigai-charcoal/10'}"></i>`).join('')}
            </div>
            <p class="font-serif italic text-lg text-phigai-charcoal/80">"${r.text}"</p>
            <p class="text-[9px] uppercase tracking-widest opacity-40">— ${r.user}</p>
        </div>
    `).join('');
    lucide.createIcons();
}

function initReviewSystem() {
    const modal = document.getElementById('review-modal');
    const openBtn = document.getElementById('open-review-modal');
    const closeBtn = document.getElementById('close-review-modal');
    const overlay = document.getElementById('review-overlay');
    const starBtns = document.querySelectorAll('.star-btn');
    const submitBtn = document.getElementById('submit-review-btn');
    const textarea = document.getElementById('community-comment');

    const toggleModal = (show) => {
        modal.classList.toggle('opacity-100', show);
        modal.classList.toggle('pointer-events-auto', show);
        if (!show) {
            currentRating = 0;
            textarea.value = '';
            updateStarUI();
        }
    };

    if(openBtn) openBtn.onclick = () => toggleModal(true);
    if(closeBtn) closeBtn.onclick = () => toggleModal(false);
    if(overlay) overlay.onclick = () => toggleModal(false);

    starBtns.forEach(btn => {
        btn.onclick = () => {
            currentRating = parseInt(btn.dataset.val);
            updateStarUI();
        };
    });

    const updateStarUI = () => {
        starBtns.forEach((btn, i) => {
            if (i < currentRating) {
                btn.classList.add('fill-phigai-beige', 'text-phigai-beige');
            } else {
                btn.classList.remove('fill-phigai-beige', 'text-phigai-beige');
            }
        });
    };

    if(submitBtn) {
        submitBtn.onclick = () => {
            if (currentRating === 0 || !textarea.value.trim()) {
                alert("Please provide both a rating and a comment.");
                return;
            }
            
            currentProduct.reviews.unshift({
                user: "Guest User",
                rating: currentRating,
                text: textarea.value.trim()
            });

            renderReviews();
            toggleModal(false);
        };
    }
}

function initProfileDrawer() {
    const drawer = document.getElementById('profile-drawer');
    const panel = document.getElementById('profile-panel');
    const overlay = document.getElementById('profile-overlay');
    const toggleBtn = document.querySelector('.profile-toggle');
    const closeBtn = document.getElementById('profile-close');

    const toggleProfile = (open) => {
        drawer.classList.toggle('pointer-events-none', !open);
        overlay.classList.toggle('opacity-100', open);
        panel.classList.toggle('translate-x-full', !open);
        if (open) renderLocations();
    };

    toggleBtn.onclick = () => toggleProfile(true);
    closeBtn.onclick = () => toggleProfile(false);
    overlay.onclick = () => toggleProfile(false);

    window.renderLocations = () => {
        const container = document.getElementById('delivery-locations');
        container.innerHTML = userData.locations.map(loc => `
            <div class="location-card p-5 border border-phigai-charcoal/5 bg-transparent hover:border-phigai-beige transition-all">
                <span class="text-[8px] uppercase tracking-widest font-bold">${loc.type}</span>
                <p class="text-[11px] mt-3 leading-relaxed opacity-60">${loc.city}, ${loc.state} — ${loc.pin}</p>
                <div class="mt-4 flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
                    <button class="text-[8px] uppercase tracking-widest border-b border-phigai-charcoal">Edit</button>
                    <button class="text-[8px] uppercase tracking-widest border-b border-phigai-charcoal">Remove</button>
                </div>
            </div>
        `).join('');
    };
}

function initCart() {
    const drawer = document.getElementById('cart-drawer');
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    const toggleCart = (open) => {
        drawer.classList.toggle('pointer-events-none', !open);
        overlay.classList.toggle('opacity-100', open);
        panel.classList.toggle('translate-x-full', !open);
    };
    document.querySelector('.cart-toggle').onclick = () => toggleCart(true);
    document.getElementById('cart-close').onclick = () => toggleCart(false);
    overlay.onclick = () => toggleCart(false);

    window.addToCart = async (id, size) => {
        const res = await fetch('products.json');
        const prods = await res.json();
        const p = prods.find(x => x.id === id);
        if (p) {
            cart.push({...p, selectedSize: size, cartId: Date.now()});
            updateCartUI();
            toggleCart(true);
        }
    };
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    count.textContent = cart.length;
    count.style.opacity = cart.length > 0 ? 1 : 0;
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="h-full flex flex-col items-center justify-center opacity-40"><p class="text-[10px] uppercase">Bag is empty</p></div>`;
        document.getElementById('cart-total').textContent = formatPrice(0);
        return;
    }
    container.innerHTML = cart.map((item, i) => `
        <div class="flex gap-6 pb-6 border-b border-phigai-charcoal/5">
            <div class="w-20 h-24 bg-white"><img src="${item.image}" class="w-full h-full object-cover"></div>
            <div class="flex-grow">
                <div class="flex justify-between">
                    <h5 class="text-[10px] uppercase tracking-widest">${item.name}</h5>
                    <button onclick="removeFromCart(${i})"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
                <p class="text-[9px] opacity-40 mt-1 uppercase">${item.selectedSize}</p>
                <p class="font-serif italic mt-4">${formatPrice(item.price)}</p>
            </div>
        </div>
    `).join('');
    const sum = cart.reduce((a, b) => a + b.price, 0);
    document.getElementById('cart-total').textContent = formatPrice(sum);
    lucide.createIcons();
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateCartUI(); };

function initWishlist() {
    const drawer = document.getElementById('wishlist-drawer');
    const panel = document.getElementById('wishlist-panel');
    const overlay = document.getElementById('wishlist-overlay');
    const pdWishBtn = document.getElementById('pd-wish-btn');
    const wishlistToggle = document.querySelector('.wishlist-toggle');

    const toggleWishlist = (open) => {
        drawer.classList.toggle('pointer-events-none', !open);
        overlay.classList.toggle('opacity-100', open);
        panel.classList.toggle('translate-x-full', !open);
        if (open) renderWishlistItems();
    };

    if(wishlistToggle) wishlistToggle.onclick = () => toggleWishlist(true);
    if(document.getElementById('wishlist-close')) document.getElementById('wishlist-close').onclick = () => toggleWishlist(false);
    if(overlay) overlay.onclick = () => toggleWishlist(false);

    if(pdWishBtn) {
        pdWishBtn.onclick = () => {
            if (!currentProduct) return;
            const id = currentProduct.id;
            const idx = wishlist.findIndex(item => item.id === id);
            if (idx === -1) {
                wishlist.push(currentProduct);
            } else {
                wishlist.splice(idx, 1);
            }
            updateWishBtnUI();
            updateWishlistCount();
        };
    }

    window.removeFromWishlist = (id) => {
        wishlist = wishlist.filter(item => item.id !== id);
        renderWishlistItems();
        updateWishlistCount();
        updateWishBtnUI();
    };
}

async function renderWishlistItems() {
    const container = document.getElementById('wishlist-items');
    if (wishlist.length === 0) {
        container.innerHTML = `<div class="h-full flex flex-col items-center justify-center opacity-40"><p class="text-[10px] uppercase">Wishlist is empty</p></div>`;
        return;
    }
    container.innerHTML = wishlist.map((item) => `
        <div class="flex gap-6 pb-6 border-b border-phigai-charcoal/5">
            <div class="w-20 h-24 bg-white cursor-pointer" onclick="navigateToProduct('${item.id}'); document.getElementById('wishlist-close').click();"><img src="${item.image}" class="w-full h-full object-cover"></div>
            <div class="flex-grow">
                <div class="flex justify-between">
                    <h5 class="text-[10px] uppercase tracking-widest cursor-pointer" onclick="navigateToProduct('${item.id}'); document.getElementById('wishlist-close').click();">${item.name}</h5>
                    <button onclick="removeFromWishlist('${item.id}')"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
                <p class="font-serif italic mt-4">${formatPrice(item.price)}</p>
                <button onclick="navigateToProduct('${item.id}'); document.getElementById('wishlist-close').click();" class="mt-2 text-[8px] uppercase tracking-widest border-b border-phigai-charcoal pb-1 opacity-60 hover:opacity-100">View Product</button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function updateWishBtnUI() {
    const pdWishBtn = document.getElementById('pd-wish-btn');
    const isLiked = currentProduct && wishlist.some(item => item.id === currentProduct.id);
    const icon = pdWishBtn ? pdWishBtn.querySelector('.wish-icon') : null;
    
    if (icon) {
        if (isLiked) {
            icon.classList.add('liked');
            pdWishBtn.classList.add('border-phigai-red/20');
        } else {
            icon.classList.remove('liked');
            pdWishBtn.classList.remove('border-phigai-red/20');
        }
    }

    const navIcon = document.querySelector('.wish-icon-nav');
    if (navIcon) {
        if (wishlist.length > 0) navIcon.classList.add('liked');
        else navIcon.classList.remove('liked');
    }
}

function updateWishlistCount() {
    const count = document.getElementById('wishlist-count');
    count.textContent = wishlist.length;
    count.style.opacity = wishlist.length > 0 ? 1 : 0;
}

function initCheckout() {
    const modal = document.getElementById('checkout-modal');
    const trigger = document.getElementById('checkout-trigger');
    const closeBtn = document.getElementById('checkout-close');
    const purchaseBtn = document.getElementById('final-purchase-btn');

    if (trigger) {
        trigger.onclick = () => {
            if (!cart.length) return;
            const closeCart = document.getElementById('cart-close');
            if (closeCart) closeCart.click();
            modal.classList.remove('opacity-0', 'pointer-events-none');
            
            const container = document.getElementById('checkout-locations');
            container.innerHTML = userData.locations.map(loc => `
                <div class="location-card p-5 border border-phigai-charcoal/10 cursor-pointer hover:border-phigai-charcoal transition-all">
                    <span class="text-[8px] uppercase tracking-widest font-bold">${loc.type}</span>
                    <p class="text-[10px] mt-2 opacity-60">${loc.city}, ${loc.state}</p>
                </div>
            `).join('');
        };
    }
    
    if (closeBtn) closeBtn.onclick = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        nextStep(1);
    };
    
    if (purchaseBtn) {
        purchaseBtn.onclick = () => {
            alert("Phigai Order Simulation Complete.");
            location.reload();
        };
    }

    window.nextStep = (step) => {
        document.querySelectorAll('.checkout-step').forEach(s => s.classList.add('hidden'));
        const next = document.getElementById(`step-content-${step}`);
        if (next) next.classList.remove('hidden');
    };
}

function initLocalization() {
    const select = document.getElementById('currency-select');
    if (select) {
        select.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            document.body.style.backgroundColor = currencyThemeColors[currentCurrency];
            loadProducts();
            updateCartUI();
            if (currentProduct) {
                document.getElementById('pd-price').textContent = formatPrice(currentProduct.price);
            }
        });
    }
}

function setupNavigation() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
}

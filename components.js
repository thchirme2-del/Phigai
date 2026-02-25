import { products, addToCart, cart, closeCart } from './store.js';

function renderProductGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card group cursor-pointer reveal-section" data-id="${product.id}">
            <div class="product-card-image-wrapper aspect-[3/4] bg-white mb-8 overflow-hidden">
                <img src="${product.image}" class="product-card-image w-full h-full object-cover" alt="${product.name}">
                <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-4">
                    <button class="bg-white px-8 py-4 text-[9px] uppercase tracking-[0.3em] translate-y-8 group-hover:translate-y-0 transition-all duration-700 shadow-sm hover:bg-black hover:text-white quick-view-trigger" data-id="${product.id}">
                        Quick View
                    </button>
                </div>
            </div>
            <div class="flex justify-between items-start">
                <div class="space-y-1">
                    <h3 class="text-lg font-serif italic tracking-tight group-hover:pl-2 transition-all duration-500">${product.name}</h3>
                    <p class="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-medium">${product.color}</p>
                </div>
                <span class="text-[10px] font-medium tracking-widest text-gray-500">$${product.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('');


    document.querySelectorAll('.quick-view-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openQuickView(btn.getAttribute('data-id'));
        });
    });
}

function openQuickView(id) {
    const product = products.find(p => p.id === id);
    const modal = document.getElementById('quick-view');
    const container = document.getElementById('qv-container');

    container.innerHTML = `
        <button id="qv-close" class="absolute top-6 right-6 z-10 hover:rotate-90 transition-transform">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
        <div class="w-full md:w-1/2 h-64 md:h-full bg-white overflow-hidden">
            <img src="${product.image}" class="w-full h-full object-cover animate-fade-in" alt="${product.name}">
        </div>
        <div class="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-8">
            <div class="space-y-2">
                <span class="text-[9px] uppercase tracking-[0.4em] text-gray-400">Available Archive</span>
                <h2 class="text-4xl font-serif italic">${product.name}</h2>
                <p class="text-lg font-medium tracking-widest">$${product.price.toFixed(2)}</p>
            </div>
            <p class="text-xs leading-relaxed text-gray-500 uppercase tracking-widest">
                ${product.details}
            </p>
            <div class="space-y-4">
                <span class="text-[9px] uppercase tracking-[0.2em] font-bold">Select Size</span>
                <div class="flex flex-wrap gap-3">
                    ${product.sizes.map(s => `
                        <button class="size-btn px-6 py-2 text-[10px] uppercase tracking-widest hover:border-black transition-all" data-size="${s}">${s}</button>
                    `).join('')}
                </div>
            </div>
            <button id="qv-add-to-bag" class="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#D9D2C5] hover:text-black transition-all">
                Add to Bag
            </button>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('invisible', 'opacity-0');
    container.classList.remove('scale-95');
    container.classList.add('scale-100');


    let selectedSize = product.sizes[0];
    const sizeBtns = container.querySelectorAll('.size-btn');
    sizeBtns[0].classList.add('active');

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.getAttribute('data-size');
        });
    });

    document.getElementById('qv-add-to-bag').addEventListener('click', () => {
        addToCart(id, selectedSize);
        closeQuickView();
    });

    document.getElementById('qv-close').addEventListener('click', closeQuickView);
}

function closeQuickView() {
    const modal = document.getElementById('quick-view');
    const container = document.getElementById('qv-container');
    container.classList.remove('scale-100');
    container.classList.add('scale-95');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('invisible'), 500);
}

function setupCartToggle() {
    const trigger = document.getElementById('cart-trigger');
    const close = document.getElementById('cart-close');
    const overlay = document.getElementById('cart-overlay');
    const checkoutTrigger = document.getElementById('checkout-btn');

    trigger.addEventListener('click', () => {
        document.getElementById('cart-sidebar').classList.remove('translate-x-full', 'invisible');
    });

    [close, overlay].forEach(el => el.addEventListener('click', closeCart));

    checkoutTrigger.addEventListener('click', () => {
        closeCart();
        openCheckoutMockup();
    });
}

function openCheckoutMockup() {
    const checkout = document.getElementById('checkout-mockup');
    const summaryItems = document.getElementById('checkout-summary-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    summaryItems.innerHTML = cart.map(item => `
        <div class="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.innerText = `$${total.toFixed(2)}`;

    checkout.classList.remove('hidden');
    setTimeout(() => checkout.classList.add('opacity-100'), 50);

    document.getElementById('close-checkout').onclick = () => {
        checkout.classList.remove('opacity-100');
        setTimeout(() => checkout.classList.add('hidden'), 700);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    renderProductGrid();
    setupCartToggle();
    

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuickView();
            closeCart();
        }
    });
});

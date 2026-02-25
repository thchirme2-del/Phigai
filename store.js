export const products = [
    {
        id: 'p1',
        name: 'Aeon Heavy Hoodie',
        price: 165.00,
        color: 'Cloud Cream',
        image: 'https://r2-bucket.flowith.net/f/777e4a4ce863daad/phigai_luxury_fabric_detail_lookbook_index_3%402048x2048.jpeg',
        details: '500GSM Heavy-weight organic cotton. Boxy silhouette with dropped shoulders and hidden seams.',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 'p2',
        name: 'Linear Pleated Trouser',
        price: 210.00,
        color: 'Charcoal Matte',
        image: 'https://r2-bucket.flowith.net/f/348e23c50681a89a/phigai_collection_street_style_fashion_index_2%402400x1792.jpeg',
        details: 'High-waisted, wide-leg wool blend. Permanent military-grade crease for architectural movement.',
        sizes: ['28', '30', '32', '34']
    },
    {
        id: 'p3',
        name: 'Drift Silk-Blend Tee',
        price: 85.00,
        color: 'Oatmeal Beige',
        image: 'https://r2-bucket.flowith.net/f/a12c522a1e51ee62/phigai_editorial_fashion_shot_index_1%402400x1792.jpeg',
        details: 'A delicate 70/30 cotton-silk blend. Raw edge finishing for a weathered, luxury feel.',
        sizes: ['XS', 'S', 'M', 'L']
    },
    {
        id: 'p4',
        name: 'Structure Overcoat',
        price: 450.00,
        color: 'Obsidian Charcoal',
        image: 'https://r2-bucket.flowith.net/f/ef50edb275540f58/phigai_minimalist_fashion_hero_index_0%404096x2286.jpeg',
        details: 'Double-breasted recycled cashmere blend. Fully lined with hand-finished interior pockets.',
        sizes: ['OS']
    },
    {
        id: 'p5',
        name: 'Echo Cashmere Beanie',
        price: 75.00,
        color: 'Deep Charcoal',
        image: 'https://r2-bucket.flowith.net/f/777e4a4ce863daad/phigai_luxury_fabric_detail_lookbook_index_3%402048x2048.jpeg',
        details: '100% Sustainable Cashmere. Ribbed texture with subtle tonal Φ embroidery.',
        sizes: ['OS']
    },
    {
        id: 'p6',
        name: 'Modular Canvas Tote',
        price: 120.00,
        color: 'Off-White',
        image: 'https://r2-bucket.flowith.net/f/348e23c50681a89a/phigai_collection_street_style_fashion_index_2%402400x1792.jpeg',
        details: 'Structured heavy canvas with full-grain leather trim. Magnetic security closures.',
        sizes: ['OS']
    }
];

export let cart = [];

export const addToCart = (productId, size = 'M') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId && item.selectedSize === size);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, selectedSize: size, quantity: 1 });
    }
    
    updateCartUI();
    openCart();
};

export const updateQuantity = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

export const removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

export function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.innerText = count;
    cartCount.style.opacity = count > 0 ? '1' : '0';

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-center text-[10px] uppercase tracking-[0.3em] text-gray-400 py-32 opacity-50 italic">Your bag is currently empty.</p>`;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="flex space-x-6 pb-8 border-b border-gray-100 group animate-fade-in">
                <div class="w-24 h-32 flex-shrink-0 bg-gray-50">
                    <img src="${item.image}" class="w-full h-full object-cover" alt="${item.name}">
                </div>
                <div class="flex-grow flex flex-col justify-between py-1">
                    <div class="space-y-1">
                        <div class="flex justify-between items-start">
                            <h4 class="text-sm font-serif italic">${item.name}</h4>
                            <button onclick="window.removeCartItem(${index})" class="text-gray-300 hover:text-black transition-colors">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <p class="text-[9px] text-gray-400 uppercase tracking-widest">${item.color} / Size ${item.selectedSize}</p>
                    </div>
                    <div class="flex justify-between items-end">
                        <div class="flex items-center quantity-control bg-gray-50 rounded-sm">
                            <button onclick="window.updateCartQuantity(${index}, -1)" class="p-1">-</button>
                            <span class="px-3 text-[9px] font-medium">${item.quantity}</span>
                            <button onclick="window.updateCartQuantity(${index}, 1)" class="p-1">+</button>
                        </div>
                        <p class="text-[10px] font-medium tracking-wider">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = `$${total.toFixed(2)}`;
}

export function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.remove('translate-x-full', 'invisible');
}

export function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.add('translate-x-full');
    setTimeout(() => sidebar.classList.add('invisible'), 500);
}


window.removeCartItem = removeFromCart;
window.updateCartQuantity = updateQuantity;

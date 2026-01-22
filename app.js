// Cart and Billing Operations

const CART_STORAGE_KEY = 'cart';
const ORDERS_STORAGE_KEY = 'orders';

let cart = [];
let orderCounter = parseInt(localStorage.getItem('orderCounter')) || 1;

// Initialize cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartDisplay();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartDisplay();
}

// Add item to cart
function addToCart(itemId) {
    const menuItem = getMenuItemById(itemId);
    if (!menuItem) return;

    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image,
            quantity: 1
        });
    }
    
    saveCart();
    showCartNotification();
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
        }
    }
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        saveCart();
    }
}

// Calculate totals
function calculateTotals() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return { total };
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const totalEl = document.getElementById('total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update cart items
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=${encodeURIComponent(item.name)}'">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="item-price">₹${Math.round(item.price)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update totals
    const { total } = calculateTotals();
    if (totalEl) totalEl.textContent = `₹${Math.round(total)}`;
}

// Display menu items
function displayMenu() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    
    const menuItems = getMenuItems();
    
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No menu items available. Please add items in Manage Menu.</p>';
        return;
    }
    
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item-card" onclick="addToCart('${item.id}')">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/250x200?text=${encodeURIComponent(item.name)}'">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="price">₹${Math.round(item.price)}</p>
                <button class="add-btn">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Show cart notification
function showCartNotification() {
    const cartToggle = document.getElementById('cartToggle');
    if (cartToggle) {
        cartToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cartToggle.style.transform = 'scale(1)';
        }, 200);
    }
}

// Toggle cart visibility
function toggleCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.classList.toggle('open');
    }
}

// Close cart
function closeCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.classList.remove('open');
    }
}

// Generate QR Code for payment
function generateQRCode() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const { total } = calculateTotals();
    const orderNumber = `ORD-${String(orderCounter).padStart(3, '0')}`;
    const dateTime = new Date().toLocaleString();
    
    // Create QR code content
    const qrContent = `Order #${orderNumber}\nTotal: ₹${Math.round(total)}\nDate: ${dateTime}`;
    
    // Display modal
    const modal = document.getElementById('qrModal');
    const qrCodeDiv = document.getElementById('qrCode');
    const qrInfo = document.getElementById('qrInfo');
    
    if (modal && qrCodeDiv && qrInfo) {
        // Clear previous QR code
        qrCodeDiv.innerHTML = '';
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        qrCodeDiv.appendChild(canvas);
        
        // Generate new QR code
        QRCode.toCanvas(canvas, qrContent, {
            width: 300,
            margin: 2,
            color: {
                dark: '#667eea',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) {
                console.error('QR Code generation error:', error);
                qrCodeDiv.innerHTML = '<p style="color: red;">Error generating QR code</p>';
            }
        });
        
        qrInfo.textContent = qrContent.replace(/\n/g, ' | ');
        modal.style.display = 'block';
    }
}

// Close QR modal
function closeQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save order to localStorage
function saveOrder() {
    if (cart.length === 0) return;
    
    const { total } = calculateTotals();
    const orderNumber = `ORD-${String(orderCounter).padStart(3, '0')}`;
    const dateTime = new Date().toISOString();
    
    const order = {
        orderNumber: orderNumber,
        dateTime: dateTime,
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total
    };
    
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    
    // Increment order counter
    orderCounter++;
    localStorage.setItem('orderCounter', orderCounter.toString());
    
    return order;
}

// Print bill
function printBill() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const { total } = calculateTotals();
    const orderNumber = `ORD-${String(orderCounter).padStart(3, '0')}`;
    const dateTime = new Date().toLocaleString();
    
    // Save order before printing
    saveOrder();
    
    // Populate print section
    const printSection = document.getElementById('billPrint');
    const printOrderNumber = document.getElementById('printOrderNumber');
    const printDateTime = document.getElementById('printDateTime');
    const printItems = document.getElementById('printItems');
    const printTotal = document.getElementById('printTotal');
    
    if (printOrderNumber) printOrderNumber.textContent = orderNumber;
    if (printDateTime) printDateTime.textContent = dateTime;
    
    if (printItems) {
        printItems.innerHTML = cart.map(item => `
            <div class="bill-item">
                <div>
                    <strong>${item.name}</strong> x${item.quantity}
                </div>
                <div>₹${Math.round(item.price * item.quantity)}</div>
            </div>
        `).join('');
    }
    
    if (printTotal) printTotal.textContent = `₹${Math.round(total)}`;
    
    // Show print section and print
    if (printSection) {
        printSection.style.display = 'block';
        window.print();
        printSection.style.display = 'none';
    }
    
    // Clear cart after printing
    cart = [];
    saveCart();
}

// Pay Now - generates QR and saves order
function payNow() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Save order
    saveOrder();
    
    // Generate QR code
    generateQRCode();
    
    // Clear cart after payment
    cart = [];
    saveCart();
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if on main page
    if (document.getElementById('menu-grid')) {
        loadCart();
        displayMenu();
        
        // Cart toggle button
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', toggleCart);
        }
        
        // Close cart button
        const closeCartBtn = document.getElementById('closeCart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', closeCart);
        }
        
        // Pay Now button
        const payNowBtn = document.getElementById('payNowBtn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', payNow);
        }
        
        // Print Bill button
        const printBillBtn = document.getElementById('printBillBtn');
        if (printBillBtn) {
            printBillBtn.addEventListener('click', printBill);
        }
        
        // Clear Cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        // Close modal when clicking outside
        const qrModal = document.getElementById('qrModal');
        if (qrModal) {
            qrModal.addEventListener('click', function(e) {
                if (e.target === qrModal) {
                    closeQRModal();
                }
            });
        }
        
        // Close modal button
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeQRModal);
        }
    }
});

// Make functions globally available
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.generateQRCode = generateQRCode;
window.closeQRModal = closeQRModal;
window.printBill = printBill;
window.payNow = payNow;
window.displayMenu = displayMenu;

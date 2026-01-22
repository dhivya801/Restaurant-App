// Menu CRUD Operations

const MENU_STORAGE_KEY = 'menuItems';

// Initialize default menu items if localStorage is empty
function initializeDefaultMenu() {
    const existingMenu = getMenuItems();
    if (existingMenu.length === 0) {
        const defaultMenu = [
            {
                id: generateId(),
                name: 'Truffle Rice',
                price: 399,
                image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Avo Toast',
                price: 220,
                image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Fire Chicken',
                price: 360,
                image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Pesto Pasta',
                price: 320,
                image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Mini Margherita',
                price: 180,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Paneer Grill',
                price: 310,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Bett Bliss',
                price: 240,
                image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Cheesy Fries',
                price: 150,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Teriyakki Bowl',
                price: 340,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
            },
            {
                id: generateId(),
                name: 'Choco Lava',
                price: 190,
                image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop'
            }
        ];
        saveMenuItems(defaultMenu);
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get all menu items
function getMenuItems() {
    const items = localStorage.getItem(MENU_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
}

// Save menu items to localStorage
function saveMenuItems(items) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
}

// Add new menu item
function addMenuItem(name, price, image) {
    const items = getMenuItems();
    const newItem = {
        id: generateId(),
        name: name,
        price: parseFloat(price),
        image: image
    };
    items.push(newItem);
    saveMenuItems(items);
    
    // Reload menu display if on main page
    if (typeof displayMenu === 'function') {
        displayMenu();
    }
    
    // Reload menu items list if on manage page
    if (typeof loadMenuItems === 'function') {
        loadMenuItems();
    }
    
    return newItem;
}

// Update menu item
function updateMenuItem(id, name, price, image) {
    const items = getMenuItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
        items[index] = {
            id: id,
            name: name,
            price: parseFloat(price),
            image: image
        };
        saveMenuItems(items);
        
        // Reload menu display if on main page
        if (typeof displayMenu === 'function') {
            displayMenu();
        }
        
        // Reload menu items list if on manage page
        if (typeof loadMenuItems === 'function') {
            loadMenuItems();
        }
        
        return items[index];
    }
    return null;
}

// Remove menu item
function removeMenuItem(id) {
    const items = getMenuItems();
    const filteredItems = items.filter(item => item.id !== id);
    saveMenuItems(filteredItems);
    
    // Reload menu display if on main page
    if (typeof displayMenu === 'function') {
        displayMenu();
    }
    
    return true;
}

// Get menu item by ID
function getMenuItemById(id) {
    const items = getMenuItems();
    return items.find(item => item.id === id);
}

// Initialize menu on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeDefaultMenu();
    });
}

// Sales Report Operations

const ORDERS_STORAGE_KEY = 'orders';

// Get all orders from localStorage
function getOrders() {
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Generate sales report for a specific month
function generateReport() {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) return;
    
    const selectedMonth = monthSelect.value;
    if (!selectedMonth) {
        alert('Please select a month');
        return;
    }
    
    const orders = getOrders();
    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Filter orders for selected month
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.dateTime);
        return orderDate.getFullYear() === year && 
               orderDate.getMonth() + 1 === month;
    });
    
    // Calculate statistics
    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = monthOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Update statistics display
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const avgOrderValueEl = document.getElementById('avgOrderValue');
    
    if (totalRevenueEl) totalRevenueEl.textContent = `₹${Math.round(totalRevenue)}`;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (avgOrderValueEl) avgOrderValueEl.textContent = `₹${Math.round(avgOrderValue)}`;
    
    // Generate daily breakdown
    generateDailyBreakdown(monthOrders, year, month);
    
    // Generate top selling items
    generateTopItems(monthOrders);
}

// Generate daily breakdown
function generateDailyBreakdown(orders, year, month) {
    const dailyBreakdown = document.getElementById('dailyBreakdown');
    if (!dailyBreakdown) return;
    
    // Group orders by day
    const dailyData = {};
    
    orders.forEach(order => {
        const orderDate = new Date(order.dateTime);
        const day = orderDate.getDate();
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: dateKey,
                revenue: 0,
                orders: 0
            };
        }
        
        dailyData[dateKey].revenue += order.total;
        dailyData[dateKey].orders += 1;
    });
    
    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    if (dailyArray.length === 0) {
        dailyBreakdown.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No orders found for this month</p>';
        return;
    }
    
    dailyBreakdown.innerHTML = dailyArray.map(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="daily-item">
                <div>
                    <span class="date">${formattedDate}</span>
                    <span style="color: #999; margin-left: 1rem;">${day.orders} order${day.orders !== 1 ? 's' : ''}</span>
                </div>
                <div class="amount">₹${Math.round(day.revenue)}</div>
            </div>
        `;
    }).join('');
}

// Generate top selling items
function generateTopItems(orders) {
    const topItems = document.getElementById('topItems');
    if (!topItems) return;
    
    // Count items sold
    const itemCounts = {};
    const itemRevenue = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemCounts[item.name]) {
                itemCounts[item.name] = 0;
                itemRevenue[item.name] = 0;
            }
            itemCounts[item.name] += item.quantity;
            itemRevenue[item.name] += item.price * item.quantity;
        });
    });
    
    // Convert to array and sort by quantity
    const topItemsArray = Object.keys(itemCounts).map(name => ({
        name: name,
        quantity: itemCounts[name],
        revenue: itemRevenue[name]
    })).sort((a, b) => b.quantity - a.quantity);
    
    if (topItemsArray.length === 0) {
        topItems.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No items sold this month</p>';
        return;
    }
    
    // Show top 10 items
    const top10 = topItemsArray.slice(0, 10);
    
    topItems.innerHTML = top10.map(item => `
        <div class="top-item">
            <div>
                <span class="item-name">${item.name}</span>
            </div>
            <div class="item-stats">
                <span>Qty: ${item.quantity}</span>
                <span style="color: #667eea; font-weight: bold;">₹${Math.round(item.revenue)}</span>
            </div>
        </div>
    `).join('');
}

// Make function globally available
window.generateReport = generateReport;

// This is where you would add your data fetching logic
// For now, we'll keep the values at 0 as requested

// Utility: Generate days in month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Dummy daily data for each month in 2025
const dailyRevenueData2025 = {};
const dailyOrdersData2025 = {};

// Dummy daily data for each month in 2024 (for comparison)
const dailyRevenueData2024 = {};
const dailyOrdersData2024 = {};
// Generate 2025 data
for (let m = 0; m < 12; m++) {
    const days = getDaysInMonth(2025, m);
    dailyRevenueData2025[m] = [];
    dailyOrdersData2025[m] = [];
    dailyRevenueData2024[m] = [];
    dailyOrdersData2024[m] = [];
    
    for (let d = 1; d <= days; d++) {
        // Generate random but realistic dummy data for 2025
        dailyRevenueData2025[m].push(Math.floor(350 + Math.random() * 400));
        dailyOrdersData2025[m].push(Math.floor(4 + Math.random() * 10));
        
        // Generate slightly lower numbers for 2024 (for comparison)
        dailyRevenueData2024[m].push(Math.floor(300 + Math.random() * 350));
        dailyOrdersData2024[m].push(Math.floor(3 + Math.random() * 8));
    }
}

// Calculate monthly and yearly totals from daily data
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const revenueData = months.map((_, m) => dailyRevenueData2025[m].reduce((a, b) => a + b, 0));
const ordersData = months.map((_, m) => dailyOrdersData2025[m].reduce((a, b) => a + b, 0));

// Update metric cards with totals
function updateMetricCards(revenueArr, ordersArr) {
    const totalOrders = ordersArr.reduce((a, b) => a + b, 0);
    const totalRevenue = revenueArr.reduce((a, b) => a + b, 0);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
}
updateMetricCards(revenueData, ordersData);

// Chart.js Bar Chart for 2025 Revenue & Orders
const ctx = document.getElementById('revenueOrdersBarChart').getContext('2d');
const barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: months,
        datasets: [
            {
                label: 'Total Revenue ($)',
                data: revenueData,
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderRadius: 5,
                yAxisID: 'y',
                barPercentage: 0.6
            },
            {
                label: 'Total Orders',
                data: ordersData,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderRadius: 5,
                yAxisID: 'y1',
                barPercentage: 0.6
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Revenue ($)'
                }
            },
            y1: {
                beginAtZero: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                },
                title: {
                    display: true,
                    text: 'Orders'
                }
            }
        }
    }
});

// Toggle comparison mode
const compareToggle = document.getElementById('compareToggle');
const comparisonSummary = document.getElementById('comparisonSummary');
let isComparing = false;

// Helper function to calculate percentage change
function calculateGrowth(current, previous) {
    if (previous === 0) return { value: 0, isPositive: true }; // Avoid division by zero
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(Math.round(change * 10) / 10), // Round to 1 decimal place
        isPositive: change >= 0
    };
}

// Export for testing environments like Node/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateGrowth };
}

// Update comparison summary with data
function updateComparisonSummary(revenue2025, orders2025, revenue2024, orders2024, period) {
    if (!isComparing) {
        comparisonSummary.style.display = 'none';
        return;
    }

    comparisonSummary.style.display = 'block';
    
    // Set period label
    let periodLabel = '';
    switch (period) {
        case 'year':
            periodLabel = 'Year';
            break;
        case 'quarter':
            periodLabel = 'Quarter';
            break;
        case 'month':
            periodLabel = 'Month';
            break;
        case 'day':
            periodLabel = 'Day';
            break;
        case 'custom':
            periodLabel = 'Selected Period';
            break;
        default:
            periodLabel = 'Period';
    }
    document.getElementById('periodLabel').textContent = periodLabel;
    
    // Calculate AOV (Average Order Value)
    const aov2025 = orders2025 > 0 ? revenue2025 / orders2025 : 0;
    const aov2024 = orders2024 > 0 ? revenue2024 / orders2024 : 0;
    
    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(revenue2025, revenue2024);
    const ordersGrowth = calculateGrowth(orders2025, orders2024);
    const aovGrowth = calculateGrowth(aov2025, aov2024);
    
    // Format values based on period
    const formatValue = (value, isCurrency = true) => {
        if (isCurrency) {
            return `$${Math.round(value).toLocaleString()}`;
        }
        return Math.round(value).toLocaleString();
    };
    
    // Update DOM elements
    document.getElementById('revenue2025').textContent = formatValue(revenue2025);
    document.getElementById('revenue2024').textContent = formatValue(revenue2024);
    const revenueGrowthEl = document.getElementById('revenueGrowth');
    revenueGrowthEl.textContent = `${revenueGrowth.isPositive ? '↑' : '↓'} ${Math.abs(revenueGrowth.value)}%`;
    revenueGrowthEl.className = `growth ${revenueGrowth.isPositive ? 'positive' : 'negative'}`;
    revenueGrowthEl.title = `${revenueGrowth.isPositive ? 'Increase' : 'Decrease'} of ${Math.abs(revenueGrowth.value)}%`;
    
    document.getElementById('orders2025').textContent = formatValue(orders2025, false);
    document.getElementById('orders2024').textContent = formatValue(orders2024, false);
    const ordersGrowthEl = document.getElementById('ordersGrowth');
    ordersGrowthEl.textContent = `${ordersGrowth.isPositive ? '↑' : '↓'} ${Math.abs(ordersGrowth.value)}%`;
    ordersGrowthEl.className = `growth ${ordersGrowth.isPositive ? 'positive' : 'negative'}`;
    ordersGrowthEl.title = `${ordersGrowth.isPositive ? 'Increase' : 'Decrease'} of ${Math.abs(ordersGrowth.value)}%`;
    
    document.getElementById('aov2025').textContent = `$${aov2025.toFixed(2)}`;
    document.getElementById('aov2024').textContent = `$${aov2024.toFixed(2)}`;
    const aovGrowthEl = document.getElementById('aovGrowth');
    aovGrowthEl.textContent = `${aovGrowth.isPositive ? '↑' : '↓'} ${Math.abs(aovGrowth.value)}%`;
    aovGrowthEl.className = `growth ${aovGrowth.isPositive ? 'positive' : 'negative'}`;
    aovGrowthEl.title = `${aovGrowth.isPositive ? 'Increase' : 'Decrease'} of ${Math.abs(aovGrowth.value)}%`;
}

compareToggle.addEventListener('click', () => {
    isComparing = !isComparing;
    compareToggle.classList.toggle('active', isComparing);
    compareToggle.innerHTML = isComparing ? 
        '<i class="fas fa-exchange-alt"></i> Comparing with 2024' : 
        '<i class="fas fa-exchange-alt"></i> Compare with 2024';
    updateChartByPeriod(periodSelect.value);
});

// Filtering logic
const periodSelect = document.getElementById('periodSelect');
const customDateInputs = document.getElementById('customDateInputs');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyCustomRangeBtn = document.getElementById('applyCustomRange');
const chartTitle = document.getElementById('chartTitle');

periodSelect.addEventListener('change', function() {
    customDateInputs.style.display = this.value === 'custom' ? 'inline-block' : 'none';
    if (this.value !== 'custom') {
        updateChartByPeriod(this.value);
    }
});

if (applyCustomRangeBtn) {
    applyCustomRangeBtn.addEventListener('click', function() {
        updateChartByPeriod('custom');
    });
}

function updateChartByPeriod(period) {
    let labels = [], revenue = [], orders = [], revenue2024 = [], orders2024 = [];
    let title = '2025 ';
    
    // Helper function to format date
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    if (period === 'year') {
        labels = months;
        revenue = months.map((_, m) => dailyRevenueData2025[m].reduce((a, b) => a + b, 0));
        orders = months.map((_, m) => dailyOrdersData2025[m].reduce((a, b) => a + b, 0));
        if (isComparing) {
            revenue2024 = months.map((_, m) => dailyRevenueData2024[m].reduce((a, b) => a + b, 0));
            orders2024 = months.map((_, m) => dailyOrdersData2024[m].reduce((a, b) => a + b, 0));
        }
        title += 'Monthly Revenue & Orders' + (isComparing ? ' vs 2024' : '');
    } else if (period === 'quarter') {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        revenue = [0, 0, 0, 0];
        orders = [0, 0, 0, 0];
        if (isComparing) {
            revenue2024 = [0, 0, 0, 0];
            orders2024 = [0, 0, 0, 0];
        }
        
        for (let q = 0; q < 4; q++) {
            for (let m = q * 3; m < q * 3 + 3; m++) {
                revenue[q] += dailyRevenueData2025[m].reduce((a, b) => a + b, 0);
                orders[q] += dailyOrdersData2025[m].reduce((a, b) => a + b, 0);
                if (isComparing) {
                    revenue2024[q] += dailyRevenueData2024[m].reduce((a, b) => a + b, 0);
                    orders2024[q] += dailyOrdersData2024[m].reduce((a, b) => a + b, 0);
                }
            }
        }
        title += 'Quarterly Revenue & Orders' + (isComparing ? ' vs 2024' : '');
    } else if (period === 'month') {
        // Default to current month or January
        const now = new Date();
        const month = now.getFullYear() === 2025 ? now.getMonth() : 0;
        labels = Array.from({length: dailyRevenueData2025[month].length}, (_, i) => `${i+1}`);
        revenue = dailyRevenueData2025[month];
        orders = dailyOrdersData2025[month];
        if (isComparing) {
            revenue2024 = dailyRevenueData2024[month];
            orders2024 = dailyOrdersData2024[month];
        }
        title += `${months[month]} Daily Revenue & Orders` + (isComparing ? ' vs 2024' : '');
    } else if (period === 'day') {
        // Show a single day (default to today or Jan 1)
        const now = new Date();
        const month = now.getFullYear() === 2025 ? now.getMonth() : 0;
        const day = now.getFullYear() === 2025 ? now.getDate() - 1 : 0;
        labels = [`${months[month]} ${day+1}`];
        revenue = [dailyRevenueData2025[month][day]];
        orders = [dailyOrdersData2025[month][day]];
        if (isComparing) {
            revenue2024 = [dailyRevenueData2024[month][day]];
            orders2024 = [dailyOrdersData2024[month][day]];
        }
        title = `2025 ${months[month]} ${day+1} Revenue & Orders` + (isComparing ? ' vs 2024' : '');
    } else if (period === 'custom') {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        if (isNaN(start) || isNaN(end) || start > end) {
            alert('Please select a valid date range in 2025.');
            return;
        }
        // Only allow 2025
        if (start.getFullYear() !== 2025 || end.getFullYear() !== 2025) {
            alert('Please select dates within 2025.');
            return;
        }
        labels = [];
        revenue = [];
        orders = [];
        if (isComparing) {
            revenue2024 = [];
            orders2024 = [];
        }
        
        let current = new Date(start);
        while (current <= end) {
            const m = current.getMonth();
            const d = current.getDate() - 1;
            labels.push(`${months[m]} ${d+1}`);
            revenue.push(dailyRevenueData2025[m][d]);
            orders.push(dailyOrdersData2025[m][d]);
            if (isComparing) {
                revenue2024.push(dailyRevenueData2024[m][d]);
                orders2024.push(dailyOrdersData2024[m][d]);
            }
            current.setDate(current.getDate() + 1);
        }
        title = `2025 Revenue & Orders (${startDateInput.value} to ${endDateInput.value})` + (isComparing ? ' vs 2024' : '');
    }
    // Update chart with current data
    const datasets = [
        {
            label: '2025 Revenue ($)',
            data: revenue,
            backgroundColor: 'rgba(0, 123, 255, 0.7)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1,
            yAxisID: 'y',
            barPercentage: isComparing ? 0.4 : 0.6,
            categoryPercentage: 0.8
        },
        {
            label: '2025 Orders',
            data: orders,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
            yAxisID: 'y1',
            barPercentage: isComparing ? 0.4 : 0.6,
            categoryPercentage: 0.8
        }
    ];

    // Add 2024 data if comparing
    if (isComparing) {
        datasets.push(
            {
                label: '2024 Revenue ($)',
                data: revenue2024,
                backgroundColor: 'rgba(108, 117, 125, 0.7)',
                borderColor: 'rgba(108, 117, 125, 1)',
                borderWidth: 1,
                yAxisID: 'y',
                barPercentage: 0.4,
                categoryPercentage: 0.8
            },
            {
                label: '2024 Orders',
                data: orders2024,
                backgroundColor: 'rgba(253, 126, 20, 0.7)',
                borderColor: 'rgba(253, 126, 20, 1)',
                borderWidth: 1,
                yAxisID: 'y1',
                barPercentage: 0.4,
                categoryPercentage: 0.8
            }
        );
    }

    // Update chart
    barChart.data.labels = labels;
    barChart.data.datasets = datasets;
    barChart.update();
    
    // Update title and metrics
    chartTitle.textContent = title;
    updateMetricCards(revenue, orders);
    
    // Update comparison summary if in comparison mode
    if (isComparing) {
        const totalRevenue2025 = revenue.reduce((a, b) => a + b, 0);
        const totalOrders2025 = orders.reduce((a, b) => a + b, 0);
        const totalRevenue2024 = revenue2024.reduce((a, b) => a + b, 0);
        const totalOrders2024 = orders2024.reduce((a, b) => a + b, 0);
        
        updateComparisonSummary(
            totalRevenue2025, 
            totalOrders2025, 
            totalRevenue2024, 
            totalOrders2024,
            period  // Pass the current period to the function
        );
    } else {
        comparisonSummary.style.display = 'none';
    }
}


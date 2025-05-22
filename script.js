// This is where you would add your data fetching logic
// For now, we'll keep the values at 0 as requested

// Utility: Generate days in a month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Dummy daily data for each month in 2025
const dailyRevenueData2025 = {};
const dailyOrdersData2025 = {};

// Dummy daily data for each month in 2024 (for comparison)
const dailyRevenueData2024 = {};
const dailyOrdersData2024 = {};
// Generate 2025 and 2024 data
for (let m = 0; m < 12; m++) {
    const days2025 = getDaysInMonth(2025, m);
    const days2024 = getDaysInMonth(2024, m);
    dailyRevenueData2025[m] = [];
    dailyOrdersData2025[m] = [];
    dailyRevenueData2024[m] = [];
    dailyOrdersData2024[m] = [];

    for (let d = 1; d <= days2025; d++) {
        // Generate random but realistic dummy data for 2025
        dailyRevenueData2025[m].push(Math.floor(350 + Math.random() * 400));
        dailyOrdersData2025[m].push(Math.floor(4 + Math.random() * 10));
    }

    for (let d = 1; d <= days2024; d++) {
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
    document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
}
updateMetricCards(revenueData, ordersData);

// Chart.js Bar Chart for 2025 Revenue & Orders
// Check screen width for responsive settings
const isMobile = window.innerWidth < 768;
const isVerySmall = window.innerWidth < 480;

// Define shortened labels for mobile
const mobileLabels = isVerySmall ? 
    months.map(month => month.substring(0, 1)) : 
    (isMobile ? months.map(month => month.substring(0, 3)) : months);

const ctx = document.getElementById('revenueOrdersBarChart').getContext('2d');
const barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: mobileLabels,
        datasets: [
            {
                label: 'Revenue ($)',
                data: revenueData,
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 6,
                yAxisID: 'y',
                barPercentage: isVerySmall ? 0.6 : (isMobile ? 0.7 : 0.65),
                categoryPercentage: isVerySmall ? 0.7 : 0.85
            },
            {
                label: 'Orders',
                data: ordersData,
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                borderRadius: 6,
                yAxisID: 'y1',
                barPercentage: isVerySmall ? 0.6 : (isMobile ? 0.7 : 0.65),
                categoryPercentage: isVerySmall ? 0.7 : 0.85
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: window.innerWidth < 768 ? 1.2 : 2,
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 14,
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: window.innerWidth < 768 ? 12 : 13,
                        family: "'Poppins', sans-serif",
                        weight: '500'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                padding: 14,
                bodyFont: {
                    size: window.innerWidth < 768 ? 12 : 13,
                    family: "'Poppins', sans-serif"
                },
                titleFont: {
                    size: window.innerWidth < 768 ? 13 : 14,
                    family: "'Poppins', sans-serif",
                    weight: '600'
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        layout: {
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        elements: {
            bar: {
                borderWidth: 1
            }
        },
        barPercentage: 0.85,
        categoryPercentage: 0.8,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: window.innerWidth < 768 ? 90 : 45,
                    minRotation: window.innerWidth < 768 ? 90 : 0,
                    padding: 8,
                    font: {
                        size: window.innerWidth < 768 ? 11 : 12,
                        family: "'Poppins', sans-serif"
                    },
                    color: '#6b7280'
                },
                grid: {
                    display: false
                },
                border: {
                    display: true,
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            y: {
                beginAtZero: true,
                position: 'left',
                border: {
                    display: true,
                    color: 'rgba(0,0,0,0.05)'
                },
                title: {
                    display: true,
                    text: 'Revenue ($)',
                    padding: {top: 0, bottom: 10},
                    font: {
                        size: window.innerWidth < 768 ? 11 : 13,
                        family: "'Poppins', sans-serif",
                        weight: '600'
                    },
                    color: '#3b82f6'
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 11 : 12,
                        family: "'Poppins', sans-serif"
                    },
                    padding: 8,
                    color: '#6b7280',
                    maxTicksLimit: window.innerWidth < 768 ? 5 : 8
                },
                grid: {
                    color: 'rgba(0,0,0,0.03)'
                }
            },

            y1: {
                beginAtZero: true,
                position: 'right',
                border: {
                    display: true,
                    color: 'rgba(0,0,0,0.05)'
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(0,0,0,0.03)'
                },
                title: {
                    display: true,
                    text: 'Orders',
                    padding: {top: 0, bottom: 10},
                    font: {
                        size: window.innerWidth < 768 ? 11 : 13,
                        family: "'Poppins', sans-serif",
                        weight: '600'
                    },
                    color: '#10b981'
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 11 : 12,
                        family: "'Poppins', sans-serif"
                    },
                    padding: 8,
                    color: '#6b7280',
                    maxTicksLimit: window.innerWidth < 768 ? 5 : 8
                }
            }
        }
    }
});

// Toggle comparison mode
const compareToggle = document.getElementById('compareToggle');
const comparisonSummary = document.getElementById('comparisonSummary');
let isComparing = false;

// Handle window resize for chart responsiveness
function handleResize() {
    if (barChart) {
        const isMobile = window.innerWidth < 768;
        const isVerySmall = window.innerWidth < 480;
        
        // Adjust chart settings based on screen size
        barChart.options.maintainAspectRatio = true;
        barChart.options.aspectRatio = isVerySmall ? 1 : (isMobile ? 1.2 : 2);
        
        // Set bar percentage width - smaller on mobile
        barChart.data.datasets.forEach(dataset => {
            dataset.barPercentage = isVerySmall ? 0.5 : (isMobile ? 0.7 : 0.6);
            dataset.categoryPercentage = isVerySmall ? 0.7 : 0.8;
        });
        
        // Configure legend
        barChart.options.plugins.legend.position = isVerySmall ? 'bottom' : 'top';
        barChart.options.plugins.legend.align = 'center';
        barChart.options.plugins.legend.labels = {
            boxWidth: isVerySmall ? 8 : 12,
            padding: isVerySmall ? 8 : 15,
            font: {
                size: isVerySmall ? 8 : (isMobile ? 10 : 12),
                weight: 'bold'
            }
        };
        
        // Configure tooltip
        const tooltipFontSize = isVerySmall ? 9 : (isMobile ? 10 : 12);
        barChart.options.plugins.tooltip = {
            mode: 'index',
            intersect: false,
            position: 'nearest',
            bodyFont: {
                size: tooltipFontSize
            },
            titleFont: {
                size: tooltipFontSize + 1
            },
            padding: isVerySmall ? 6 : 10,
            displayColors: true,
            boxWidth: isVerySmall ? 8 : 10
        };
        
        // Configure x-axis
        barChart.options.scales.x.ticks = {
            autoSkip: true,
            maxRotation: isVerySmall ? 0 : (isMobile ? 45 : 0),
            minRotation: 0,
            padding: isVerySmall ? 5 : (isMobile ? 8 : 10),
            font: {
                size: isVerySmall ? 8 : (isMobile ? 9 : 12),
                weight: 'bold'
            },
            color: '#666'
        };
        
        // For very small screens, only show alternate months or use 3-letter abbreviations
        if (isVerySmall) {
            barChart.data.labels = months.map(month => month.substring(0, 1));
        } else if (isMobile) {
            barChart.data.labels = months.map(month => month.substring(0, 3));
        } else {
            barChart.data.labels = months;
        }
        
        // Configure y-axes
        const configureYAxis = (axis, title) => {
            axis.beginAtZero = true;
            axis.ticks = {
                font: {
                    size: isVerySmall ? 8 : (isMobile ? 9 : 12)
                },
                padding: isVerySmall ? 2 : 5,
                maxTicksLimit: isVerySmall ? 4 : (isMobile ? 5 : 10),
                color: '#666'
            };
            axis.title = {
                display: !isVerySmall,
                text: title,
                font: {
                    size: isVerySmall ? 0 : (isMobile ? 10 : 12),
                    weight: 'bold'
                },
                color: '#666',
                padding: isMobile ? 0 : 10
            };
            axis.grid = {
                drawBorder: false,
                color: isVerySmall ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.1)'
            };
        };
        
        configureYAxis(barChart.options.scales.y, 'Revenue ($)');
        
        barChart.options.scales.y1.grid.drawOnChartArea = false;
        configureYAxis(barChart.options.scales.y1, 'Orders');
        
        barChart.update('none'); // Use 'none' to avoid animation during resize
    }
}

// Add resize event listener with debounce for performance
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
});

// Initialize responsive layout
handleResize();

// Helper function to calculate percentage change
function calculateGrowth(current, previous) {
    if (previous === 0 || previous === undefined) return 0; // Avoid division by zero
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10; // Round to 1 decimal place
}

// Export for testing environments like Node/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateGrowth };
}

// Update comparison summary with data
function updateComparisonSummary(revenue2025, orders2025, revenue2024, orders2024, period) {
    // Always ensure we have data to display
    if (!revenue2025) revenue2025 = 0;
    if (!orders2025) orders2025 = 0;
    if (!revenue2024) revenue2024 = 0;
    if (!orders2024) orders2024 = 0;
    
    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(revenue2025, revenue2024);
    const ordersGrowth = calculateGrowth(orders2025, orders2024);
    
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
    revenueGrowthEl.textContent = `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`;
    revenueGrowthEl.className = `growth ${revenueGrowth >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('orders2025').textContent = formatValue(orders2025, false);
    document.getElementById('orders2024').textContent = formatValue(orders2024, false);
    
    const ordersGrowthEl = document.getElementById('ordersGrowth');
    ordersGrowthEl.textContent = `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth}%`;
    ordersGrowthEl.className = `growth ${ordersGrowth >= 0 ? 'positive' : 'negative'}`;
    
    // Show the comparison summary with animation
    comparisonSummary.style.display = 'block';
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
    // Update chart with current data - improved colors and styling
    const datasets = [
        {
            label: '2025 Revenue',
            data: revenue,
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderColor: 'rgba(29, 78, 216, 1)', // Darker blue border
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y',
            barPercentage: isComparing ? 0.4 : 0.65,
            categoryPercentage: 0.85
        },
        {
            label: '2025 Orders',
            data: orders,
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            borderColor: 'rgba(5, 150, 105, 1)', // Darker green border
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y1',
            barPercentage: isComparing ? 0.4 : 0.65,
            categoryPercentage: 0.85
        }
    ];

    // Add 2024 data if comparing
    if (isComparing) {
        datasets.push(
            {
                label: '2024 Revenue',
                data: revenue2024,
                backgroundColor: 'rgba(147, 197, 253, 0.85)', // Lighter blue with higher opacity
                borderColor: 'rgba(59, 130, 246, 0.9)',
                borderWidth: 2,
                borderRadius: 6,
                yAxisID: 'y',
                barPercentage: 0.4,
                categoryPercentage: 0.85
            },
            {
                label: '2024 Orders',
                data: orders2024,
                backgroundColor: 'rgba(167, 243, 208, 0.85)', // Lighter green with higher opacity
                borderColor: 'rgba(16, 185, 129, 0.9)',
                borderWidth: 2,
                borderRadius: 6,
                yAxisID: 'y1',
                barPercentage: 0.4,
                categoryPercentage: 0.85
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
    
    // Always update comparison data but only display if comparing
    const totalRevenue2025 = revenue.reduce((a, b) => a + b, 0);
    const totalOrders2025 = orders.reduce((a, b) => a + b, 0);
    const totalRevenue2024 = revenue2024.reduce((a, b) => a + b, 0);
    const totalOrders2024 = orders2024.reduce((a, b) => a + b, 0);
    
    // Update the comparison summary
    updateComparisonSummary(
        totalRevenue2025, 
        totalOrders2025, 
        totalRevenue2024, 
        totalOrders2024
    );
    
    // Update the comparison title based on the selected period
    const comparisonTitle = document.getElementById('comparisonTitle');
    if (comparisonTitle) {
        let periodText = '';
        switch(period) {
            case 'year':
                periodText = 'Year-over-Year';
                break;
            case 'quarter':
                periodText = 'Quarter-over-Quarter';
                break;
            case 'month':
                periodText = 'Month-over-Month';
                break;
            case 'day':
                periodText = 'Day-over-Day';
                break;
            case 'custom':
                periodText = 'Period';
                break;
            default:
                periodText = 'Year-over-Year';
        }
        comparisonTitle.textContent = `${periodText} Comparison`;
    }
    
    // Show or hide based on comparison mode
    comparisonSummary.style.display = isComparing ? 'block' : 'none';
}


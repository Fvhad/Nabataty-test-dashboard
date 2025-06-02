// API-enabled version of the dashboard script
const API_BASE = window.location.origin + '/api';

// Global variables
let barChart;
let isComparing = false;
let currentData = {};
let socket;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    setupWebSocket();
});

async function initializeDashboard() {
    try {
        // Load initial metrics and data
        await loadMetrics();
        await loadChartData('year');
        
        // Initialize chart
        initializeChart();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Load summary metrics from API
async function loadMetrics() {
    try {
        const response = await fetch(`${API_BASE}/metrics`);
        const metrics = await response.json();
        
        // Update metric cards
        document.getElementById('totalOrders').textContent = 
            Math.round(metrics.total_orders_2025 || 0).toLocaleString();
        document.getElementById('totalRevenue').textContent = 
            '$' + Math.round(metrics.total_revenue_2025 || 0).toLocaleString();
            
    } catch (error) {
        console.error('Error loading metrics:', error);
        // Fallback to 0 values
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalRevenue').textContent = '$0';
    }
}

// Load chart data from API
async function loadChartData(period, year = 2025) {
    try {
        let url = `${API_BASE}/data/${period}?year=${year}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        currentData[`${period}_${year}`] = data;
        return data;
        
    } catch (error) {
        console.error(`Error loading ${period} data for ${year}:`, error);
        return [];
    }
}

// Load comparison data
async function loadComparisonData(period) {
    try {
        const response = await fetch(`${API_BASE}/comparison/2025/2024?period=${period}`);
        const data = await response.json();
        
        currentData[`comparison_${period}`] = data;
        return data;
        
    } catch (error) {
        console.error(`Error loading comparison data for ${period}:`, error);
        return [];
    }
}

// Initialize Chart.js chart
function initializeChart() {
    const ctx = document.getElementById('revenueOrdersBarChart').getContext('2d');
    const isMobile = window.innerWidth < 768;
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
}

// Update chart by period
async function updateChartByPeriod(period) {
    try {
        let labels = [], revenue = [], orders = [], revenue2024 = [], orders2024 = [];
        let title = '2025 ';
        
        if (period === 'year') {
            const data2025 = await loadChartData('year', 2025);
            
            // Month names
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            labels = months;
            revenue = new Array(12).fill(0);
            orders = new Array(12).fill(0);
            
            // Fill data from API response
            data2025.forEach(item => {
                const monthIndex = item.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    revenue[monthIndex] = item.revenue || 0;
                    orders[monthIndex] = item.orders || 0;
                }
            });
            
            title = '2025 Monthly';
            
            if (isComparing) {
                const data2024 = await loadChartData('year', 2024);
                revenue2024 = new Array(12).fill(0);
                orders2024 = new Array(12).fill(0);
                
                data2024.forEach(item => {
                    const monthIndex = item.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        revenue2024[monthIndex] = item.revenue || 0;
                        orders2024[monthIndex] = item.orders || 0;
                    }
                });
                
                title = '2025 vs 2024 Monthly';
            }
        } else if (period === 'month') {
            // For month view, show current month's daily data
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            
            const data2025 = await loadChartData('month', 2025);
            
            // Filter for current month
            const monthData = data2025.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() + 1 === currentMonth;
            });
            
            labels = monthData.map(item => new Date(item.date).getDate());
            revenue = monthData.map(item => item.revenue || 0);
            orders = monthData.map(item => item.orders || 0);
            
            title = `2025 ${new Date().toLocaleString('default', { month: 'long' })} Daily`;
        } else if (period === 'day') {
            // Show last 30 days
            const data2025 = await loadChartData('day', 2025);
            
            labels = data2025.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            revenue = data2025.map(item => item.revenue || 0);
            orders = data2025.map(item => item.orders || 0);
            
            title = '2025 Last 30 Days';
        }
        
        // Update chart
        const datasets = [
            {
                label: '2025 Revenue',
                data: revenue,
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                borderColor: 'rgba(29, 78, 216, 1)',
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
                borderColor: 'rgba(5, 150, 105, 1)',
                borderWidth: 2,
                borderRadius: 6,
                yAxisID: 'y1',
                barPercentage: isComparing ? 0.4 : 0.65,
                categoryPercentage: 0.85
            }
        ];
        
        if (isComparing && revenue2024.length > 0) {
            datasets.push(
                {
                    label: '2024 Revenue',
                    data: revenue2024,
                    backgroundColor: 'rgba(156, 163, 175, 0.7)',
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    yAxisID: 'y',
                    barPercentage: 0.4,
                    categoryPercentage: 0.85
                },
                {
                    label: '2024 Orders',
                    data: orders2024,
                    backgroundColor: 'rgba(209, 213, 219, 0.7)',
                    borderColor: 'rgba(156, 163, 175, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    yAxisID: 'y1',
                    barPercentage: 0.4,
                    categoryPercentage: 0.85
                }
            );
            
            // Update comparison summary
            const totalRevenue2025 = revenue.reduce((a, b) => a + b, 0);
            const totalOrders2025 = orders.reduce((a, b) => a + b, 0);
            const totalRevenue2024 = revenue2024.reduce((a, b) => a + b, 0);
            const totalOrders2024 = orders2024.reduce((a, b) => a + b, 0);
            
            updateComparisonSummary(totalRevenue2025, totalOrders2025, totalRevenue2024, totalOrders2024, period);
        } else {
            // Hide comparison summary
            const comparisonSummary = document.getElementById('comparisonSummary');
            if (comparisonSummary) {
                comparisonSummary.style.display = 'none';
            }
        }
        
        barChart.data.labels = labels;
        barChart.data.datasets = datasets;
        barChart.update();
        
        // Update chart title
        const chartTitle = document.getElementById('chartTitle');
        if (chartTitle) {
            chartTitle.textContent = title + ' Revenue & Orders';
        }
        
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

// Update current chart with fresh data
async function updateCurrentChart() {
    const periodSelect = document.getElementById('periodSelect');
    const currentPeriod = periodSelect ? periodSelect.value : 'year';
    await updateChartByPeriod(currentPeriod);
}

// Helper function to calculate percentage change
function calculateGrowth(current, previous) {
    if (previous === 0 || previous === undefined) return 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
}

// Update comparison summary with data
function updateComparisonSummary(revenue2025, orders2025, revenue2024, orders2024, period) {
    if (!revenue2025) revenue2025 = 0;
    if (!orders2025) orders2025 = 0;
    if (!revenue2024) revenue2024 = 0;
    if (!orders2024) orders2024 = 0;
    
    const revenueGrowth = calculateGrowth(revenue2025, revenue2024);
    const ordersGrowth = calculateGrowth(orders2025, orders2024);
    
    const formatValue = (value, isCurrency = true) => {
        if (isCurrency) {
            return `$${Math.round(value).toLocaleString()}`;
        }
        return Math.round(value).toLocaleString();
    };
    
    // Update DOM elements if they exist
    const revenue2025El = document.getElementById('revenue2025');
    const revenue2024El = document.getElementById('revenue2024');
    const revenueGrowthEl = document.getElementById('revenueGrowth');
    const orders2025El = document.getElementById('orders2025');
    const orders2024El = document.getElementById('orders2024');
    const ordersGrowthEl = document.getElementById('ordersGrowth');
    const comparisonSummary = document.getElementById('comparisonSummary');
    
    if (revenue2025El) revenue2025El.textContent = formatValue(revenue2025);
    if (revenue2024El) revenue2024El.textContent = formatValue(revenue2024);
    if (orders2025El) orders2025El.textContent = formatValue(orders2025, false);
    if (orders2024El) orders2024El.textContent = formatValue(orders2024, false);
    
    if (revenueGrowthEl) {
        revenueGrowthEl.textContent = `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`;
        revenueGrowthEl.className = `growth ${revenueGrowth >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (ordersGrowthEl) {
        ordersGrowthEl.textContent = `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth}%`;
        ordersGrowthEl.className = `growth ${ordersGrowth >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (comparisonSummary) {
        comparisonSummary.style.display = 'block';
    }
}

// Setup WebSocket connection for real-time updates
function setupWebSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server for real-time updates');
    });
    
    socket.on('metricsUpdated', (metrics) => {
        console.log('Metrics updated:', metrics);
        updateMetricCards(metrics);
    });
    
    socket.on('dataUpdated', (updateInfo) => {
        console.log('Data updated:', updateInfo);
        // Refresh current chart view immediately
        updateCurrentChart();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Update metric cards with new data
function updateMetricCards(metrics) {
    document.getElementById('totalOrders').textContent = 
        Math.round(metrics.total_orders_2025 || 0).toLocaleString();
    document.getElementById('totalRevenue').textContent = 
        '$' + Math.round(metrics.total_revenue_2025 || 0).toLocaleString();
}

// Set up event listeners
function setupEventListeners() {
    // Compare toggle
    const compareToggle = document.getElementById('compareToggle');
    if (compareToggle) {
        compareToggle.addEventListener('click', () => {
            isComparing = !isComparing;
            compareToggle.classList.toggle('active', isComparing);
            compareToggle.innerHTML = isComparing ? 
                '<i class="fas fa-exchange-alt"></i> Comparing with 2024' : 
                '<i class="fas fa-exchange-alt"></i> Compare with 2024';
            
            const periodSelect = document.getElementById('periodSelect');
            updateChartByPeriod(periodSelect ? periodSelect.value : 'year');
        });
    }

    // Period selection
    const periodSelect = document.getElementById('periodSelect');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            const customDateInputs = document.getElementById('customDateInputs');
            if (customDateInputs) {
                customDateInputs.style.display = this.value === 'custom' ? 'inline-block' : 'none';
            }
            
            if (this.value !== 'custom') {
                updateChartByPeriod(this.value);
            }
        });
    }

    // Custom date range
    const applyCustomRangeBtn = document.getElementById('applyCustomRange');
    if (applyCustomRangeBtn) {
        applyCustomRangeBtn.addEventListener('click', function() {
            updateChartByPeriod('custom');
        });
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });
}

// Handle window resize for chart responsiveness
function handleResize() {
    if (barChart) {
        const isMobile = window.innerWidth < 768;
        const isVerySmall = window.innerWidth < 480;
        
        barChart.options.maintainAspectRatio = true;
        barChart.options.aspectRatio = isVerySmall ? 1 : (isMobile ? 1.2 : 2);
        
        barChart.data.datasets.forEach(dataset => {
            dataset.barPercentage = isVerySmall ? 0.5 : (isMobile ? 0.7 : 0.6);
        });
        
        barChart.update('none');
    }
}

// Export for testing environments like Node/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateGrowth };
}

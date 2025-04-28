import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import API from '../utils/Axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Dashboard() {
    const [overview, setOverview] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderStatusStats, setOrderStatusStats] = useState([]);
    const [period, setPeriod] = useState("Month");
    const [error, setError] = useState(null);

    // State for date range
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
    const [endDate, setEndDate] = useState(new Date()); // Today

    // Fetch overview data
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await API.get(`/dashboard/overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = response.data;
                setOverview(data || { totalRevenue: 0, totalOrders: 0, newCustomers: 0 });
            } catch (error) {
                console.error("Error fetching overview:", error);
                setError("Failed to load overview data: " + (error.response?.data?.message || error.message));
            }
        };

        fetchOverview();
    }, [startDate, endDate]);

    // Fetch sales-by-period data
    useEffect(() => {
        const fetchSalesByPeriod = async () => {
            try {
                const response = await API.get(`/dashboard/sales-by-period?period=${period}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = response.data;
                setSalesData(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching sales by period:", error);
                setError("Failed to load sales data: " + (error.response?.data?.message || error.message));
                setSalesData([]);
            }
        };

        fetchSalesByPeriod();
    }, [period, startDate, endDate]);

    // Fetch top products
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await API.get(`/dashboard/top-products?limit=5&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = response.data;
                setTopProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching top products:", error);
                setError("Failed to load top products: " + (error.response?.data?.message || error.message));
                setTopProducts([]);
            }
        };

        fetchTopProducts();
    }, [startDate, endDate]);

    // Fetch order status stats
    useEffect(() => {
        const fetchOrderStatusStats = async () => {
            try {
                const response = await API.get(`/dashboard/order-status?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = response.data;
                setOrderStatusStats(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching order status stats:", error);
                setError("Failed to load order status stats: " + (error.response?.data?.message || error.message));
                setOrderStatusStats([]);
            }
        };

        fetchOrderStatusStats();
    }, [startDate, endDate]);

    // Prepare data for sales chart
    const salesChartData = {
        labels: salesData.length > 0 ? salesData.map((item) => item.period) : [],
        datasets: [
            {
                label: "Revenue (VND)",
                data: salesData.length > 0 ? salesData.map((item) => item.revenue) : [],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for order status pie chart
    const orderStatusChartData = {
        labels: orderStatusStats.length > 0 ? orderStatusStats.map((item) => item.status) : [],
        datasets: [
            {
                label: "Order Count",
                data: orderStatusStats.length > 0 ? orderStatusStats.map((item) => item.count) : [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const metrics = [
        { name: "Total Revenue", value: `${overview.totalRevenue.toLocaleString()} VND` },
        { name: "Total Orders", value: overview.totalOrders }
    ];

    return (
        <div className="dashboard">
            {error && <div className="error-message">{error}</div>}

            {/* Date Range Picker */}
            <div className="date-range-selector" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'inline-block', marginRight: '20px' }}>
                    <div className="period-selector">
                        <div className="period-text">Period: </div>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-dropdown">
                            <option value="Day">Day</option>
                            <option value="Week">Week</option>
                            <option value="Month">Month</option>
                            <option value="Year">Year</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'inline-block', marginRight: '20px' }}>
                    <label>Start Date: </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker"
                    />
                </div>
                <div style={{ display: 'inline-block', marginRight: '20px' }}>
                    <label>End Date: </label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker"
                    />
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
                {metrics.map((metric) => (
                    <div key={metric.name} className="metric-card">
                        <div className="metric-name">{metric.name}</div>
                        <div className="metric-value">{metric.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Sales By Period Chart */}
                <div className="chart-container">
                    <h3>Sales by Period</h3>
                    {salesData.length > 0 ? (
                        <Bar data={salesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" }, title: { display: true, text: `Sales by ${period}` } } }} />
                    ) : (
                        <p>No sales data available for this period.</p>
                    )}
                </div>

                {/* Order Status Pie Chart */}
                <div className="chart-container pie-container">
                    <h3>Order Status Distribution</h3>
                    {orderStatusStats.length > 0 ? (
                        <Pie data={orderStatusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" }, title: { display: true, text: "Order Status Distribution" } } }} />
                    ) : (
                        <p>No orders found to display status distribution.</p>
                    )}
                </div>
            </div>

            {/* Top Products Table */}
            <div className="top-products-container">
                <h3>Top Selling Products</h3>
                {topProducts.length > 0 ? (
                    <table className="top-products-table">
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Quantity Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((product) => (
                                <tr key={product.productId}>
                                    <td>{product.productId}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.totalQuantitySold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No top-selling products found for this period.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
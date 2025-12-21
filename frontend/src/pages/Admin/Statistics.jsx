import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { fetchOrders } from '../../services/orderService.jsx';
import '../../css/statistics.css';

const Statistics = () => {
    const [activeTab, setActiveTab] = useState('monthly');
    const [data, setData] = useState([]);
    const [rawData, setRawData] = useState([]); // Store raw fetched orders
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        if (rawData.length > 0) {
            processData(activeTab);
        }
    }, [activeTab, rawData]);

    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const orders = await fetchOrders();
            if (Array.isArray(orders)) {
                setRawData(orders);
                // Initial process will happen in useEffect
                console.log("Orders loaded:", orders.length, orders[0]);
            } else {
                setError('Dữ liệu đơn hàng không hợp lệ');
            }
        } catch (err) {
            console.error("Error loading orders:", err);
            setError('Lỗi khi tải dữ liệu đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    const processData = (period) => {
        if (!rawData || rawData.length === 0) return;

        let grouped = {};

        rawData.forEach(order => {
            // Assuming status 'Cancelled' typically doesn't count towards revenue?
            // But user just asked for stats, let's include all valid orders or specific statuses?
            // Usually we filter out Cancelled.
            if (order.Status === 'Cancelled') return;

            const dateStr = order.orderDate || order.created_at; // Fallback
            if (!dateStr) return;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return;

            let key;
            if (period === 'daily') {
                // YYYY-MM-DD
                key = date.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                // YYYY-MM
                key = date.toISOString().slice(0, 7);
            } else if (period === 'yearly') {
                // YYYY
                key = date.getFullYear().toString();
            } else if (period === 'weekly') {
                // ISO Week
                const target = new Date(date.valueOf());
                const dayNr = (date.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                const firstThursday = target.valueOf();
                target.setMonth(0, 1);
                if (target.getDay() !== 4) {
                    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
                }
                const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
                key = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
            }

            const amount = parseFloat(order.totalAmount) || 0;

            if (!grouped[key]) {
                grouped[key] = {
                    period: key,
                    revenue: 0,
                    order_count: 0
                };
            }

            grouped[key].revenue += amount;
            grouped[key].order_count += 1;
        });

        // Convert object to array and sort
        let sortedData = Object.values(grouped).sort((a, b) => {
            return a.period.localeCompare(b.period);
        });

        // Optional: Filter for recent range for daily/weekly?
        // User requested "Show stats", usually implied all or recent.
        // Let's just show sorted data. If array is too large, we can slice.

        // For daily, maybe limit to last 30 entries if too many
        if (period === 'daily' && sortedData.length > 30) {
            sortedData = sortedData.slice(-30);
        }
        // For weekly, maybe limit to last 12-24
        if (period === 'weekly' && sortedData.length > 20) {
            sortedData = sortedData.slice(-20);
        }

        setData(sortedData);
    };

    const renderChart = () => {
        if (loading) return <div className="stats-loading">Đang tính toán...</div>;
        if (error) return <div className="stats-error">{error}</div>;
        if (!data || data.length === 0) return <div className="stats-empty">Chưa có dữ liệu đơn hàng</div>;

        const ChartComponent = activeTab === 'daily' ? LineChart : BarChart;
        const DataComponent = activeTab === 'daily' ? Line : Bar;

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <DataComponent yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VNĐ)" fill="#8884d8" stroke="#8884d8" />
                    <DataComponent yAxisId="right" type="monotone" dataKey="order_count" name="Số đơn hàng" fill="#82ca9d" stroke="#82ca9d" />
                </ChartComponent>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="stats-page">
            <div className="stats-header">
                <h1>Thống kê Doanh thu</h1>
                <div className="stats-tabs">
                    <button
                        className={`stats-tab ${activeTab === 'daily' ? 'active' : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        Hàng ngày
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Hàng tuần
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'monthly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Hàng tháng
                    </button>
                    <button
                        className={`stats-tab ${activeTab === 'yearly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('yearly')}
                    >
                        Hàng năm
                    </button>
                </div>
            </div>

            <div className="stats-content">
                <div className="stats-chart-container">
                    {renderChart()}
                </div>

                <div className="stats-table-container">
                    <h3>Chi tiết số liệu</h3>
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Doanh thu</th>
                                <th>Số đơn hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...data].reverse().map((item, index) => (
                                <tr key={index}>
                                    <td>{item.period}</td>
                                    <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}</td>
                                    <td>{item.order_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Statistics;

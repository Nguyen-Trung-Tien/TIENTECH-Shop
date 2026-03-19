import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiBox,
  FiFilter,
  FiRefreshCw,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getAllOrders } from "../../../api/orderApi";
import { getAllOrderItems } from "../../../api/orderItemApi";
import { getDashboard } from "../../../api/adminApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#059669"];
const STATUS_LABELS = {
  pending: { text: "Chờ xử lý", class: "bg-amber-50 text-amber-600 border-amber-100" },
  confirmed: { text: "Đã xác nhận", class: "bg-blue-50 text-blue-600 border-blue-100" },
  processing: { text: "Đang xử lý", class: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  shipped: { text: "Đã gửi", class: "bg-slate-50 text-slate-600 border-slate-200" },
  delivered: { text: "Đã giao", class: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  cancelled: { text: "Đã hủy", class: "bg-rose-50 text-rose-600 border-rose-100" },
};

const Revenue = () => {
  const token = useSelector((state) => state.user.token);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [productsData, setProductsData] = useState([]);

  const [dateFilter, setDateFilter] = useState("7days");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const tableTopRef = useRef(null);

  const formatCurrency = (value) =>
    Number(value).toLocaleString("vi-VN") + " ₫";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setChartLoading(true);
    try {
      const [ordersRes, orderItemsRes, dashboardRes] = await Promise.all([
        getAllOrders(1, 1000, token),
        getAllOrderItems(token),
        getDashboard(token),
      ]);

      let orderList = [];
      if (ordersRes?.errCode === 0 && Array.isArray(ordersRes.data)) {
        orderList = ordersRes.data;
        setOrders(orderList);
      }

      if (dashboardRes?.errCode === 0 && Array.isArray(dashboardRes.data)) {
        const backendData = dashboardRes.data.map((item) => ({
          name: item.day || item.date || "N/A",
          value: parseFloat(item.revenue || 0),
        }));
        setRevenueData(backendData.sort((a, b) => new Date(a.name) - new Date(b.name)));
      }

      if (orderItemsRes?.errCode === 0 && Array.isArray(orderItemsRes.data)) {
        const items = orderItemsRes.data;
        const productMap = {};
        items.forEach((item) => {
          const name = item.productName || `SP #${item.productId}`;
          productMap[name] = (productMap[name] || 0) + item.quantity;
        });
        const productArray = Object.entries(productMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setProductsData(productArray);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    const now = new Date();
    const daysMap = { "7days": 7, "30days": 30, all: 3650 };
    if (dateFilter !== "all") {
      const cutoff = new Date(now.setDate(now.getDate() - daysMap[dateFilter]));
      filtered = filtered.filter((o) => new Date(o.createdAt) >= cutoff);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((o) => o.id.toString().includes(term) || o.user?.username?.toLowerCase().includes(term));
    }
    return filtered;
  }, [orders, dateFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const deliveredCount = filteredOrders.filter((o) => o.status === "delivered").length;
    return { totalRevenue, totalOrders, avgOrderValue, deliveredCount };
  }, [filteredOrders]);

  useEffect(() => {
    const total = filteredOrders.length;
    setTotalPages(Math.ceil(total / limit) || 1);
  }, [filteredOrders, limit]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page, limit]);

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                <FiTrendingUp />
             </div>
             Báo cáo & Doanh thu
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
             Thống kê hiệu suất kinh doanh chi tiết
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Doanh thu", value: formatCurrency(stats.totalRevenue), icon: <FiDollarSign />, color: "bg-blue-600 shadow-blue-500/20" },
          { label: "Đơn hàng", value: stats.totalOrders, icon: <FiShoppingCart />, color: "bg-emerald-600 shadow-emerald-500/20" },
          { label: "Đã hoàn tất", value: stats.deliveredCount, icon: <FiBox />, color: "bg-indigo-600 shadow-indigo-500/20" },
          { label: "Trung bình/Đơn", value: formatCurrency(stats.avgOrderValue), icon: <FiUsers />, color: "bg-amber-500 shadow-amber-500/20" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-6 group hover:border-primary/20 transition-all">
             <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{item.value}</h4>
             </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-soft flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1 md:flex-none">
           <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <select 
             value={dateFilter}
             onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
             className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 text-xs font-black uppercase tracking-widest outline-none appearance-none"
           >
              <option value="7days">7 ngày gần nhất</option>
              <option value="30days">30 ngày gần nhất</option>
              <option value="all">Toàn bộ thời gian</option>
           </select>
           <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative flex-1 min-w-[300px] group">
           <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
           <input
             placeholder="Tìm mã đơn, tên khách hàng..."
             value={searchTerm}
             onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
             className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
           />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-[40px] border border-slate-100 shadow-soft p-8">
           <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
              <FiBarChart className="text-primary" /> Doanh thu theo thời gian
           </h3>
           <div className="h-[300px]">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center"><FiRefreshCw className="animate-spin text-2xl text-slate-200" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={20} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[40px] border border-slate-100 shadow-soft p-8">
           <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
              <FiPieChart className="text-emerald-500" /> Top 5 Sản phẩm bán chạy
           </h3>
           <div className="h-[300px]">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center"><FiRefreshCw className="animate-spin text-2xl text-slate-200" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={productsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={5}>
                      {productsData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden" ref={tableTopRef}>
        <div className="p-8 border-b border-slate-50">
           <h3 className="text-lg font-black text-slate-900 tracking-tight">Chi tiết đơn hàng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">STT</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đơn</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tổng tiền</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><FiRefreshCw className="animate-spin inline-block text-2xl text-slate-200" /></td></tr>
              ) : paginatedOrders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-400">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">DH{order.id}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{order.user?.username || "Ẩn danh"}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-400">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-8 py-5 text-sm font-black text-rose-600 text-right">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_LABELS[order.status]?.class || "bg-slate-100"}`}>
                       {STATUS_LABELS[order.status]?.text || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hiển thị {paginatedOrders.length} đơn hàng</p>
           <AppPagination 
             page={page} 
             totalPages={totalPages} 
             loading={loading} 
             onPageChange={(p) => { setPage(p); tableTopRef.current?.scrollIntoView({ behavior: "smooth" }); }} 
           />
        </div>
      </div>
    </div>
  );
};

export default Revenue;

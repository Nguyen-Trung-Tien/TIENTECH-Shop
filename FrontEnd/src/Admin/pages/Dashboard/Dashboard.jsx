import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaShoppingCart, FaDollarSign, FaUsers } from "react-icons/fa";
import StatsCard from "../../components/StatsCardComponent/StatsCard";
import ChartCard from "../../components/ChartCardComponent/ChartCard";
import { getDashboard } from "../../../api/adminApi";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const token = useSelector((state) => state.user.token);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboard();
        if (res?.errCode === 0 && res?.data) {
          let data = res.data;
          if (Array.isArray(data)) data = data[0] || {};

          const {
            totalProducts = 0, todayOrders = 0, totalRevenue = 0, totalUsers = 0, change = {},
          } = data;

          const {
            products: changeProducts = 0, orders: changeOrders = 0, revenue: changeRevenue = 0, users: changeUsers = 0,
          } = change;

          const formatCurrency = (value) =>
            Number(value).toLocaleString("vi-VN") + " ₫";

          setStats([
            {
              title: "Tổng sản phẩm",
              value: Number(totalProducts).toLocaleString(),
              icon: <FaBox />,
              change: `${changeProducts > 0 ? "+" : ""}${changeProducts}%`,
              isIncrease: changeProducts >= 0,
              link: "/admin/products",
            },
            {
              title: "Đơn hàng hôm nay",
              value: Number(todayOrders).toLocaleString(),
              icon: <FaShoppingCart />,
              change: `${changeOrders > 0 ? "+" : ""}${changeOrders}%`,
              isIncrease: changeOrders >= 0,
              link: "/admin/orders",
            },
            {
              title: "Doanh thu",
              value: formatCurrency(totalRevenue),
              icon: <FaDollarSign />,
              change: `${changeRevenue > 0 ? "+" : ""}${changeRevenue}%`,
              isIncrease: changeRevenue >= 0,
              link: "/admin/revenue",
            },
            {
              title: "Người dùng",
              value: Number(totalUsers).toLocaleString(),
              icon: <FaUsers />,
              change: `${changeUsers > 0 ? "+" : ""}${changeUsers}%`,
              isIncrease: changeUsers >= 0,
              link: "/admin/users",
            },
          ]);
        } else {
          setError("Không thể tải dữ liệu dashboard.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Lỗi kết nối server. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bảng điều khiển</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
            Tổng quan hệ thống & Phân tích kinh doanh
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm">
             Xuất báo cáo
           </button>
           <Link 
             to="/admin/products" 
             className="px-6 py-2.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-primary/20"
           >
             Thêm sản phẩm
           </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-soft">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
          <p className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-sm font-bold flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">!</div>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, i) => (
              <Link key={i} to={item.link} className="block group">
                <StatsCard {...item} />
              </Link>
            ))}
          </div>

          {/* Charts Area */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden p-8 md:p-10">
             <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Dòng tiền & Hiệu suất</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biểu đồ phân tích doanh thu chi tiết</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Updates</span>
                </div>
             </div>
             <ChartCard token={token} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

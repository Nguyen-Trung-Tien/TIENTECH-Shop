import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  FiSearch, FiPackage, FiShoppingBag, FiUsers, 
  FiArrowRight, FiEdit2, FiTrash2, FiEye, FiX
} from "react-icons/fi";
import { globalSearchApi } from "../../../api/adminApi";
import { AdminTableSkeleton } from "../../components/AdminLoading";
import { motion as Motion } from "framer-motion";

const AdminSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await globalSearchApi(query);
      if (res && res.errCode === 0) {
        // Đảm bảo dữ liệu luôn là array để tránh lỗi .length
        setResults({
          products: res.data?.products || [],
          orders: res.data?.orders || [],
          users: res.data?.users || [],
        });
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      // Giả lập hiệu ứng mượt mà
      setTimeout(() => setLoading(false), 500);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const SectionHeader = ({ icon: Icon, title, count, colorClass }) => (
    <div className="flex items-center justify-between mb-6 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
          <Icon />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">{title}</h3>
          <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary font-bold uppercase">Tìm thấy {count} kết quả</p>
        </div>
      </div>
    </div>
  );

  // Tính tổng kết quả an toàn
  const totalCount = (results?.products?.length || 0) + 
                     (results?.orders?.length || 0) + 
                     (results?.users?.length || 0);

  return (
    <div className="space-y-10 pb-20 p-4 md:p-0">
      {/* Header Info */}
      <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-dark-border shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            <FiSearch className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            Kết quả tìm kiếm
          </h1>
          <p className="text-slate-500 dark:text-dark-text-secondary font-bold mt-2 ml-1">
            Đang hiển thị kết quả cho từ khóa: <span className="text-indigo-600 dark:text-indigo-400 italic">"{query}"</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-bg p-2 rounded-2xl border border-slate-200/50 dark:border-dark-border">
           <div className="px-6 py-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm text-center border border-transparent dark:border-dark-border">
              <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest block mb-1">Tổng cộng</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCount}
              </span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-12">
          <div className="space-y-4">
             <div className="h-10 w-48 bg-slate-100 dark:bg-dark-surface animate-pulse rounded-xl" />
             <AdminTableSkeleton rows={3} cols={5} />
          </div>
          <div className="space-y-4">
             <div className="h-10 w-48 bg-slate-100 dark:bg-dark-surface animate-pulse rounded-xl" />
             <AdminTableSkeleton rows={3} cols={5} />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Products Results */}
          <section>
            <SectionHeader 
              icon={FiPackage} 
              title="Sản phẩm" 
              count={results.products?.length || 0} 
              colorClass="bg-indigo-600" 
            />
            {results.products?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.products.map((p, idx) => (
                  <Motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-dark-surface rounded-[2rem] border border-slate-100 dark:border-dark-border p-5 shadow-soft hover:shadow-xl dark:hover:shadow-none transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border p-2 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        <img src={p.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {p.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
                          SKU: {p.sku || "N/A"}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(p.basePrice || 0)}</span>
                          <button 
                             onClick={() => navigate(`/admin/product/edit/${p.id}`)}
                             className="p-2 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-dark-text-secondary rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                          >
                             <FiEdit2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-dark-bg/50 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-dark-border transition-colors">
                <p className="text-slate-400 dark:text-dark-text-secondary font-bold text-sm italic">Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </section>

          {/* Orders Results */}
          <section>
            <SectionHeader 
              icon={FiShoppingBag} 
              title="Đơn hàng" 
              count={results.orders?.length || 0} 
              colorClass="bg-emerald-500" 
            />
            {results.orders?.length > 0 ? (
               <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden transition-colors">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">Mã đơn</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">Khách hàng</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">Ngày đặt</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">Tổng tiền</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-center">Trạng thái</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                        {results.orders.map((o) => (
                          <tr 
                            key={o.id} 
                            className="hover:bg-emerald-50/10 dark:hover:bg-emerald-500/5 transition-colors group cursor-pointer"
                            onClick={() => navigate(`/admin/orders?search=${o.orderCode}`)}
                          >
                            <td className="px-8 py-4">
                              <span className="text-sm font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">#{o.orderCode}</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-sm font-bold text-slate-600 dark:text-dark-text-secondary transition-colors">{o.user?.username || "Ẩn danh"}</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : "—"}</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <span className="text-sm font-black text-slate-900 dark:text-white transition-colors">{formatPrice(o.totalPrice || 0)}</span>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <button 
                                className="p-2.5 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-dark-text-secondary rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm dark:border dark:border-transparent dark:group-hover:border-emerald-500"
                              >
                                <FiEye />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-dark-bg/50 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-dark-border transition-colors">
                <p className="text-slate-400 dark:text-dark-text-secondary font-bold text-sm italic">Không tìm thấy đơn hàng nào</p>
              </div>
            )}
          </section>

          {/* Users Results */}
          <section>
            <SectionHeader 
              icon={FiUsers} 
              title="Khách hàng" 
              count={results.users?.length || 0} 
              colorClass="bg-rose-500" 
            />
            {results.users?.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.users.map((u) => (
                    <div key={u.id} className="bg-white dark:bg-dark-surface rounded-[2rem] border border-slate-100 dark:border-dark-border p-6 shadow-soft hover:shadow-xl dark:hover:shadow-none transition-all group text-center">
                       <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 dark:text-rose-400 text-2xl font-black mx-auto mb-4 group-hover:bg-rose-500 dark:group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                          {u.username?.charAt(0).toUpperCase() || "U"}
                       </div>
                       <h4 className="font-black text-slate-800 dark:text-white truncate">{u.username}</h4>
                       <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-bold mt-1 truncate">{u.email}</p>
                       <button 
                        onClick={() => navigate(`/admin/users?editId=${u.id}`)}
                        className="mt-6 w-full py-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-dark-text-secondary rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm dark:border dark:border-transparent dark:hover:border-rose-500"
                       >
                         Quản lý khách hàng
                       </button>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-dark-bg/50 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-dark-border transition-colors">
                <p className="text-slate-400 dark:text-dark-text-secondary font-bold text-sm italic">Không tìm thấy khách hàng nào</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Empty State */}
      {!loading && totalCount === 0 && (
        <div className="py-20 text-center bg-white dark:bg-dark-surface rounded-[3rem] border border-slate-100 dark:border-dark-border shadow-xl transition-colors">
           <div className="w-24 h-24 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <FiX className="text-slate-200 dark:text-dark-border text-5xl" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">Rất tiếc, không có kết quả nào!</h2>
           <p className="text-slate-400 dark:text-dark-text-secondary font-bold mt-2">Vui lòng thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.</p>
           <button 
            onClick={() => navigate('/admin/dashboard')}
            className="mt-10 px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all shadow-lg"
           >
             Quay lại Dashboard
           </button>
        </div>
      )}
    </div>
  );
};

export default AdminSearch;

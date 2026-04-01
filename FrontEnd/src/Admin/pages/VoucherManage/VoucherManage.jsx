import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiDollarSign } from "react-icons/fi";
import { toast } from "react-toastify";
import { getAllVouchersApi, createVoucherApi, deleteVoucherApi } from "../../../api/voucherApi";
import { ConfirmModal } from "../../../components/UI/Modal";

const VoucherManage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, code: "" });
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderValue: 0,
    maxDiscount: "",
    maxUsage: 100,
    expiryDate: "",
  });

  const fetchVouchers = async () => {
    setLoading(true);
    const res = await getAllVouchersApi();
    if (res.errCode === 0) {
      setVouchers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createVoucherApi(newVoucher);
    if (res.errCode === 0) {
      toast.success("Tạo mã giảm giá thành công!");
      setShowModal(false);
      fetchVouchers();
    } else {
      toast.error(res.errMessage);
    }
  };

  const handleDelete = async () => {
    const res = await deleteVoucherApi(confirmModal.id);
    if (res.errCode === 0) {
      toast.success("Đã xóa mã giảm giá.");
      fetchVouchers();
    }
    setConfirmModal({ show: false, id: null, code: "" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã giảm giá</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all"
        >
          <FiPlus /> Thêm mã mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Mã</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Giá trị</th>
              <th className="px-6 py-4">Đơn tối thiểu</th>
              <th className="px-6 py-4">Lượt dùng</th>
              <th className="px-6 py-4">Hạn dùng</th>
              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">{v.code}</td>
                <td className="px-6 py-4 capitalize">{v.type === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">
                  {v.type === 'percentage' ? `${v.value}%` : `${Number(v.value).toLocaleString()}₫`}
                </td>
                <td className="px-6 py-4">{Number(v.minOrderValue).toLocaleString()}₫</td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">
                    {v.usedCount} / {v.maxUsage}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(v.expiryDate) < new Date() ? (
                    <span className="text-red-500 font-bold">Hết hạn</span>
                  ) : (
                    new Date(v.expiryDate).toLocaleDateString("vi-VN")
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setConfirmModal({ show: true, id: v.id, code: v.code })}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiTag className="text-primary" /> Tạo mã giảm giá mới
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mã giảm giá</label>
                <input
                  required
                  type="text"
                  placeholder="VD: GIAMGIA10"
                  className="w-full border p-3 rounded-xl uppercase font-bold"
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Loại</label>
                  <select
                    className="w-full border p-3 rounded-xl"
                    onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Cố định (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Giá trị</label>
                  <input
                    required
                    type="number"
                    className="w-full border p-3 rounded-xl font-bold"
                    onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Đơn tối thiểu</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xl"
                    onChange={(e) => setNewVoucher({ ...newVoucher, minOrderValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Lượt dùng tối đa</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xl"
                    onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ngày hết hạn</label>
                <input
                  required
                  type="date"
                  className="w-full border p-3 rounded-xl"
                  onChange={(e) => setNewVoucher({ ...newVoucher, expiryDate: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-grow bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                >
                  Lưu mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, id: null, code: "" })}
        onConfirm={handleDelete}
        title="Xóa mã giảm giá?"
        message={`Bạn có chắc chắn muốn xóa mã ${confirmModal.code}? Hành động này không thể hoàn tác.`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default VoucherManage;

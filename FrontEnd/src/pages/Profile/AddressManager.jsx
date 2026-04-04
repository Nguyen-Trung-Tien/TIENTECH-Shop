import { useState, useEffect } from "react";
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
} from "../../api/addressApi";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiMapPin,
  FiPhone,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiMoreVertical,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button, Modal } from "../../components/UI";
import Badge from "../../components/UI/Badge";
import { ConfirmModal } from "../../components/UI/Modal";

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    show: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    detailAddress: "",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await getAddressesApi();
      if (res.errCode === 0) {
        setAddresses(res.data);
      }
    } catch (error) {
      console.error("Fetch addresses error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        fullName: address.fullName,
        phone: address.phone,
        province: address.province,
        ward: address.ward,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: "",
        phone: "",
        province: "",
        ward: "",
        detailAddress: "",
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let res;
      if (editingAddress) {
        res = await updateAddressApi(editingAddress.id, formData);
      } else {
        res = await createAddressApi(formData);
      }

      if (res.errCode === 0) {
        toast.success(res.errMessage);
        setShowModal(false);
        fetchAddresses();
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý địa chỉ");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteAddressApi(confirmDeleteModal.id);
      if (res.errCode === 0) {
        toast.success(res.errMessage);
        fetchAddresses();
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa địa chỉ");
    }
    setConfirmDeleteModal({ show: false, id: null });
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await setDefaultAddressApi(id);
      if (res.errCode === 0) {
        toast.success(res.errMessage);
        fetchAddresses();
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi thiết lập mặc định");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">
          Sổ địa chỉ
        </h3>
        <Button
          variant="primary"
          size="sm"
          icon={FiPlus}
          onClick={() => handleOpenModal()}
        >
          THÊM ĐỊA CHỈ MỚI
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-10 text-center text-surface-400 dark:text-dark-text-secondary">
            Đang tải địa chỉ...
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-10 text-center bg-surface-50 dark:bg-dark-bg rounded-2xl border-2 border-dashed border-surface-200 dark:border-dark-border">
            <FiMapPin className="mx-auto text-4xl text-surface-300 dark:text-dark-border mb-4" />
            <p className="text-surface-500 dark:text-dark-text-secondary font-medium">
              Bạn chưa có địa chỉ nào.
            </p>
          </div>
        ) : (
          addresses.map((addr) => (
            <Motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                addr.isDefault
                  ? "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/5"
                  : "bg-white dark:bg-dark-surface border-surface-100 dark:border-dark-border hover:border-surface-200 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-surface-900 dark:text-white text-lg">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="primary" className="text-[10px]">
                        MẶC ĐỊNH
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-surface-600 dark:text-dark-text-secondary">
                    <FiPhone size={14} className="text-primary" />
                    <span className="text-sm font-medium">{addr.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-surface-600 dark:text-dark-text-secondary max-w-lg">
                    <FiMapPin
                      size={14}
                      className="mt-1 text-primary shrink-0"
                    />
                    <span className="text-sm">
                      {[addr.detailAddress, addr.ward, addr.province]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(addr)}
                    className="p-2 text-surface-400 dark:text-dark-text-secondary hover:text-primary transition-colors bg-surface-50 dark:bg-dark-bg rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="p-2 text-surface-400 dark:text-dark-text-secondary hover:text-green-500 transition-colors bg-surface-50 dark:bg-dark-bg rounded-lg"
                        title="Thiết lập mặc định"
                      >
                        <FiCheckCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDeleteModal({ show: true, id: addr.id })
                        }
                        className="p-2 text-surface-400 dark:text-dark-text-secondary hover:text-red-500 transition-colors bg-surface-50 dark:bg-dark-bg rounded-lg"
                        title="Xóa"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                Họ và tên
              </label>
              <input
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-surface-900 dark:text-white"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                Số điện thoại
              </label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-surface-900 dark:text-white"
                placeholder="09xx xxx xxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                Tỉnh / Thành phố
              </label>
              <input
                required
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-surface-900 dark:text-white"
                placeholder="Ví dụ: Hà Nội"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                Phường / Xã
              </label>
              <input
                required
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-surface-900 dark:text-white"
                placeholder="Ví dụ: Phúc Xá"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
              Địa chỉ chi tiết
            </label>
            <textarea
              required
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-4 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold resize-none text-surface-900 dark:text-white"
              placeholder="Số nhà, tên đường..."
            ></textarea>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-5 h-5 rounded border-surface-300 dark:border-dark-border text-primary focus:ring-primary dark:bg-dark-bg"
            />
            <span className="text-sm font-bold text-surface-600 dark:text-dark-text-secondary group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
              Đặt làm địa chỉ mặc định
            </span>
          </label>

          <div className="flex gap-4 pt-4 border-t border-surface-100 dark:border-dark-border">
            <Button
              variant="secondary"
              className="flex-1"
              type="button"
              onClick={() => setShowModal(false)}
            >
              HỦY BỎ
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              type="submit"
              loading={submitLoading}
            >
              {editingAddress ? "LƯU THAY ĐỔI" : "THÊM ĐỊA CHỈ"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Xác nhận xóa địa chỉ?"
        message="Hành động này sẽ gỡ bỏ địa chỉ này khỏi danh sách của bạn."
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default AddressManager;

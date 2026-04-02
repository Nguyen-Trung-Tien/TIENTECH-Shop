import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

/**
 * Custom hook for Admin CRUD pages logic
 * @param {object} api - API object from createCrudApi
 * @param {object} options - Configuration options
 */
export const useAdminCrud = (api, options = {}) => {
  const {
    initialLimit = 10,
    searchDebounceTime = 500,
    itemName = "Dữ liệu",
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(initialLimit);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const searchTimeoutRef = useRef(null);

  const fetchData = useCallback(
    async (currentPage = 1, currentSearch = "", extraParams = {}) => {
      setLoading(true);
      try {
        const res = await api.getAll(currentPage, limit, currentSearch, extraParams);
        if (res.errCode === 0) {
          // Normalize different response structures from existing APIs
          const items = res.data || res.brands || res.categories || res.vouchers || [];
          setData(items);
          
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
            setPage(res.pagination.currentPage || 1);
            setTotalItems(res.pagination.totalItems || 0);
          }
        } else {
          toast.error(res.errMessage || `Lỗi tải danh sách ${itemName}`);
        }
      } catch (err) {
        console.error(`Error fetching ${itemName}:`, err);
        toast.error("Không thể kết nối server");
      } finally {
        setLoading(false);
      }
    },
    [api, limit, itemName]
  );

  useEffect(() => {
    if (fetchOnMount) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        fetchData(1, searchTerm);
      }, searchDebounceTime);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchData, searchTerm, searchDebounceTime, fetchOnMount]);

  const handleShowModal = (item = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      let res;
      if (editingItem) {
        res = await api.update(editingItem.id, payload);
      } else {
        res = await api.create(payload);
      }

      if (res.errCode === 0) {
        toast.success(editingItem ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchData(page, searchTerm);
        handleCloseModal();
        return { success: true, data: res.data };
      } else {
        toast.error(res.errMessage || "Thao tác thất bại");
        return { success: false, error: res.errMessage };
      }
    } catch (err) {
      console.error(`Error saving ${itemName}:`, err);
      toast.error("Lỗi kết nối máy chủ");
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      const res = await api.delete(deletingItem.id);
      if (res.errCode === 0) {
        toast.success(`Đã xóa ${itemName}!`);
        // If last item on page and not first page, go back one page
        const newPage = data.length === 1 && page > 1 ? page - 1 : page;
        fetchData(newPage, searchTerm);
      } else {
        toast.error(res.errMessage || "Không thể xóa");
      }
    } catch (err) {
      console.error(`Error deleting ${itemName}:`, err);
      toast.error("Lỗi khi xóa");
    } finally {
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
  };

  return {
    data,
    loading,
    saving,
    showModal,
    editingItem,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalItems,
    fetchData,
    handleShowModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    confirmDelete,
  };
};

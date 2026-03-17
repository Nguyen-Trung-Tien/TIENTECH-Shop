import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Spinner,
  Form,
  Modal,
  InputGroup,
  Card,
  Badge,
} from "react-bootstrap";
import {
  Trash3,
  StarFill,
  PersonFill,
  Calendar3,
  ReplyFill,
  SendFill,
  FilterSquare,
} from "react-bootstrap-icons";
import { deleteReviewApi, getAllReviewsApi } from "../../../api/reviewApi";
import {
  getRepliesByReviewApi,
  createReplyApi,
  deleteReplyApi,
} from "../../../api/reviewReplyApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "./ReviewPage.scss";
import AppPagination from "../../../components/Pagination/Pagination";

const ReviewPage = () => {
  const token = useSelector((state) => state.user.token);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const [filters, setFilters] = useState({ rating: "", status: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllReviewsApi(
        pagination.page,
        pagination.limit,
        filters.rating,
        filters.status,
        token,
      );

      setReviews(res.data || []);
      setPagination((prev) => res.pagination || prev);

      const newReplies = {};
      for (let r of res.data) {
        const rep = await getRepliesByReviewApi(r.id);
        if (rep.errCode === 0) newReplies[r.id] = rep.data;
      }
      setReplies(newReplies);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async () => {
    try {
      await deleteReviewApi(selectedReview.id, token);
      setShowDeleteModal(false);
      fetchReviews();
      toast.success("Đã xóa bình luận");
    } catch (e) {
      console.log(e);
      toast.error("Xóa thất bại");
    }
  };

  const handleCreateReply = async (reviewId) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) return;

    try {
      const res = await createReplyApi({ reviewId, comment: content }, token);
      if (res.errCode === 0) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: [...(prev[reviewId] || []), res.data],
        }));
        setReplyInputs((p) => ({ ...p, [reviewId]: "" }));
      }
      toast.success("Đã phản hồi");
    } catch (e) {
      console.log(e);
      toast.error("Phản hồi thất bại");
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    try {
      const res = await deleteReplyApi(replyId, token);
      if (res.errCode === 0) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: prev[reviewId].filter((x) => x.id !== replyId),
        }));
        toast.success("Đã xóa phản hồi");
      }
    } catch {
      toast.error("Xóa phản hồi thất bại");
    }
  };

  return (
    <div className="review-page container-fluid">
      <h3 className="fw-semibold mb-4">
        <FilterSquare className="me-2" color="var(--primary-color)" size={28} />
        Quản lý đánh giá
      </h3>

      {/* Filters */}
      <Card className="mb-4 p-3 shadow-sm filter-card">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <Form.Select
            className="filter-select"
            value={filters.rating}
            onChange={(e) =>
              setFilters((p) => ({ ...p, rating: e.target.value }))
            }
          >
            <option value="">Lọc theo sao</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} sao
              </option>
            ))}
          </Form.Select>

          <Form.Select
            className="filter-select"
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
          >
            <option value="">Trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
          </Form.Select>

          <Button
            variant="secondary"
            onClick={() => setFilters({ rating: "", status: "" })}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Review List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="review-card shadow-sm mb-3">
            <Card.Body>
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <PersonFill className="text-primary" />
                  <strong>{review.user?.username || "Unknown"}</strong>

                  <Badge bg="light" text="dark" className="ms-2">
                    {review.product?.name}
                  </Badge>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarFill key={i} className="text-warning" />
                  ))}

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash3 size={14} />
                  </Button>
                </div>
              </div>

              {/* Comment */}
              <div className="review-comment mb-2 px-1">{review.comment}</div>

              {/* Date */}
              <div className="review-date text-muted small mb-3">
                <Calendar3 className="me-1" />
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </div>

              {/* Replies */}
              {(replies[review.id] || []).map((rep) => (
                <Card key={rep.id} className="reply-card p-2 mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <ReplyFill className="text-info me-1" />
                      <strong>{rep.user.username}</strong>: {rep.comment}
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteReply(review.id, rep.id)}
                    >
                      <Trash3 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add reply */}
              <InputGroup className="mt-2">
                <Form.Control
                  placeholder="Nhập phản hồi..."
                  value={replyInputs[review.id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [review.id]: e.target.value,
                    }))
                  }
                />

                <Button
                  variant="primary"
                  onClick={() => handleCreateReply(review.id)}
                >
                  <SendFill />
                </Button>
              </InputGroup>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Pagination */}
      <AppPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        loading={loading}
        onPageChange={(p) =>
          setPagination((prev) => ({
            ...prev,
            page: p,
          }))
        }
      />

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa bình luận này?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewPage;

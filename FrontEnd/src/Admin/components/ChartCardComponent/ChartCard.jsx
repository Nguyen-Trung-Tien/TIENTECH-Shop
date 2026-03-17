import { useState, useEffect, useCallback } from "react";
import { Card, ButtonGroup, Button, Badge } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiRefreshCw, FiBarChart } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion } from "motion/react"; // eslint-disable-line no-unused-vars
import "./ChartCard.scss";
import { getDashboard } from "../../../api/adminApi";

const PERIOD = { WEEK: "week", MONTH: "month", YEAR: "year" };

const FALLBACK_DATA = {
  [PERIOD.WEEK]: [
    { name: "T2", value: 300000 },
    { name: "T3", value: 420000 },
    { name: "T4", value: 650000 },
    { name: "T5", value: 500000 },
    { name: "T6", value: 720000 },
    { name: "T7", value: 680000 },
    { name: "CN", value: 803000000 },
  ],
  [PERIOD.MONTH]: Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    value: Math.floor(Math.random() * 300000) + 200000,
  })),
  [PERIOD.YEAR]: Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    value: Math.floor(Math.random() * 5000000) + 10000000,
  })),
};

const convertRevenueData = (arr, labelKey, valueKey) =>
  (arr || []).map((item) => ({
    name: item[labelKey] ?? "N/A",
    value: parseFloat(item[valueKey]) || 0,
  }));

const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString("vi-VN");
};

const ChartCard = ({ token }) => {
  const [type, setType] = useState(PERIOD.WEEK);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    revenueByWeek: [],
    revenueByMonth: [],
    revenueByYear: [],
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboard(token);

      if (res?.errCode === 0 && res.data) {
        setDashboardData({
          totalRevenue: parseFloat(res.data.totalRevenue) || 0,
          revenueByWeek: convertRevenueData(
            res.data.revenueByWeek,
            "date",
            "revenue",
          ),
          revenueByMonth: convertRevenueData(
            res.data.revenueByMonth,
            "date",
            "revenue",
          ),
          revenueByYear: convertRevenueData(
            res.data.revenueByYear,
            "date",
            "revenue",
          ),
        });
      } else {
        toast.warning("Không tải được dữ liệu");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const dataMap = {
    [PERIOD.WEEK]: dashboardData.revenueByWeek,
    [PERIOD.MONTH]: dashboardData.revenueByMonth,
    [PERIOD.YEAR]: dashboardData.revenueByYear,
  };

  const selectedData =
    dataMap[type]?.length > 0 ? dataMap[type] : FALLBACK_DATA[type];
  const hasData = selectedData.some((d) => d.value > 0);

  const periodLabel =
    type === PERIOD.WEEK
      ? "Tuần này"
      : type === PERIOD.MONTH
        ? "Tháng này"
        : "Năm nay";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card
        className="border-0 shadow-sm overflow-hidden"
        style={{
          borderRadius: "1rem",
          background: "white",
          border: "1px solid #e0e0e0",
        }}
      >
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 className="fw-bold text-dark mb-1">
                Doanh thu {periodLabel}
              </h5>
              <p className="text-muted small mb-0">
                Cập nhật: {new Date().toLocaleString("vi-VN")}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline-primary"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={fetchDashboard}
              disabled={loading}
              style={{ borderRadius: "0.75rem" }}
            >
              <FiRefreshCw size={14} className={loading ? "spin" : ""} />
              {loading ? "Đang tải..." : "Làm mới"}
            </Button>
          </div>

          <div className="text-center py-2 px-4 bg-primary bg-opacity-10 rounded-3 mb-3">
            <p className="mb-1 text-muted small fw-medium">Tổng doanh thu</p>
            <h3 className="fw-bold text-primary mb-0">
              {formatCurrency(dashboardData.totalRevenue)} ₫
            </h3>
          </div>

          <div className="d-flex justify-content-center mb-2">
            <ButtonGroup className="shadow-sm">
              {Object.values(PERIOD).map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={type === period ? "primary" : "outline-secondary"}
                  className="text-capitalize fw-medium px-3"
                  onClick={() => setType(period)}
                  style={{ borderRadius: "0.75rem" }}
                >
                  {period === "week"
                    ? "Tuần"
                    : period === "month"
                      ? "Tháng"
                      : "Năm"}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          <div className="bg-light rounded-3 p-3" style={{ minHeight: 300 }}>
            {loading ? (
              <div className="d-flex flex-column gap-3">
                <div
                  className="skeleton"
                  style={{ height: 20, borderRadius: 8 }}
                ></div>
                <div
                  className="skeleton"
                  style={{ height: 20, borderRadius: 8 }}
                ></div>
                <div
                  className="skeleton flex-grow-1"
                  style={{ borderRadius: 12 }}
                ></div>
              </div>
            ) : hasData || selectedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={selectedData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#e9ecef" />
                  <XAxis
                    dataKey="name"
                    stroke="#6c757d"
                    fontSize={12}
                    tick={{ fill: "#6c757d" }}
                  />
                  <YAxis
                    stroke="#6c757d"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                    tick={{ fill: "#6c757d" }}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #dee2e6",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "14px",
                    }}
                    labelStyle={{ color: "#495057", fontWeight: 600 }}
                    formatter={(value) => [
                      `${value.toLocaleString("vi-VN")} ₫`,
                      "Doanh thu",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary-color)"
                    strokeWidth={3}
                    dot={{ fill: "var(--primary-color)", r: 5 }}
                    activeDot={{ r: 8, stroke: "#fff", strokeWidth: 3 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-2 text-muted">
                <FiBarChart size={48} className="mb-3 opacity-50" />
                <p className="mb-0">
                  Chưa có dữ liệu {periodLabel.toLowerCase()}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-2">
            <Badge
              bg="light"
              text="dark"
              className="px-3 py-2 fw-medium border"
            >
              {selectedData.length} điểm dữ liệu
            </Badge>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ChartCard;

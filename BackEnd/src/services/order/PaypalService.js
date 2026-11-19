const axios = require("axios");
const SystemSettingService = require("../system/SystemSettingService");

const getPaypalConfig = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
  const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  const apiBase =
    process.env.PAYPAL_API_BASE ||
    (mode === "live" || mode === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com");

  return {
    clientId,
    clientSecret,
    apiBase,
    configured: Boolean(clientId && clientSecret),
  };
};

const isPaypalConfigured = () => getPaypalConfig().configured;

const convertVndToUsd = async (vndAmount) => {
  let rate = 25000;
  try {
    const configuredRate = Number(
      await SystemSettingService.getSetting("USD_VND_RATE", 25000)
    );
    if (Number.isFinite(configuredRate) && configuredRate > 0) {
      rate = configuredRate;
    }
  } catch {
    rate = 25000;
  }

  const numericVnd = Math.max(0, Number(vndAmount) || 0);
  const usd = Math.max(0.01, Number((numericVnd / rate).toFixed(2)));
  return usd.toFixed(2);
};

const getAccessToken = async () => {
  const { clientId, clientSecret, apiBase, configured } = getPaypalConfig();
  if (!configured) {
    const err = new Error("PayPal credentials are not configured on server");
    err.statusCode = 503;
    throw err;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await axios.post(
    `${apiBase}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    }
  );

  if (!resp.data?.access_token) {
    throw new Error("Failed to obtain PayPal access token");
  }
  return { accessToken: resp.data.access_token, apiBase };
};

const createPaypalOrder = async ({ orderCode, totalPriceVnd }) => {
  if (!isPaypalConfigured()) {
    return {
      errCode: 503,
      errMessage: "Thanh toán PayPal chưa được cấu hình đầy đủ trên máy chủ.",
    };
  }

  try {
    const { accessToken, apiBase } = await getAccessToken();
    const usdAmount = await convertVndToUsd(totalPriceVnd);

    const resp = await axios.post(
      `${apiBase}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: String(orderCode),
            custom_id: String(orderCode),
            amount: {
              currency_code: "USD",
              value: usdAmount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (!resp.data?.id) {
      return {
        errCode: 502,
        errMessage: "PayPal không trả về mã đơn thanh toán.",
      };
    }

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        paypalOrderId: resp.data.id,
        status: resp.data.status,
        usdAmount,
        currency: "USD",
      },
    };
  } catch (err) {
    console.error("[PaypalService] createPaypalOrder error:", err.response?.data || err.message);
    return {
      errCode: err.statusCode || 502,
      errMessage: "Không thể khởi tạo giao dịch PayPal lúc này. Vui lòng thử lại.",
    };
  }
};

const capturePaypalOrder = async (paypalOrderId) => {
  if (!isPaypalConfigured()) {
    return {
      errCode: 503,
      errMessage: "Thanh toán PayPal chưa được cấu hình đầy đủ trên máy chủ.",
    };
  }

  if (!paypalOrderId || typeof paypalOrderId !== "string") {
    return {
      errCode: 1,
      errMessage: "Thiếu mã giao dịch PayPal.",
    };
  }

  try {
    const { accessToken, apiBase } = await getAccessToken();
    const resp = await axios.post(
      `${apiBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const unit = resp.data?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const orderStatus = String(resp.data?.status || "").toUpperCase();
    const captureStatus = String(capture?.status || "").toUpperCase();

    if (orderStatus !== "COMPLETED" || captureStatus !== "COMPLETED") {
      return {
        errCode: 2,
        errMessage: "Giao dịch PayPal chưa hoàn tất.",
      };
    }

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        paypalOrderId: resp.data.id || paypalOrderId,
        captureId: capture.id,
        status: captureStatus,
        amountUsd: capture.amount?.value,
        currency: capture.amount?.currency_code || "USD",
        customId: capture.custom_id || unit?.custom_id || unit?.reference_id || null,
      },
    };
  } catch (err) {
    console.error("[PaypalService] capturePaypalOrder error:", err.response?.data || err.message);
    return {
      errCode: err.statusCode || 502,
      errMessage: "Xác thực thanh toán PayPal thất bại.",
    };
  }
};

module.exports = {
  getPaypalConfig,
  isPaypalConfigured,
  convertVndToUsd,
  createPaypalOrder,
  capturePaypalOrder,
};

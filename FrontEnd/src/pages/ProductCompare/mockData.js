// FrontEnd/src/pages/ProductCompare/mockData.js

export const INITIAL_COMPARE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Laptop Asus ROG Strix G16 G614JIR",
    sku: "ROG-G614-I9",
    category: "laptop",
    price: 43990000,
    originalPrice: 48990000,
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    badge: "Bán chạy nhất",
    inStock: true,
    specs: {
      cpu: "Intel Core i9 14900HX (24C/32T, up to 5.8GHz)",
      gpu: "NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)",
      ram: "32GB DDR5 5600MHz (2 khe, nâng cấp tối đa 64GB)",
      storage: "1TB PCIe 4.0 NVMe M.2 SSD",
      display: '16.0" QHD+ 240Hz, 100% DCI-P3, ROG Nebula',
      battery: "90Wh Lithium-ion, sạc 330W qua cổng DC",
      weight: "2.50 kg",
      ports: "Thunderbolt 4, USB-C 3.2 Gen 2, HDMI 2.1, RJ-45 LAN",
      os: "Windows 11 Home bản quyền",
      warranty: "24 tháng chính hãng Asus Quốc Tế",
    },
    warrantySteps: [
      { step: "Năm 1", title: "Bảo hành toàn diện 1-đổi-1", done: true },
      { step: "Năm 2", title: "Bảo hành linh kiện & vệ sinh trọn đời", done: true },
    ]
  },
  {
    id: "prod-2",
    name: "Laptop Acer Predator Helios Neo 16 PHN16",
    sku: "ACER-PHN16-I7",
    category: "laptop",
    price: 37490000,
    originalPrice: 40990000,
    rating: 4.7,
    reviewsCount: 94,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    badge: "Tối ưu chi phí",
    inStock: true,
    specs: {
      cpu: "Intel Core i7 14700HX (20C/28T, up to 5.5GHz)",
      gpu: "NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)",
      ram: "16GB DDR5 5600MHz (2 khe, nâng cấp tối đa 32GB)",
      storage: "512GB PCIe 4.0 NVMe M.2 SSD",
      display: '16.0" WQXGA 165Hz, 100% sRGB, 500 nits',
      battery: "90Wh Lithium-ion, sạc 330W",
      weight: "2.60 kg",
      ports: "2x Thunderbolt 4, 3x USB 3.2 Gen 2, HDMI 2.1, MicroSD",
      os: "Windows 11 Home bản quyền",
      warranty: "12 tháng Acer 3S1 (Quá 3 ngày đổi máy mới)",
    },
    warrantySteps: [
      { step: "Gói 3S1", title: "Kiểm tra nhanh trong 72 giờ", done: true },
      { step: "Hết 3S1", title: "Đổi mới sản phẩm nếu linh kiện chờ lâu", done: false },
    ]
  },
  {
    id: "prod-3",
    name: "Laptop Lenovo Legion Pro 5 16IRX9",
    sku: "LEGION-PRO5-I9",
    category: "laptop",
    price: 45990000,
    originalPrice: 49990000,
    rating: 4.95,
    reviewsCount: 156,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    badge: "Hiệu năng cực đỉnh",
    inStock: true,
    specs: {
      cpu: "Intel Core i9 14900HX (24C/32T, up to 5.8GHz)",
      gpu: "NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)",
      ram: "32GB DDR5 5600MHz (2 khe, nâng cấp tối đa 64GB)",
      storage: "1TB PCIe 4.0 NVMe M.2 SSD",
      display: '16.0" WQXGA 240Hz, 500 nits, HDR 400, G-SYNC',
      battery: "80Wh Lithium-ion, sạc siêu tốc 300W",
      weight: "2.55 kg",
      ports: "USB-C 3.2 Gen 2 (DisplayPort 1.4 & 140W PD), HDMI 2.1",
      os: "Windows 11 Home bản quyền",
      warranty: "36 tháng Lenovo Legion Ultimate Support",
    },
    warrantySteps: [
      { step: "VIP 24/7", title: "Kỹ thuật viên phục vụ tận nhà", done: true },
      { step: "Năm 2-3", title: "Bảo hành toàn diện phần cứng cao cấp", done: true },
    ]
  }
];

export const AVAILABLE_CANDIDATES = [
  {
    id: "prod-4",
    name: "Laptop Dell Alienware m16 R2 Gaming",
    sku: "DELL-M16-ULTRA",
    price: 52990000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    specs: {
      cpu: "Intel Core Ultra 7 155H (16C/22T, NPU AI tích hợp)",
      gpu: "NVIDIA GeForce RTX 4070 8GB GDDR6 (140W)",
      ram: "32GB LPDDR5X 7467MHz",
      storage: "1TB PCIe 4.0 NVMe M.2 SSD",
      display: '16.0" QHD+ 240Hz, 100% sRGB, ComfortView Plus',
      battery: "90Wh Lithium-ion",
      weight: "2.61 kg",
      ports: "Thunderbolt 4, Type-C, HDMI 2.1",
      os: "Windows 11 Home",
      warranty: "12 tháng Dell ProSupport tại nhà"
    }
  },
  {
    id: "prod-5",
    name: "Laptop MSI Raider GE68 HX 14VGG",
    sku: "MSI-GE68-I9",
    price: 58990000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
    specs: {
      cpu: "Intel Core i9 14900HX (24C/32T)",
      gpu: "NVIDIA GeForce RTX 4070 8GB GDDR6",
      ram: "32GB DDR5 5600MHz",
      storage: "2TB PCIe 4.0 NVMe SSD",
      display: '16.0" UHD+ (3840x2400) Mini-LED 120Hz',
      battery: "99.9Wh (Giới hạn bay tối đa)",
      weight: "2.70 kg",
      ports: "Thunderbolt 4, SD Express card reader, HDMI 2.1",
      os: "Windows 11 Home",
      warranty: "24 tháng MSI Việt Nam"
    }
  }
];

export const SPEC_CATEGORIES = [
  {
    id: "performance",
    title: "1. Hiệu Năng & Vi Xử Lý",
    iconName: "Cpu",
    fields: [
      { key: "cpu", label: "Bộ vi xử lý (CPU)", highlightDiff: true },
      { key: "gpu", label: "Card đồ họa (GPU)", highlightDiff: true },
      { key: "ram", label: "Bộ nhớ RAM", highlightDiff: true },
      { key: "storage", label: "Ổ cứng lưu trữ (SSD)", highlightDiff: true },
    ]
  },
  {
    id: "display",
    title: "2. Màn Hình & Trải Nghiệm Thị Giác",
    iconName: "Monitor",
    fields: [
      { key: "display", label: "Kích thước & Tần số quét", highlightDiff: true },
    ]
  },
  {
    id: "battery-ports",
    title: "3. Pin, Cổng Kết Nối & Khối Lượng",
    iconName: "BatteryCharging",
    fields: [
      { key: "battery", label: "Dung lượng Pin & Bộ sạc", highlightDiff: true },
      { key: "weight", label: "Khối lượng thân máy", highlightDiff: true },
      { key: "ports", label: "Cổng kết nối mở rộng", highlightDiff: true },
    ]
  },
  {
    id: "software-warranty",
    title: "4. Hệ Điều Hành & Chính Sách Hậu Mãi",
    iconName: "ShieldCheck",
    fields: [
      { key: "os", label: "Hệ điều hành", highlightDiff: false },
      { key: "warranty", label: "Thời hạn & Gói bảo hành", highlightDiff: true },
    ]
  }
];


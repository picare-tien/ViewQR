import { useEffect, useState } from "react";

type ImageItem = {
  id: string;
  name: string;
  created: number;
  // Nếu backend trả về url trực tiếp thì thêm field này
  // url?: string;
};

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8c1lRQtQaXzcqGB7ciQk323Z0o7M8Hr1vNrefAyjl_kSD82Nnd3ihDZla5sXspjXu/exec";

export default function App() {
  const [barcode, setBarcode] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy barcode từ URL khi vào trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("barcode");
    if (code) {
      setBarcode(code);
      fetchImages(code);
    }
  }, []);

  const fetchImages = async (code?: string) => {
    const value = code || barcode;
    if (!value.trim()) return;

    setLoading(true);
    setError("");
    setImages([]);

    try {
  const res = await fetch(
    `${SCRIPT_URL}?action=list&barcode=${encodeURIComponent(value)}`
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();

  console.log("Dữ liệu thô từ API:", data); // Debug quan trọng!

  // Trường hợp 1: Backend trả về { success: true, data: [...] } hoặc { data: [...] }
  if (data.data && Array.isArray(data.data)) {
    setImages(data.data);
    if (data.data.length === 0) {
      setError("Không có ảnh cho barcode này");
    }
    return;
  }

  // Trường hợp 2: Backend trả về { success: true, images: [...] } hoặc tương tự
  if (data.images && Array.isArray(data.images)) {
    setImages(data.images);
    return;
  }

  // Trường hợp 3: Backend trả về mảng trực tiếp [...]
  if (Array.isArray(data)) {
    setImages(data);
    return;
  }

  // Nếu có success: false hoặc message lỗi
  if (data.success === false || data.message) {
    setError(data.message || "Lỗi từ server");
    return;
  }

  // Không khớp gì thì báo lỗi chung
  throw new Error("Định dạng dữ liệu không hỗ trợ");
} catch (err: any) {
  console.error(err);
  setError(err.message || "Không tải được hình ảnh. Vui lòng kiểm tra barcode và thử lại.");
}
  };

  return (
    <div style={styles.container}>
      <h2>📦 CẢM ƠN QUÝ KHÁCH ĐÃ TIN DÙNG SẢN PHẨM</h2>
      <h2> Mã đơn hàng của quý khách: {barcode}</h2>
      <h2> Hình ảnh sản phẩm khi xuất kho </h2>
      
      {images.length > 0 ? (
        <div style={styles.grid}>
          {images.map((img) => (
            <div key={img.id} style={styles.card}>
              {/* Đây là phần sửa chính: thêm thẻ img và src */}
              
              <img
                src={`https://drive.google.com/thumbnail?id=${img.id}&sz=w1000`}
                // Hoặc nếu backend trả về url đầy đủ thì dùng:
                // src={img.url || `https://lh3.googleusercontent.com/d/${img.id}`}
                
                alt={img.name || "Ảnh sản phẩm"}
                style={styles.image}
                
                
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.removeAttribute("hidden");
                }}
              />
              <p hidden>Không tải được ảnh này</p>

              <div style={{ marginTop: 12, color: "#555", fontSize: 14 }}>
  <strong>Tên file:</strong> {img.name || "Không có tên"} <br />
  <strong>Thời gian chụp/tạo:</strong> 
  <span style={{ color: "#1976d2", fontWeight: "bold" }}>
    {new Date(img.created).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </span>
</div>

            </div>
          ))}
        </div>
      ) : (
        !loading &&
        barcode && (
          <p style={{ color: "#666", marginTop: 20 }}>
            ❌ Không có ảnh cho barcode này
          </p>
        )
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 720,
    margin: "30px auto",
    padding: 20,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  button: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  grid: {
    marginTop: 24,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    border: "1px solid #ddd",
    padding: 12,
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  image: {
    width: "100%",
    maxHeight: "60vh",
    objectFit: "contain",
    background: "#f8f9fa",
    borderRadius: 4,
  },
};
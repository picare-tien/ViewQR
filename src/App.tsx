import { useEffect, useState } from "react";

type ImageItem = {
  id: string;
  name: string;
  created: number; // Backend đã trả timestamp number nhờ .getTime()
};

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8c1lRQtQaXzcqGB7ciQk323Z0o7M8Hr1vNrefAyjl_kSD82Nnd3ihDZla5sXspjXu/exec";

export default function App() {
  const [barcode, setBarcode] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading vì lấy từ URL
  const [error, setError] = useState<string | null>(null);

  // Lấy barcode từ URL và fetch ảnh ngay khi load trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("barcode");

    if (!code) {
      setError("Không tìm thấy mã đơn hàng trong liên kết.");
      setLoading(false);
      return;
    }

    setBarcode(code);
    fetchImages(code);
  }, []);

  const fetchImages = async (code: string) => {
    setLoading(true);
    setError(null);
    setImages([]);

    try {
      const res = await fetch(
        `${SCRIPT_URL}?action=list&barcode=${encodeURIComponent(code)}`
      );

      if (!res.ok) {
        throw new Error(`Lỗi kết nối: ${res.status}`);
      }

      const data = await res.json();
      console.log("Dữ liệu từ API:", data);

      let imageList: ImageItem[] = [];

      if (data.data && Array.isArray(data.data)) {
        imageList = data.data;
      } else if (data.images && Array.isArray(data.images)) {
        imageList = data.images;
      } else if (Array.isArray(data)) {
        imageList = data;
      } else if (data.success === false) {
        throw new Error(data.message || "Lỗi từ server");
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Sắp xếp ảnh mới nhất trước
      imageList.sort((a, b) => b.created - a.created);

      setImages(imageList);

      if (imageList.length === 0) {
        setError("Không tìm thấy ảnh nào cho mã đơn hàng này.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tải hình ảnh. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 CẢM ƠN QUÝ KHÁCH ĐÃ TIN DÙNG SẢN PHẨM</h1>
      
      {barcode && (
        <h2 style={styles.orderCode}>
          Mã đơn hàng của quý khách: <strong>{barcode}</strong>
        </h2>
      )}

      <h2 style={styles.subtitle}>Hình ảnh sản phẩm khi xuất kho</h2>

      {/* Loading */}
      {loading && (
        <p style={styles.loading}>⏳ Đang tải hình ảnh...</p>
      )}

      {/* Error */}
      {error && (
        <p style={styles.error}>⚠️ {error}</p>
      )}

      {/* Danh sách ảnh */}
      {images.length > 0 && (
        <div style={styles.grid}>
          {images.map((img) => (
            <div key={img.id} style={styles.card}>
              <img
                src={`https://drive.google.com/thumbnail?id=${img.id}&sz=w1000`}
                alt={img.name}
                style={styles.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  next?.removeAttribute("hidden");
                }}
              />
              <p hidden style={styles.imgError}>
                Không tải được ảnh này (có thể do quyền truy cập)
              </p>

              <div style={styles.info}>
                <div><strong>Tên file:</strong> {img.name}</div>
                <div>
                  <strong>Thời gian xuất kho:</strong>
                  <br />
                  <span style={styles.dateTime}>
                    {new Date(img.created).toLocaleString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Không có ảnh nhưng không lỗi */}
      {!loading && !error && images.length === 0 && barcode && (
        <p style={styles.noImage}>❌ Chưa có ảnh cho đơn hàng này</p>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "20px 16px",
    textAlign: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    background: "#f9f9f9",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    color: "#2e7d32",
    marginBottom: "16px",
    fontWeight: "bold",
  },
  orderCode: {
    fontSize: "22px",
    color: "#1976d2",
    margin: "20px 0",
  },
  subtitle: {
    fontSize: "20px",
    color: "#424242",
    margin: "30px 0 20px",
  },
  loading: {
    fontSize: "18px",
    color: "#666",
    margin: "40px 0",
  },
  error: {
    fontSize: "18px",
    color: "#d32f2f",
    background: "#ffebee",
    padding: "16px",
    borderRadius: "8px",
    margin: "20px 0",
    border: "1px solid #f44336",
  },
  noImage: {
    fontSize: "18px",
    color: "#666",
    margin: "60px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginTop: "32px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "16px",
  },
  image: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
  imgError: {
    color: "#d32f2f",
    textAlign: "center",
    padding: "20px",
    fontSize: "14px",
  },
  info: {
    marginTop: "16px",
    textAlign: "left",
    color: "#444",
    lineHeight: 1.6,
  },
  dateTime: {
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: "15px",
  },
};
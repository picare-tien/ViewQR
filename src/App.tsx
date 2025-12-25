import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

/** Ảnh trả về từ Google Script */
type ImageItem = {
  name: string
  url: string
  created?: number
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [barcode, setBarcode] = useState("")
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* 🔧 khởi tạo html5-qrcode (ẩn) */
  useEffect(() => {
    scannerRef.current = new Html5Qrcode("hidden-reader")

    return () => {
      try {
        scannerRef.current?.clear()
      } catch {}
    }
  }, [])

  /* 📸 chụp ảnh barcode → đọc barcode */
  const handleCaptureBarcode = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file || !scannerRef.current) return

    setError("")
    setLoading(true)
    setImages([])
    setBarcode("")

    try {
      const decodedText = await scannerRef.current.scanFile(file, true)
      setBarcode(decodedText)
      await fetchImages(decodedText)
    } catch {
      setError("❌ Không đọc được barcode, hãy chụp rõ nét hơn")
    } finally {
      setLoading(false)
      e.target.value = "" // cho phép chụp lại cùng ảnh
    }
  }

  /* 🔍 gọi API lấy ảnh theo barcode */
  const fetchImages = async (code: string) => {
    try {
      const res = await fetch(
        `https://script.google.com/macros/s/AKfycbzGn1Ye6Y2nUej5SE34z3as5ibXCOCJrfLD405zZLSW6xmygHgXGWDtSSQHK7EyN7xb/exec?barcode=${encodeURIComponent(
          code
        )}`
      )

      const data = await res.json()

      if (!Array.isArray(data)) {
        setError("Dữ liệu ảnh không hợp lệ")
        return
      }

      setImages(data)
    } catch {
      setError("Không tải được hình ảnh")
    }
  }

  return (
    <div style={styles.container}>
      <h2>📦 XEM ẢNH THEO BARCODE</h2>

      <button
        style={styles.button}
        onClick={() => fileInputRef.current?.click()}
      >
        📸 Chụp ảnh barcode
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCaptureBarcode}
        style={{ display: "none" }}
      />

      {/* html5-qrcode bắt buộc có div */}
      <div id="hidden-reader" style={{ display: "none" }} />

      {loading && <p>⏳ Đang xử lý...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {barcode && (
        <p>
          🔎 Barcode: <b>{barcode}</b>
        </p>
      )}

      {/* 🖼️ HIỂN THỊ ẢNH */}
      <div style={styles.imageGrid}>
        {images.map((img, index) => (
          <div key={index} style={styles.card}>
            <img src={img.url} alt={img.name} style={styles.image} />
            <p>{img.name}</p>
            {img.created && (
              <p style={styles.date}>
                {new Date(img.created).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && barcode && !loading && (
        <p>❌ Không có hình cho barcode này</p>
      )}
    </div>
  )
}

/* 🎨 style đơn giản */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: "30px auto",
    padding: 20,
    textAlign: "center",
    fontFamily: "Arial",
  },
  button: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  imageGrid: {
    marginTop: 20,
    display: "grid",
    gap: 16,
  },
  card: {
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 8,
  },
  image: {
    width: "100%",
    borderRadius: 6,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
}

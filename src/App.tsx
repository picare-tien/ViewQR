import { useRef, useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"

type OrderItem = {
  Ngay: string
  tenkhachhang: string
  SoluongSP: number
}

export default function App() {
  const photoBarcodeRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [result, setResult] = useState("")
  const [data, setData] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ✅ khởi tạo scanner ẩn
  useEffect(() => {
  scannerRef.current = new Html5Qrcode("hidden-reader")

  return () => {
    try {
      scannerRef.current?.clear()
    } catch {}
  }
}, [])


  // 🔹 CHỤP ẢNH BARCODE → ĐỌC BARCODE
  const handleBarcodeImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file || !scannerRef.current) return

    setError("")
    setLoading(true)
    setData([])

    try {
      const decodedText = await scannerRef.current.scanFile(file, true)
      setResult(decodedText)
      await callWebhook(decodedText)
    } catch {
      setError("❌ Không đọc được barcode, hãy chụp rõ hơn")
    } finally {
      setLoading(false)
      e.target.value = "" // cho phép chụp lại cùng ảnh
    }
  }

  // 🔗 gọi webhook lấy dữ liệu
  const callWebhook = async (code: string) => {
    try {
      const res = await fetch(
        `https://script.google.com/macros/s/XXXX/exec?barcode=${encodeURIComponent(
          code
        )}`
      )
      const json = await res.json()

      if (!Array.isArray(json)) {
        setError("Dữ liệu trả về không hợp lệ")
        return
      }

      setData(json)
    } catch {
      setError("Không gọi được dữ liệu")
    }
  }

  return (
    <div style={styles.container}>
      <h2>📷 CHỤP ẢNH BARCODE → XEM ĐƠN</h2>

      <button
        style={styles.button}
        onClick={() => photoBarcodeRef.current?.click()}
      >
        📸 Chụp ảnh barcode
      </button>

      <input
        ref={photoBarcodeRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleBarcodeImage}
        style={{ display: "none" }}
      />

      {/* html5-qrcode cần div tồn tại */}
      <div id="hidden-reader" style={{ display: "none" }} />

      {loading && <p>⏳ Đang xử lý...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <p>
          🔎 Barcode: <b>{result}</b>
        </p>
      )}

      {data.length > 0 && (
        <div style={styles.table}>
          {data.map((item, index) => (
            <div key={index} style={styles.card}>
              <p>📅 Ngày: {item.Ngay}</p>
              <p>👤 Khách hàng: {item.tenkhachhang}</p>
              <p>📦 Số lượng SP: {item.SoluongSP}</p>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && result && !loading && (
        <p>❌ Không có dữ liệu cho barcode này</p>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 500,
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
  table: {
    marginTop: 20,
    display: "grid",
    gap: 12,
  },
  card: {
    border: "1px solid #ddd",
    padding: 12,
    borderRadius: 6,
    textAlign: "left",
  },
}

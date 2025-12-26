import { useEffect, useState } from "react"

type ImageItem = {
  id: string
  name: string
  created: number
}

const SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec"

export default function App() {
  const [barcode, setBarcode] = useState("")
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 🔗 LẤY BARCODE TỪ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("barcode")

    if (code) {
      setBarcode(code)
      fetchImages(code)
    }
  }, [])

  // 🔍 GỌI API
  const fetchImages = async (code?: string) => {
    const value = code || barcode
    if (!value) return

    setLoading(true)
    setError("")
    setImages([])

    try {
      const res = await fetch(
        `${SCRIPT_URL}?action=list&barcode=${encodeURIComponent(value)}`
      )
      const data = await res.json()
      setImages(data)
    } catch {
      setError("Không tải được hình ảnh")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2>📦 XEM ẢNH THEO BARCODE</h2>

      <input
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Nhập barcode..."
        style={styles.input}
      />

      <button onClick={() => fetchImages()} style={styles.button}>
        🔍 Tìm ảnh
      </button>

      {loading && <p>⏳ Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.grid}>
        {images.map((img) => (
          <div key={img.id} style={styles.card}>
            <img
              src={`${SCRIPT_URL}?action=image&id=${img.id}`}
              style={styles.image}
              loading="lazy"
            />
            <p>{new Date(img.created).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {images.length === 0 && !loading && barcode && (
        <p>❌ Không có ảnh cho barcode này</p>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: "30px auto",
    padding: 20,
    textAlign: "center",
    fontFamily: "Arial",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  grid: {
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
    maxHeight: "70vh",
    objectFit: "contain",
    background: "#f5f5f5",
  },
}

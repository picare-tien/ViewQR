import {  useState } from "react"

type ImageItem = {
  name: string
  url: string
  created?: number
}

function App() {
  const [barcode, setBarcode] = useState("")
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 🔍 gọi API khi nhập barcode
  const fetchImages = async () => {
    if (!barcode) return

    setLoading(true)
    setError("")
    setImages([])

    try {
      const res = await fetch(
        `https://script.google.com/macros/s/XXXX/exec?barcode=${barcode}`
      )
      const data = await res.json()
      setImages(data)
    } catch (err) {
      setError("Không tải được hình ảnh")
    } finally {
      setLoading(false)
    }
  }

  // ⏎ Enter là tìm
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchImages()
    }
  }

  return (
    <div style={styles.container}>
      <h2>📦 XEM ẢNH THEO BARCODE</h2>

      <input
        type="text"
        placeholder="Nhập hoặc quét barcode..."
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
        style={styles.input}
      />

      <button onClick={fetchImages} style={styles.button}>
        🔍 Tìm ảnh
      </button>

      {loading && <p>⏳ Đang tải ảnh...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.imageGrid}>
        {images.map((img, index) => (
          <div key={index} style={styles.card}>
            <img src={img.url} alt={img.name} style={styles.image} />
            {img.created && (
              <p style={styles.date}>
                {new Date(img.created).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && !loading && (
        <p>❌ Không có ảnh cho barcode này</p>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: "20px auto",
    padding: 20,
    textAlign: "center",
    fontFamily: "Arial",
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
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
  imageGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 20,
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
    marginTop: 5,
  },
}

export default App

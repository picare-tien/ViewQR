import { useRef, useState } from "react"

type ImageItem = {
  name: string
  url: string
  created?: number
}

declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

function App() {
  const [barcode, setBarcode] = useState("")
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 🔍 gọi API
  const fetchImages = async (code: string) => {
    setLoading(true)
    setError("")
    setImages([])

    try {
      const res = await fetch(
        `https://script.google.com/macros/s/XXXX/exec?barcode=${code}`
      )
      const data = await res.json()
      setImages(data)
    } catch {
      setError("Không tải được hình ảnh")
    } finally {
      setLoading(false)
    }
  }

  // 📷 mở camera
  const openCamera = async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setError("Không mở được camera")
    }
  }

  // 📸 chụp ảnh + đọc barcode
  const captureAndDetect = async () => {
    if (!window.BarcodeDetector) {
      setError("Thiết bị không hỗ trợ đọc barcode")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    const detector = new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "code_128", "qr_code"],
    })

    const barcodes = await detector.detect(canvas)

    if (barcodes.length === 0) {
      setError("❌ Không tìm thấy barcode trong ảnh")
      return
    }

    const code = barcodes[0].rawValue
    setBarcode(code)
    fetchImages(code)

    // tắt camera
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  return (
    <div style={styles.container}>
      <h2>📦 CHỤP ẢNH → ĐỌC BARCODE → XEM ẢNH</h2>

      <button onClick={openCamera} style={styles.button}>
        📷 Mở camera
      </button>

      <video ref={videoRef} style={styles.video} />

      <button onClick={captureAndDetect} style={styles.captureBtn}>
        📸 Chụp ảnh & tìm barcode
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {barcode && <p>🔎 Barcode: <b>{barcode}</b></p>}
      {loading && <p>⏳ Đang tải ảnh...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.imageGrid}>
        {images.map((img, i) => (
          <div key={i} style={styles.card}>
            <img src={img.url} style={styles.image} />
            {img.created && (
              <p style={styles.date}>
                {new Date(img.created).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: "auto",
    padding: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#2196F3",
    color: "#fff",
    border: "none",
    fontSize: 16,
  },
  captureBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    fontSize: 16,
  },
  video: {
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
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
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
}

export default App

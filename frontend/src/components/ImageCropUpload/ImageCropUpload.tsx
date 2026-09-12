import { useRef, useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'

interface ImageCropUploadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
}

const OUTPUT_SIZE = 400

export default function ImageCropUpload({ value, onChange }: ImageCropUploadProps) {
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerSize = 220

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setRawImage(reader.result as string)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  function handlePointerUp() {
    dragStart.current = null
  }

  function handleConfirm() {
    if (!rawImage) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scale = Math.max(containerSize / img.width, containerSize / img.height) * zoom
      const drawWidth = img.width * scale
      const drawHeight = img.height * scale
      const outputScale = OUTPUT_SIZE / containerSize

      const dx = (containerSize / 2 - drawWidth / 2 + offset.x) * outputScale
      const dy = (containerSize / 2 - drawHeight / 2 + offset.y) * outputScale

      ctx.drawImage(img, dx, dy, drawWidth * outputScale, drawHeight * outputScale)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      onChange(dataUrl)
      setRawImage(null)
    }
    img.src = rawImage
  }

  if (rawImage) {
    return (
      <div>
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: containerSize,
            height: containerSize,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            background: '#000',
            cursor: 'grab',
            margin: '0 auto',
          }}
        >
          <img
            src={rawImage}
            alt="Crop preview"
            draggable={false}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              userSelect: 'none',
            }}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: containerSize, display: 'block', margin: '12px auto' }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setRawImage(null)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer' }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Gunakan Foto
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          background: 'var(--color-bg)',
          border: '1px dashed var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {value ? (
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImageIcon size={22} color="var(--color-text-muted)" />
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: 13,
            cursor: 'pointer',
            marginRight: 8,
          }}
        >
          {value ? 'Ganti Foto' : 'Unggah Foto'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              color: '#c0392b',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        )}
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
          Opsional. Rasio 1:1, otomatis dikompres.
        </div>
      </div>
    </div>
  )
}
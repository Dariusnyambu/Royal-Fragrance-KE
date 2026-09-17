import { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/api'
import { BUCKETS } from '@/lib/supabase'

export default function ImageUploader({ bucket = BUCKETS.products, images, onChange, multiple = true }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFiles(fileList) {
    setError('')
    setUploading(true)
    try {
      const files = Array.from(fileList)
      const urls = await Promise.all(files.map((file) => uploadImage(bucket, file)))
      onChange(multiple ? [...images, ...urls] : urls[0])
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url) {
    if (multiple) {
      onChange(images.filter((img) => img !== url))
    } else {
      onChange(null)
    }
  }

  const list = multiple ? images : images ? [images] : []

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {list.map((url) => (
          <div key={url} className="relative h-24 w-24 group">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-2 -right-2 bg-charcoal text-ivory rounded-full h-6 w-6 flex items-center justify-center"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <label className="inline-flex items-center gap-2 text-sm border border-dashed border-charcoal/25 px-4 py-2.5 cursor-pointer hover:border-gold-500">
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? 'Uploading...' : multiple ? 'Add Images' : 'Upload Image'}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  )
}

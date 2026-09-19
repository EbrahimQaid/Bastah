import { useState, useRef, useCallback } from "react";
import { Link2, Upload, X, ImagePlus, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  /** Current list of image URLs/base64 strings */
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

type Tab = "url" | "upload";

export function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [urlError, setUrlError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* ─── helpers ─── */
  const addImages = (newUrls: string[]) => {
    const merged = [...images, ...newUrls].slice(0, maxImages);
    onChange(merged);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  /* ─── URL tab ─── */
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/.test(url)) {
      setUrlError("يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://");
      return;
    }
    setUrlError("");
    addImages([url]);
    setUrlInput("");
  };

  /* ─── File → base64 ─── */
  const filesToBase64 = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) addImages([result]);
      };
      reader.readAsDataURL(file);
    });
  };

  /* ─── Drag & Drop ─── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    filesToBase64(e.dataTransfer.files);
  }, [images]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) filesToBase64(e.target.files);
    e.target.value = "";
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "upload"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          رفع صورة
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "url"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          رابط URL
        </button>
      </div>

      {/* ── Upload tab ── */}
      {tab === "upload" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => canAddMore && fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 select-none ${
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : canAddMore
              ? "border-gray-200 bg-gray-50 hover:border-primary/40 hover:bg-primary/5"
              : "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={!canAddMore}
          />

          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-primary/10" : "bg-white border border-gray-100 shadow-sm"}`}>
            {dragging ? (
              <CheckCircle2 className="w-7 h-7 text-primary" />
            ) : (
              <ImagePlus className="w-7 h-7 text-gray-300" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              {dragging ? "أفلت الصورة هنا!" : "اسحب الصورة هنا"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              أو <span className="text-primary font-bold">تصفح من جهازك</span> — PNG, JPG, WEBP
            </p>
            <p className="text-[10px] text-gray-300 mt-1 font-medium">
              {images.length}/{maxImages} صور
            </p>
          </div>
        </div>
      )}

      {/* ── URL tab ── */}
      {tab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal placeholder:text-gray-300"
                disabled={!canAddMore}
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim() || !canAddMore}
              className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              إضافة
            </button>
          </div>
          {urlError && <p className="text-xs text-red-400 font-medium">{urlError}</p>}
          {!canAddMore && (
            <p className="text-xs text-amber-500 font-medium">
              وصلت للحد الأقصى ({maxImages} صور). احذف صورة لإضافة أخرى.
            </p>
          )}
        </div>
      )}

      {/* ── Preview grid ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((src, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
              <img
                src={src}
                alt={`صورة ${i + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E"; }}
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full">
                  رئيسية
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

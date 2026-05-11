import { useRef, useState, useCallback } from "react";
import { Upload, Link2, X, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspectRatio?: "square" | "wide" | "tall";
}

export function ImageUpload({ value, onChange, label, hint, aspectRatio = "wide" }: ImageUploadProps) {
  const [tab, setTab] = useState<"url" | "drop">("url");
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const heightClass = aspectRatio === "square" ? "h-32" : aspectRatio === "tall" ? "h-48" : "h-36";

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      onChange(result);
      setUrlInput(result.substring(0, 40) + "...");
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlApply = () => {
    onChange(urlInput);
  };

  const hasImage = !!value;

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-gray-700">{label}</p>}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      {/* Tab switch */}
      <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "url" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Link2 className="w-3 h-3" /> URL
        </button>
        <button
          type="button"
          onClick={() => setTab("drop")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "drop" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
      </div>

      {tab === "url" ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleUrlApply())}
            placeholder="https://example.com/image.jpg"
            className="font-mono text-xs"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${heightClass} ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"}`}
        >
          <Upload className={`w-6 h-6 mb-2 transition-colors ${dragging ? "text-primary" : "text-gray-300"}`} />
          <p className="text-xs font-semibold text-gray-400">Drop image here or <span className="text-primary">browse</span></p>
          <p className="text-[10px] text-gray-300 mt-0.5">PNG, JPG, WebP supported</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Preview */}
      {hasImage && (
        <div className={`relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 ${heightClass}`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
          />
          <button
            type="button"
            onClick={() => { onChange(""); setUrlInput(""); }}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent flex items-end px-2 pb-1.5">
            <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Preview
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

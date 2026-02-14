import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface ImageUploadProps {
  currentImageUrl?: string;          // URL รูปเดิม (ถ้ามี)
  onUpload: (url: string) => void;   // Callback ส่ง URL กลับไปให้ Parent
  folder: 'avatars' | 'vehicles';    // ระบุว่าจะเก็บในโฟลเดอร์ไหน
  id: string;                        // ID ของ User หรือ Vehicle (ใช้ตั้งชื่อไฟล์)
}

export default function ImageUpload({ currentImageUrl, onUpload, folder, id }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // ตั้งชื่อไฟล์เป็น: folder/id-timestamp.ext เพื่อไม่ให้ชื่อซ้ำ
      const fileName = `${folder}/${id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      setUploading(true);

      // 1. Upload ไฟล์ขึ้น Supabase Storage Bucket 'images'
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. ขอ Public URL
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      // 3. อัปเดต State และส่ง URL กลับไป
      setPreview(data.publicUrl);
      onUpload(data.publicUrl);

    } catch (error: any) {
      console.error('Upload Error:', error);
      Swal.fire('Error', 'อัปโหลดรูปภาพไม่สำเร็จ', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload(''); // ส่งค่าว่างกลับไปเพื่อลบรูป
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Preview Area */}
      <div className="relative group">
        <div className={`
          w-40 h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-slate-50 transition-all
          ${preview ? 'border-primary/50' : 'border-slate-300 hover:border-primary/50 hover:bg-primary/5'}
        `}>
          {uploading ? (
            <div className="flex flex-col items-center text-primary">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs font-medium">กำลังอัปโหลด...</span>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-xs">ไม่มีรูปภาพ</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        {!uploading && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-hover transition-colors"
                title="เปลี่ยนรูปภาพ"
              >
                <Upload className="w-4 h-4" />
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-white text-red-500 border border-red-100 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="ลบรูปภาพ"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
          </div>
        )}
      </div>

      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      <p className="text-[10px] text-slate-400">
        รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB
      </p>
    </div>
  );
}
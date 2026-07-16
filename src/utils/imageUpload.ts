import { supabase } from "@/lib/supabase";

const BUCKET = "meal-images";
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/");

// 長辺を MAX_DIMENSION px に収め、JPEG に圧縮する（通信量・表示速度対策）
const resizeImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(
        1,
        MAX_DIMENSION / Math.max(img.width, img.height),
      );
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context の取得に失敗しました"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("画像の圧縮に失敗しました"));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = objectUrl;
  });

// リサイズ・圧縮した画像を Storage にアップロードし、保存パスを返す
export const uploadMealImage = async (
  userId: string,
  file: File,
): Promise<string> => {
  if (!supabase) throw new Error("Supabase is not configured");
  const blob = await resizeImage(file);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return path;
};

export const deleteMealImage = async (path: string): Promise<void> => {
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([path]);
};

export const getMealImageUrl = (path: string): string | null => {
  if (!supabase) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

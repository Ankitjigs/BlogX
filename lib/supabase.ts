import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  // For private buckets: use signed URL (valid for 1 year)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("blog-images")
    .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year in seconds

  if (signedError || !signedData?.signedUrl) {
    // Fallback to public URL if signed URL fails
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    return publicUrl;
  }

  return signedData.signedUrl;
}

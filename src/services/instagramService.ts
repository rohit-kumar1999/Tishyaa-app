import { useApiMutation, useApiQuery } from "@/hooks/useApiQuery";

// Instagram post interface
export interface InstagramPost {
  id: string;
  userId: string;
  instagramUrl: string | null;
  mediaUrl: string;
  mediaType: "image" | "video";
  isDisplayed: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create Instagram post request interface
export interface CreateInstagramPostRequest {
  userId: string;
  instagramUrl: string | null;
  mediaUrl: string;
  mediaType: "image" | "video";
  isDisplayed: boolean;
}

// Upload file response interface
export interface UploadFileResponse {
  url: string;
  public_id: string;
  media_type: "image" | "video";
  file_size: number;
  format: string;
  thumbnail_url?: string; // Available for videos
}

// API endpoints
const INSTAGRAM_ENDPOINT = "/instagram";
const UPLOAD_ENDPOINT = "/upload";

// Hook to get Instagram posts
export const useGetInstagramPosts = () => {
  return useApiQuery<InstagramPost[]>(INSTAGRAM_ENDPOINT);
};

// Hook to create Instagram post
export const useCreateInstagramPost = () => {
  return useApiMutation<InstagramPost, CreateInstagramPostRequest>(
    INSTAGRAM_ENDPOINT,
    {
      invalidateQueries: [INSTAGRAM_ENDPOINT],
      successMessage: "Your post has been submitted successfully! 🎉",
    }
  );
};

// Hook to upload file to Cloudinary
export const useUploadFile = () => {
  return useApiMutation<UploadFileResponse, FormData>(UPLOAD_ENDPOINT, {
    successMessage: "File uploaded successfully!",
    transformRequest: (formData: FormData) => {
      formData.append("folderName", "instagram");
      return formData;
    },
  });
};

// Helper function to create Instagram post data
export const createInstagramPostData = (
  userId: string,
  mediaUrl: string,
  mediaType: "image" | "video"
): CreateInstagramPostRequest => ({
  userId,
  instagramUrl: null, // As specified, keep it null
  mediaUrl,
  mediaType,
  isDisplayed: false,
});

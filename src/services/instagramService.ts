import { api } from "@/src/setup/api";
import { useCallback, useEffect, useState } from "react";

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

// Mock data for development
const mockInstagramPosts: InstagramPost[] = [
  {
    id: "1",
    userId: "user1",
    instagramUrl: "https://www.instagram.com/p/sample1",
    mediaUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    mediaType: "image",
    isDisplayed: true,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    userId: "user2",
    instagramUrl: "https://www.instagram.com/p/sample2",
    mediaUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    mediaType: "image",
    isDisplayed: true,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    userId: "user3",
    instagramUrl: "https://www.instagram.com/p/sample3",
    mediaUrl:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    mediaType: "video",
    isDisplayed: true,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

// Feature flag to control API vs mock data
const USE_MOCK_DATA = false; // Backend API is ready

// Hook to get Instagram posts
export const useGetInstagramPosts = () => {
  const [data, setData] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setData(mockInstagramPosts);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: InstagramPost[] = await api.get(INSTAGRAM_ENDPOINT);
      setData(response);
    } catch (err) {
      console.error("Error fetching Instagram posts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch Instagram posts"
      );
      // Fallback to mock data on error
      setData(mockInstagramPosts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refetch = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

// Hook to create Instagram post
export const useCreateInstagramPost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      postData: CreateInstagramPostRequest,
      options?: {
        onSuccess?: (data: InstagramPost) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const response: InstagramPost = await api.post(
          INSTAGRAM_ENDPOINT,
          postData
        );
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to create Instagram post");
        setError(error.message);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    mutate,
    isPending: isLoading,
    error,
  };
};

// Hook to upload file to Cloudinary
export const useUploadFile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      formData: FormData,
      options?: {
        onSuccess?: (data: UploadFileResponse) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add folder name for Instagram uploads
        formData.append("folderName", "instagram");

        // Use API client's request method for file upload
        const response = await api.request(UPLOAD_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type header for FormData, let browser set it with boundary
          },
        });

        const data: UploadFileResponse = response;
        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to upload file");
        setError(error.message);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    mutate,
    isPending: isLoading,
    error,
  };
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

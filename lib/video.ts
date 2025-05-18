import { v2 as cloudinary } from "cloudinary";
import { AgoraClient } from "agora-rtc-react";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Agora
const agoraConfig = {
  appId: process.env.AGORA_APP_ID,
  appCertificate: process.env.AGORA_APP_CERTIFICATE,
};

export const uploadVideo = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "dating_app_videos");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload video");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

export const generateStreamToken = (
  channelName: string,
  uid: number
): string => {
  const agoraClient = new AgoraClient(agoraConfig);
  return agoraClient.generateToken(channelName, uid);
};

export const startStream = async (channelName: string, uid: number) => {
  const token = generateStreamToken(channelName, uid);
  return {
    token,
    channelName,
    uid,
  };
};

export const endStream = async (channelName: string) => {
  // Implement stream cleanup logic here
  return true;
};

export const processVideo = async (videoUrl: string) => {
  try {
    // Add video processing logic here (e.g., compression, format conversion)
    return videoUrl;
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
};

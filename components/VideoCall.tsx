import React, { useState, useEffect, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-react";
import { toast } from "react-hot-toast";

interface VideoCallProps {
  channelName: string;
  token: string;
  uid: number;
  onEndCall: () => void;
}

export default function VideoCall({
  channelName,
  token,
  uid,
  onEndCall,
}: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const client = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        // Initialize Agora client
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        // Join the channel
        await client.current.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          token,
          uid
        );

        // Create and publish local tracks
        [localAudioTrack.current, localVideoTrack.current] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        await client.current.publish([
          localAudioTrack.current,
          localVideoTrack.current,
        ]);

        // Handle user joined event
        client.current.on(
          "user-published",
          async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
            await client.current?.subscribe(user, mediaType);
            if (mediaType === "video") {
              user.videoTrack?.play("remote-video");
            }
            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          }
        );

        // Handle user left event
        client.current.on("user-left", () => {
          toast.info("Remote user left the call");
        });
      } catch (error) {
        console.error("Error initializing video call:", error);
        toast.error("Failed to start video call");
        onEndCall();
      }
    };

    initCall();

    return () => {
      // Cleanup
      localVideoTrack.current?.close();
      localAudioTrack.current?.close();
      client.current?.leave();
    };
  }, [channelName, token, uid]);

  const toggleMute = () => {
    if (localAudioTrack.current) {
      localAudioTrack.current.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack.current) {
      localVideoTrack.current.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = async () => {
    try {
      localVideoTrack.current?.close();
      localAudioTrack.current?.close();
      await client.current?.leave();
      onEndCall();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-4">
          {/* Local video */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <div id="local-video" className="w-full h-full" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full ${
                  isMuted ? "bg-red-500" : "bg-gray-600"
                } text-white`}
              >
                {isMuted ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-full ${
                  isVideoOff ? "bg-red-500" : "bg-gray-600"
                } text-white`}
              >
                {isVideoOff ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={endCall}
                className="p-2 rounded-full bg-red-500 text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Remote video */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <div id="remote-video" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

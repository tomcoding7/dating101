"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Chat from "../../components/Chat";
import VideoCall from "@/components/VideoCall";
import VideoReel from "@/components/VideoReel";
import { AnimatePresence, motion } from "framer-motion";

interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchScore: number;
  matchReason: string;
  isAccepted: boolean;
  user: {
    name: string;
    age: number;
    gender: string;
    profileImage: string | null;
  };
}

interface Reel {
  id: string;
  videoUrl: string;
  caption: string | null;
  user: {
    name: string;
    profileImage: string | null;
  };
  likes: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"reels" | "matches" | "streams">(
    "reels"
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<{
    channelName: string;
    token: string;
    uid: number;
  } | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${activeTab}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      if (activeTab === "matches") {
        setMatches(data.matches);
      } else if (activeTab === "reels") {
        setReels(data.reels);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAccept = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/accept`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to accept match");

      setMatches(
        matches.map((match) =>
          match.id === matchId ? { ...match, isAccepted: true } : match
        )
      );
      toast.success("Match accepted!");
    } catch (error) {
      toast.error("Failed to accept match");
    }
  };

  const startVideoCall = async (matchId: string) => {
    try {
      const response = await fetch("/api/video/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelName: matchId }),
      });

      if (!response.ok) throw new Error("Failed to get video token");

      const { token, uid } = await response.json();
      setActiveCall({
        channelName: matchId,
        token,
        uid,
      });
    } catch (error) {
      toast.error("Failed to start video call");
    }
  };

  const endVideoCall = () => {
    setActiveCall(null);
  };

  const handleNextReel = () => {
    if (currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  const handlePreviousReel = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
  };

  const handleLikeReel = async (reelId: string) => {
    try {
      const response = await fetch(`/api/reels/${reelId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like reel");

      setReels(
        reels.map((reel) =>
          reel.id === reelId ? { ...reel, likes: reel.likes + 1 } : reel
        )
      );
    } catch (error) {
      toast.error("Failed to like reel");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">
                  Video Dating
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/profile")}
                className="btn-secondary"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("reels")}
              className={`${
                activeTab === "reels"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Video Reels
            </button>
            <button
              onClick={() => setActiveTab("matches")}
              className={`${
                activeTab === "matches"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Matches
            </button>
            <button
              onClick={() => setActiveTab("streams")}
              className={`${
                activeTab === "streams"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Live Streams
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "reels" && (
                <>
                  <div className="relative h-[calc(100vh-12rem)]">
                    <AnimatePresence mode="wait">
                      {reels[currentReelIndex] && (
                        <motion.div
                          key={reels[currentReelIndex].id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <VideoReel
                            {...reels[currentReelIndex]}
                            onLike={handleLikeReel}
                            onNext={handleNextReel}
                            onPrevious={handlePreviousReel}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reels.map((reel) => (
                      <div key={reel.id} className="card">
                        <video
                          src={reel.videoUrl}
                          className="w-full h-64 object-cover rounded-lg"
                          controls
                        />
                        <div className="mt-4">
                          <div className="flex items-center">
                            <img
                              src={
                                reel.user.profileImage || "/default-avatar.png"
                              }
                              alt={reel.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="ml-2 font-medium">
                              {reel.user.name}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600">{reel.caption}</p>
                          <div className="mt-2 flex items-center">
                            <button className="text-gray-500 hover:text-primary-600">
                              <span className="sr-only">Like</span>
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>
                            <span className="ml-1 text-gray-500">
                              {reel.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "matches" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <div key={match.id} className="card">
                      <div className="flex items-center">
                        <img
                          src={match.user.profileImage || "/default-avatar.png"}
                          alt={match.user.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="ml-4">
                          <h3 className="text-lg font-medium">
                            {match.user.name}
                          </h3>
                          <p className="text-gray-500">
                            {match.user.age} years old
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Match Score: {Math.round(match.matchScore * 100)}%
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          {match.matchReason}
                        </p>
                      </div>
                      {!match.isAccepted && (
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={() => handleMatchAccept(match.id)}
                            className="btn-primary flex-1"
                          >
                            Accept
                          </button>
                          <button className="btn-secondary flex-1">
                            Decline
                          </button>
                        </div>
                      )}
                      {match.isAccepted && (
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={() => startVideoCall(match.id)}
                            className="btn-primary flex-1 flex items-center justify-center space-x-2"
                          >
                            <svg
                              className="w-5 h-5"
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
                            <span>Video Call</span>
                          </button>
                          <Chat
                            matchId={match.id}
                            receiverId={match.user2Id}
                            receiverName={match.user.name}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "streams" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <button className="btn-primary">Start Streaming</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {activeCall && (
        <VideoCall
          channelName={activeCall.channelName}
          token={activeCall.token}
          uid={activeCall.uid}
          onEndCall={endVideoCall}
        />
      )}
    </div>
  );
}

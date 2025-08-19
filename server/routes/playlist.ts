import { RequestHandler } from "express";
import { PlaylistResponse } from "@shared/api";

// GET /api/playlist - returns HLS playlist URL
export const getPlaylist: RequestHandler = (req, res) => {
  // For demo purposes, return a working test video
  // In production, this would return the actual transcoded stream path
  const playlistUrl = process.env.HLS_PLAYLIST || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const response: PlaylistResponse = {
    playlistUrl
  };

  res.json(response);
};

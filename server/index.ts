import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getOverlays,
  createOverlay,
  getOverlay,
  updateOverlay,
  deleteOverlay
} from "./routes/overlays";
import {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings
} from "./routes/settings";
import { getPlaylist } from "./routes/playlist";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Legacy API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);

  // Overlay API routes
  app.get("/api/overlays", getOverlays);
  app.post("/api/overlays", createOverlay);
  app.get("/api/overlays/:id", getOverlay);
  app.put("/api/overlays/:id", updateOverlay);
  app.delete("/api/overlays/:id", deleteOverlay);

  // Settings API routes
  app.get("/api/settings", getSettings);
  app.post("/api/settings", createSettings);
  app.put("/api/settings/:id", updateSettings);
  app.delete("/api/settings/:id", deleteSettings);

  // Playlist API route
  app.get("/api/playlist", getPlaylist);

  return app;
}

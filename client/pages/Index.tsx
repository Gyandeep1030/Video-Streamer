import { useEffect, useState } from "react";
import {
  Overlay,
  CreateOverlayRequest,
  PlaylistResponse,
  Settings,
  CreateSettingsRequest
} from "@shared/api";
import HLSPlayer from "@/components/HLSPlayer";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
import OverlayEditor from "@/components/OverlayEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Video, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Settings form state
  const [rtspUrl, setRtspUrl] = useState("");
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    fetchPlaylist();
    fetchOverlays();
    fetchSettings();
  }, []);

  // API calls
  const fetchPlaylist = async () => {
    try {
      const response = await fetch("/api/playlist");
      const data: PlaylistResponse = await response.json();
      // Use the backend provided URL first
      setPlaylistUrl(data.playlistUrl);

      toast({
        title: "Demo stream loaded",
        description: "Connected to HLS demo stream for testing.",
      });
    } catch (error) {
      console.error("Error fetching playlist:", error);
      // Fallback to known working stream
      const fallbackStream = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      setPlaylistUrl(fallbackStream);

      toast({
        title: "Using fallback video",
        description: "Connected to MP4 demo video for testing.",
      });
    }
  };

  const fetchOverlays = async () => {
    try {
      const response = await fetch("/api/overlays");
      const data: Overlay[] = await response.json();
      setOverlays(data);
    } catch (error) {
      console.error("Error fetching overlays:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data: Settings = await response.json();
        setSettings(data);
        setRtspUrl(data.rtspUrl);
        setAutoplay(data.autoplay);
        setMuted(data.muted);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const createOverlay = async (overlay: CreateOverlayRequest) => {
    try {
      const response = await fetch("/api/overlays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overlay),
      });

      if (response.ok) {
        const newOverlay: Overlay = await response.json();
        setOverlays(prev => [...prev, newOverlay]);
        toast({
          title: "Overlay created",
          description: `${newOverlay.name} has been added.`,
        });
      }
    } catch (error) {
      console.error("Error creating overlay:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create overlay.",
      });
    }
  };

  const updateOverlay = async (id: string, updates: Partial<Overlay>) => {
    try {
      const response = await fetch(`/api/overlays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedOverlay: Overlay = await response.json();
        setOverlays(prev => prev.map(o => o.id === id ? updatedOverlay : o));
      }
    } catch (error) {
      console.error("Error updating overlay:", error);
    }
  };

  const deleteOverlay = async (id: string) => {
    try {
      const response = await fetch(`/api/overlays/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOverlays(prev => prev.filter(o => o.id !== id));
        toast({
          title: "Overlay deleted",
          description: "The overlay has been removed.",
        });
      }
    } catch (error) {
      console.error("Error deleting overlay:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete overlay.",
      });
    }
  };

  const saveSettings = async () => {
    try {
      const settingsData: CreateSettingsRequest = {
        rtspUrl,
        autoplay,
        muted
      };

      const method = settings ? "PUT" : "POST";
      const url = settings ? `/api/settings/${settings.id}` : "/api/settings";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      if (response.ok) {
        const savedSettings: Settings = await response.json();
        setSettings(savedSettings);
        setShowSettings(false);
        toast({
          title: "Settings saved",
          description: "Stream settings have been updated.",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">StreamLive</h1>
            <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded">
              HLS Overlay Editor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{overlays.length} overlays</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main video player area */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Live Stream with Overlays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {playlistUrl ? (
                    <>
                      <SimpleVideoPlayer
                        videoUrl={playlistUrl}
                        autoplay={autoplay}
                        muted={muted}
                        className="w-full h-full"
                      />
                      <OverlayEditor
                        overlays={overlays}
                        onCreateOverlay={createOverlay}
                        onUpdateOverlay={updateOverlay}
                        onDeleteOverlay={deleteOverlay}
                        className="absolute inset-0"
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Loading stream...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings panel */}
          <div className="lg:col-span-1">
            {showSettings && (
              <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Stream Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rtsp-url" className="text-slate-300">RTSP URL</Label>
                    <Input
                      id="rtsp-url"
                      value={rtspUrl}
                      onChange={(e) => setRtspUrl(e.target.value)}
                      placeholder="rtsp://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay" className="text-slate-300">Autoplay</Label>
                    <Switch
                      id="autoplay"
                      checked={autoplay}
                      onCheckedChange={setAutoplay}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="muted" className="text-slate-300">Muted by default</Label>
                    <Switch
                      id="muted"
                      checked={muted}
                      onCheckedChange={setMuted}
                    />
                  </div>
                  <Button onClick={saveSettings} className="w-full">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Overlays list */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Active Overlays</CardTitle>
              </CardHeader>
              <CardContent>
                {overlays.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">
                    No overlays yet. Use the overlay editor to add text or logo overlays.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {overlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className="bg-slate-700 rounded p-3 text-sm"
                      >
                        <div className="text-white font-medium">{overlay.name}</div>
                        <div className="text-slate-400 text-xs">
                          {overlay.layers[0]?.type} • {overlay.position.x},{overlay.position.y}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

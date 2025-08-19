import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface HLSPlayerProps {
  playlistUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}

export default function HLSPlayer({ 
  playlistUrl, 
  autoplay = false, 
  muted = false,
  className = ""
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Loading video from URL:', playlistUrl);
    setIsLoading(true);
    setError(null);

    // Add a timeout for loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached');
      setIsLoading(prev => {
        if (prev) {
          setError('Stream loading timeout - please check your connection or try again');
          return false;
        }
        return prev;
      });
    }, 10000); // 10 second timeout

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        debug: false,
      });

      hlsRef.current = hls;

      hls.loadSource(playlistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded successfully');
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setError(null);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error event:', event);
        console.error('HLS error data:', JSON.stringify(data, null, 2));

        clearTimeout(loadingTimeout);
        setIsLoading(false);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError(`Network error: ${data.details || 'Failed to load stream'}`);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError(`Media error: ${data.details || 'Media decode error'}`);
              break;
            default:
              setError(`Stream error: ${data.details || 'Unknown error'}`);
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = playlistUrl;
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setError(null);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });
      video.addEventListener('error', () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setError('Failed to load video stream');
      });
    } else {
      // Fallback to regular video element for MP4, WebM, etc.
      console.log('HLS not supported, trying regular video element');
      video.src = playlistUrl;
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setError(null);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });
      video.addEventListener('error', () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setError('Failed to load video - unsupported format or network issue');
      });
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [playlistUrl, autoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Video element error:', e);
      const videoElement = e.target as HTMLVideoElement;
      if (videoElement.error) {
        console.error('Video error details:', {
          code: videoElement.error.code,
          message: videoElement.error.message
        });
        setError(`Video playback error: ${videoElement.error.message || 'Unknown error'}`);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = newVolume[0];
    video.volume = volumeValue;
    setVolume(volumeValue);
    
    if (volumeValue === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const retryStream = () => {
    setError(null);
    setIsLoading(true);
    // Force re-mount of the video element
    window.location.reload();
  };

  if (error) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={retryStream}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Retry Stream
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            Demo stream may be temporarily unavailable
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full min-h-[400px] text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
      />
      
      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1 max-w-24">
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

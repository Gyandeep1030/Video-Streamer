/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Overlay Types
 */
export interface Overlay {
  id: string;
  name: string;
  layers: OverlayLayer[];
  position: Position;
  size: Size;
  style: OverlayStyle;
  createdAt: string;
  updatedAt: string;
}

export interface OverlayLayer {
  type: 'text' | 'logo';
  content?: string; // for text layers
  url?: string; // for logo layers
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface OverlayStyle {
  color?: string;
  opacity: number;
  fontSize?: number;
  url?: string; // for logo overlays
}

export interface CreateOverlayRequest {
  name: string;
  layers: OverlayLayer[];
  position: Position;
  size: Size;
  style: OverlayStyle;
}

export interface UpdateOverlayRequest extends Partial<CreateOverlayRequest> {}

/**
 * Settings Types
 */
export interface Settings {
  id: string;
  rtspUrl: string;
  autoplay: boolean;
  muted: boolean;
  updatedAt: string;
}

export interface CreateSettingsRequest {
  rtspUrl: string;
  autoplay: boolean;
  muted: boolean;
}

export interface UpdateSettingsRequest extends Partial<CreateSettingsRequest> {}

/**
 * Playlist Response
 */
export interface PlaylistResponse {
  playlistUrl: string;
}

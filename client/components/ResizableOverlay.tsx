import { Rnd } from 'react-rnd';
import { Overlay } from '@shared/api';
import { X, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResizableOverlayProps {
  overlay: Overlay;
  onUpdate: (id: string, updates: Partial<Overlay>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function ResizableOverlay({
  overlay,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}: ResizableOverlayProps) {
  const handleDragStop = (e: any, d: any) => {
    onUpdate(overlay.id, {
      position: { x: d.x, y: d.y }
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: any,
    delta: any,
    position: any
  ) => {
    onUpdate(overlay.id, {
      size: {
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height)
      },
      position: { x: position.x, y: position.y }
    });
  };

  const renderOverlayContent = () => {
    const layer = overlay.layers[0]; // For simplicity, use first layer
    
    if (layer.type === 'text') {
      return (
        <div
          className="w-full h-full flex items-center justify-center cursor-move"
          style={{
            color: overlay.style.color || '#ffffff',
            fontSize: overlay.style.fontSize || 16,
            opacity: overlay.style.opacity
          }}
        >
          {layer.content || 'Text Overlay'}
        </div>
      );
    } else if (layer.type === 'logo') {
      return (
        <div className="w-full h-full cursor-move">
          <img
            src={layer.url || overlay.style.url}
            alt="Logo overlay"
            className="w-full h-full object-contain"
            style={{ opacity: overlay.style.opacity }}
            onError={(e) => {
              // Fallback for broken images
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im05IDlhMyAzIDAgMCAwIDYgMGEzIDMgMCAwIDAtNiAweiIgZmlsbD0iIzg4OGIyOSIvPgo8cGF0aCBkPSJtOSAxNyAzLTMgMS41IDEuNUwyMCAxOXYtNGwtNC00LTMuNSAzLjVMMTEgMTNsLTIgNHoiIGZpbGw9IiM4ODhiMjkiLz4KPC9zdmc+';
            }}
          />
        </div>
      );
    }
  };

  return (
    <Rnd
      size={{
        width: overlay.size.width,
        height: overlay.size.height
      }}
      position={{
        x: overlay.position.x,
        y: overlay.position.y
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(overlay.id)}
    >
      <div className="w-full h-full relative group">
        {renderOverlayContent()}
        
        {/* Controls - only show when selected */}
        {isSelected && (
          <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(overlay.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {/* Move handle */}
        {isSelected && (
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Move className="h-4 w-4 text-white drop-shadow-lg cursor-move" />
          </div>
        )}
      </div>
    </Rnd>
  );
}

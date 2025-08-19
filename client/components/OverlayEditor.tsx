import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Plus, Type, Image, Palette, Move3d } from 'lucide-react';
import { Overlay, CreateOverlayRequest, OverlayLayer } from '@shared/api';
import ResizableOverlay from './ResizableOverlay';

interface OverlayEditorProps {
  overlays: Overlay[];
  onCreateOverlay: (overlay: CreateOverlayRequest) => Promise<void>;
  onUpdateOverlay: (id: string, updates: Partial<Overlay>) => Promise<void>;
  onDeleteOverlay: (id: string) => Promise<void>;
  className?: string;
}

export default function OverlayEditor({
  overlays,
  onCreateOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  className = ""
}: OverlayEditorProps) {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showLogoDialog, setShowLogoDialog] = useState(false);
  
  // Text overlay form state
  const [textContent, setTextContent] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(16);
  const [textOpacity, setTextOpacity] = useState(1);
  
  // Logo overlay form state
  const [logoUrl, setLogoUrl] = useState('');
  const [logoOpacity, setLogoOpacity] = useState(1);

  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId);

  const handleCreateTextOverlay = async () => {
    const layer: OverlayLayer = {
      type: 'text',
      content: textContent || 'Sample Text'
    };

    const overlay: CreateOverlayRequest = {
      name: `Text: ${textContent || 'Sample Text'}`,
      layers: [layer],
      position: { x: 50, y: 50 },
      size: { width: 200, height: 50 },
      style: {
        color: textColor,
        fontSize: textSize,
        opacity: textOpacity
      }
    };

    await onCreateOverlay(overlay);
    setShowTextDialog(false);
    setTextContent('');
  };

  const handleCreateLogoOverlay = async () => {
    if (!logoUrl) return;

    const layer: OverlayLayer = {
      type: 'logo',
      url: logoUrl
    };

    const overlay: CreateOverlayRequest = {
      name: `Logo: ${logoUrl.split('/').pop() || 'Logo'}`,
      layers: [layer],
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      style: {
        opacity: logoOpacity,
        url: logoUrl
      }
    };

    await onCreateOverlay(overlay);
    setShowLogoDialog(false);
    setLogoUrl('');
  };

  const handleUpdateSelectedOverlay = (updates: Partial<Overlay>) => {
    if (selectedOverlay) {
      onUpdateOverlay(selectedOverlay.id, updates);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Overlay containers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {overlays.map((overlay) => (
            <ResizableOverlay
              key={overlay.id}
              overlay={overlay}
              onUpdate={onUpdateOverlay}
              onDelete={onDeleteOverlay}
              isSelected={selectedOverlayId === overlay.id}
              onSelect={setSelectedOverlayId}
            />
          ))}
        </div>
      </div>

      {/* Control panel */}
      <div className="absolute top-4 right-4 w-80 pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Overlay Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add overlay buttons */}
            <div className="flex gap-2">
              <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Type className="h-4 w-4 mr-2" />
                    Add Text
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Text Overlay</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-content">Text Content</Label>
                      <Input
                        id="text-content"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Enter text..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-color">Color</Label>
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Font Size: {textSize}px</Label>
                      <Slider
                        value={[textSize]}
                        onValueChange={(value) => setTextSize(value[0])}
                        min={12}
                        max={48}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label>Opacity: {Math.round(textOpacity * 100)}%</Label>
                      <Slider
                        value={[textOpacity]}
                        onValueChange={(value) => setTextOpacity(value[0])}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                    <Button onClick={handleCreateTextOverlay} className="w-full">
                      Create Text Overlay
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLogoDialog} onOpenChange={setShowLogoDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Image className="h-4 w-4 mr-2" />
                    Add Logo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Logo Overlay</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logo-url">Image URL</Label>
                      <Input
                        id="logo-url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label>Opacity: {Math.round(logoOpacity * 100)}%</Label>
                      <Slider
                        value={[logoOpacity]}
                        onValueChange={(value) => setLogoOpacity(value[0])}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateLogoOverlay} 
                      className="w-full"
                      disabled={!logoUrl}
                    >
                      Create Logo Overlay
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Selected overlay properties */}
            {selectedOverlay && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Move3d className="h-4 w-4" />
                  Selected: {selectedOverlay.name}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <Label>Position</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={selectedOverlay.position.x}
                        onChange={(e) => handleUpdateSelectedOverlay({
                          position: { ...selectedOverlay.position, x: parseInt(e.target.value) || 0 }
                        })}
                        className="text-xs"
                        placeholder="X"
                      />
                      <Input
                        type="number"
                        value={selectedOverlay.position.y}
                        onChange={(e) => handleUpdateSelectedOverlay({
                          position: { ...selectedOverlay.position, y: parseInt(e.target.value) || 0 }
                        })}
                        className="text-xs"
                        placeholder="Y"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={selectedOverlay.size.width}
                        onChange={(e) => handleUpdateSelectedOverlay({
                          size: { ...selectedOverlay.size, width: parseInt(e.target.value) || 0 }
                        })}
                        className="text-xs"
                        placeholder="W"
                      />
                      <Input
                        type="number"
                        value={selectedOverlay.size.height}
                        onChange={(e) => handleUpdateSelectedOverlay({
                          size: { ...selectedOverlay.size, height: parseInt(e.target.value) || 0 }
                        })}
                        className="text-xs"
                        placeholder="H"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Opacity: {Math.round(selectedOverlay.style.opacity * 100)}%</Label>
                    <Slider
                      value={[selectedOverlay.style.opacity]}
                      onValueChange={(value) => handleUpdateSelectedOverlay({
                        style: { ...selectedOverlay.style, opacity: value[0] }
                      })}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

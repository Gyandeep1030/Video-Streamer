import { RequestHandler } from "express";
import { 
  Overlay, 
  CreateOverlayRequest, 
  UpdateOverlayRequest 
} from "@shared/api";

// In-memory storage for overlays (replace with database in production)
let overlays: Overlay[] = [];
let nextId = 1;

// GET /api/overlays - list all overlays
export const getOverlays: RequestHandler = (req, res) => {
  res.json(overlays);
};

// POST /api/overlays - create overlay
export const createOverlay: RequestHandler = (req, res) => {
  try {
    const body: CreateOverlayRequest = req.body;
    
    const newOverlay: Overlay = {
      id: nextId.toString(),
      name: body.name,
      layers: body.layers,
      position: body.position,
      size: body.size,
      style: body.style,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    overlays.push(newOverlay);
    nextId++;
    
    res.status(201).json(newOverlay);
  } catch (error) {
    res.status(400).json({ error: 'Invalid overlay data' });
  }
};

// GET /api/overlays/:id - get overlay by id
export const getOverlay: RequestHandler = (req, res) => {
  const overlay = overlays.find(o => o.id === req.params.id);
  
  if (!overlay) {
    return res.status(404).json({ error: 'Overlay not found' });
  }
  
  res.json(overlay);
};

// PUT /api/overlays/:id - update overlay
export const updateOverlay: RequestHandler = (req, res) => {
  const overlayIndex = overlays.findIndex(o => o.id === req.params.id);
  
  if (overlayIndex === -1) {
    return res.status(404).json({ error: 'Overlay not found' });
  }
  
  try {
    const updates: UpdateOverlayRequest = req.body;
    const overlay = overlays[overlayIndex];
    
    overlays[overlayIndex] = {
      ...overlay,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json(overlays[overlayIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid overlay data' });
  }
};

// DELETE /api/overlays/:id - delete overlay
export const deleteOverlay: RequestHandler = (req, res) => {
  const overlayIndex = overlays.findIndex(o => o.id === req.params.id);
  
  if (overlayIndex === -1) {
    return res.status(404).json({ error: 'Overlay not found' });
  }
  
  overlays.splice(overlayIndex, 1);
  res.status(204).send();
};

import { RequestHandler } from "express";
import { 
  Settings, 
  CreateSettingsRequest, 
  UpdateSettingsRequest 
} from "@shared/api";

// In-memory storage for settings (replace with database in production)
let settings: Settings[] = [];
let nextId = 1;

// GET /api/settings - get latest settings
export const getSettings: RequestHandler = (req, res) => {
  // Return the most recent settings
  const latestSettings = settings.length > 0 ? settings[settings.length - 1] : null;
  
  if (!latestSettings) {
    return res.status(404).json({ error: 'No settings found' });
  }
  
  res.json(latestSettings);
};

// POST /api/settings - create new settings
export const createSettings: RequestHandler = (req, res) => {
  try {
    const body: CreateSettingsRequest = req.body;
    
    const newSettings: Settings = {
      id: nextId.toString(),
      rtspUrl: body.rtspUrl,
      autoplay: body.autoplay,
      muted: body.muted,
      updatedAt: new Date().toISOString()
    };
    
    settings.push(newSettings);
    nextId++;
    
    res.status(201).json(newSettings);
  } catch (error) {
    res.status(400).json({ error: 'Invalid settings data' });
  }
};

// PUT /api/settings/:id - update settings
export const updateSettings: RequestHandler = (req, res) => {
  const settingsIndex = settings.findIndex(s => s.id === req.params.id);
  
  if (settingsIndex === -1) {
    return res.status(404).json({ error: 'Settings not found' });
  }
  
  try {
    const updates: UpdateSettingsRequest = req.body;
    const currentSettings = settings[settingsIndex];
    
    settings[settingsIndex] = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json(settings[settingsIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid settings data' });
  }
};

// DELETE /api/settings/:id - delete settings
export const deleteSettings: RequestHandler = (req, res) => {
  const settingsIndex = settings.findIndex(s => s.id === req.params.id);
  
  if (settingsIndex === -1) {
    return res.status(404).json({ error: 'Settings not found' });
  }
  
  settings.splice(settingsIndex, 1);
  res.status(204).send();
};

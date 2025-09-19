/**
 * Map Selector Component
 * Provides UI for selecting and switching between different maps
 */

import { Text } from 'phaser-jsx';

import { MapConfig } from '../constants/maps';
import { getAllTilesets } from '../constants/tilesets';
import { MapManager } from '../managers/MapManager';
import { Button } from './Button';

interface MapSelectorProps {
  mapManager: MapManager;
  onMapChange?: (mapConfig: MapConfig) => void;
}

export function MapSelector({ mapManager, onMapChange }: MapSelectorProps) {
  const currentMap = mapManager.getCurrentMap();
  const availableMaps = mapManager.getAvailableMaps();
  const availableTilesets = getAllTilesets();

  const handleNextMap = async () => {
    try {
      const success = await mapManager.nextMap();
      if (success) {
        const newMap = mapManager.getCurrentMap();
        if (newMap && onMapChange) {
          onMapChange(newMap);
        }
      }
    } catch {
      // Silently handle error for now
    }
  };

  const handlePreviousMap = async () => {
    try {
      const success = await mapManager.previousMap();
      if (success) {
        const newMap = mapManager.getCurrentMap();
        if (newMap && onMapChange) {
          onMapChange(newMap);
        }
      }
    } catch {
      // Silently handle error for now
    }
  };

  const handleRandomMap = async () => {
    try {
      const success = await mapManager.loadRandomMap();
      if (success) {
        const newMap = mapManager.getCurrentMap();
        if (newMap && onMapChange) {
          onMapChange(newMap);
        }
      }
    } catch {
      // Silently handle error for now
    }
  };

  return (
    <>
      <Text
        x={50}
        y={50}
        text="MAP SELECTOR"
        fixed
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          font: 'bold 18px monospace',
          padding: { x: 15, y: 10 },
        }}
      />

      <Text
        x={50}
        y={80}
        text={`Current: ${currentMap?.name || 'None'}`}
        fixed
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#ffff00',
          font: '14px monospace',
          padding: { x: 10, y: 5 },
        }}
      />

      <Button
        x={50}
        y={110}
        text="← Previous Map"
        onClick={handlePreviousMap}
        fixed
      />

      <Button x={200} y={110} text="Next Map →" onClick={handleNextMap} fixed />

      <Button
        x={350}
        y={110}
        text="🎲 Random"
        onClick={handleRandomMap}
        fixed
      />

      <Text
        x={50}
        y={170}
        text="Available Maps:"
        fixed
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#ffffff',
          font: '14px monospace',
          padding: { x: 10, y: 5 },
        }}
      />

      {availableMaps.map((map, index) => (
        <Text
          key={map.id}
          x={50}
          y={200 + index * 20}
          text={`• ${map.name}${currentMap?.id === map.id ? ' (current)' : ''}`}
          fixed
          style={{
            color: currentMap?.id === map.id ? '#ffff00' : '#ffffff',
            font: '12px monospace',
          }}
        />
      ))}

      <Text
        x={450}
        y={50}
        text="AVAILABLE TILESETS"
        fixed
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          font: 'bold 18px monospace',
          padding: { x: 15, y: 10 },
        }}
      />

      {availableTilesets.map((tileset, index) => (
        <Text
          key={tileset.id}
          x={450}
          y={100 + index * 25}
          text={`🎨 ${tileset.name}`}
          fixed
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#00ff00',
            font: '12px monospace',
            padding: { x: 8, y: 3 },
          }}
        />
      ))}

      <Text
        x={450}
        y={100 + availableTilesets.length * 25 + 20}
        text="Theme Categories:"
        fixed
        style={{
          color: '#ffffff',
          font: 'bold 14px monospace',
        }}
      />

      {availableTilesets.map((tileset, index) => (
        <Text
          key={`theme-${tileset.id}`}
          x={450}
          y={100 + availableTilesets.length * 25 + 50 + index * 20}
          text={`• ${tileset.theme.toUpperCase()}: ${tileset.description}`}
          fixed
          style={{
            color: '#cccccc',
            font: '10px monospace',
          }}
        />
      ))}
    </>
  );
}

export default MapSelector;

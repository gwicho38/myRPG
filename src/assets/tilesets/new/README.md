# Additional Tilesets

This directory contains additional tilesets that can be used with the tilemap generator.

## Compatible Tileset Requirements

For a tileset to be compatible with the RPG game, it must meet these specifications:

- **Tile Size**: 32x32 pixels
- **Format**: PNG with transparency support
- **Grid Layout**: Organized in a grid pattern
- **Spacing**: 2 pixels between tiles (recommended)
- **Margin**: 1 pixel border (recommended)

## Adding New Tilesets

1. **Download tileset**: Find a compatible 32x32 tileset from:
   - OpenGameArt.org
   - Itch.io
   - GitHub repositories
   - Create your own

2. **Place tileset**: Save the PNG file in this directory

3. **Update configuration**: Add the tileset to the game configuration:
   ```typescript
   // In src/constants/tilesets.ts
   export const TILESETS = {
     tuxemon: 'tuxemon-sample-32px-extruded.png',
     newTileset: 'your-new-tileset.png'
   };
   ```

4. **Generate maps**: Use the tilemap generator to create maps with the new tileset

## Recommended Sources

### OpenGameArt.org
- **LPC (Liberated Pixel Cup)** tilesets
- **Pokemon-style** tilesets
- **Fantasy RPG** tilesets
- **Medieval** tilesets

### Itch.io
- Search for "free RPG tileset"
- Look for "32x32 tileset"
- Check commercial-friendly licenses

### GitHub
- Search for "RPG tileset" repositories
- Open-source game projects
- Community asset collections

## Creating Custom Tilesets

If you want to create your own tileset:

1. **Design tiles**: Create 32x32 pixel tiles
2. **Organize grid**: Arrange tiles in a grid (e.g., 24 columns)
3. **Add spacing**: Include 2px spacing between tiles
4. **Export PNG**: Save as PNG with transparency
5. **Test compatibility**: Use with the tilemap generator

## License Considerations

Always check the license of tilesets before using them:

- **CC0**: Public domain, can be used freely
- **CC BY**: Attribution required
- **CC BY-SA**: Attribution and share-alike required
- **Commercial**: May require payment for commercial use

Make sure to include proper attribution in your game if required by the license.
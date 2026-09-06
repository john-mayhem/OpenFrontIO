import { GameMapType } from "../../../core/game/Game";
import { terrainMapFileLoader } from "../../TerrainMapFileLoader";

export interface MapSize {
  width: number;
  height: number;
  landTiles: number;
}

const sizeCache = new Map<string, Promise<MapSize | null>>();

export function getMapSize(mapKey: string): Promise<MapSize | null> {
  const cached = sizeCache.get(mapKey);
  if (cached) return cached;

  const promise = (async (): Promise<MapSize | null> => {
    try {
      const mapValue = GameMapType[mapKey as keyof typeof GameMapType];
      const manifest =
        await terrainMapFileLoader.getMapData(mapValue).manifest();
      return {
        width: manifest.map.width,
        height: manifest.map.height,
        landTiles: manifest.map.num_land_tiles,
      };
    } catch (error) {
      console.error(`Failed to load map size for ${mapKey}:`, error);
      return null;
    }
  })();

  sizeCache.set(mapKey, promise);
  return promise;
}

// Kicks off (and caches) a load for every map key; callers re-render as
// getMapSize's cache fills in rather than waiting on the returned promise.
export function preloadMapSizes(mapKeys: readonly string[]): void {
  for (const key of mapKeys) {
    void getMapSize(key);
  }
}

export function formatLandTiles(landTiles: number): string {
  if (landTiles >= 1_000_000) {
    return `${(landTiles / 1_000_000).toFixed(1)}M`;
  }
  if (landTiles >= 1_000) {
    return `${Math.round(landTiles / 1_000)}K`;
  }
  return `${landTiles}`;
}

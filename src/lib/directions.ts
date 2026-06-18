import { Directions } from "@/types/directions";

let DirectionsCache: Directions[] | null = null;

export function getAllDirections(): Directions[] {
  if (DirectionsCache) return DirectionsCache;
  
  try {
    // @ts-ignore - динамический импорт JSON
    const data = require('@/data/directions.json');
    DirectionsCache = data;
    return data;
  } catch (error) {
    console.error('Error loading Directions:', error);
    return [];
  }
}
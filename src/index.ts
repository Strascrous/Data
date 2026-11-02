import { cities } from './data.js';
export { cities } from './data.js';

export interface City {
  id: string;
  name: string;
  academy: string;
  areas: Array<string>;
  exactCity?: string;
  exactCities?: Array<string>;
}

export const validAcademies = new Set(cities.map((c) => c.academy));
export const citiesIds = cities.map((c) => c.id);

export type CityId = (typeof cities)[number]['id'];

export function findCityById(id: string) {
  return cities.find((city) => city.id === id);
}

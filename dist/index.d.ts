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
export declare const validAcademies: Set<string>;
export declare const citiesIds: string[];
export type CityId = (typeof cities)[number]['id'];
export declare function findCityById(id: string): City | undefined;
//# sourceMappingURL=index.d.ts.map
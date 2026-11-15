import { cities } from './data.js';
export { cities } from './data.js';
export const validAcademies = new Set(cities.map((c) => c.academy));
export const citiesIds = cities.map((c) => c.id);
export function findCityById(id) {
    return cities.find((city) => city.id === id);
}
//# sourceMappingURL=index.js.map
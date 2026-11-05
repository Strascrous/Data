export interface Academy {
    id: string;
    name: string;
    cities: Array<Omit<City, "academy">>;
}

export interface City {
    id: string;
    academy: string;
    name: string;
    icon: CityIcon;
    location: CityLocation;
    areas: Array<string>;
    exactCity?: string;
    exactCities?: Array<string>;
}

export interface CityIcon {
    source: "mdi" | "material";
    name: string;
}

export interface CityLocation {
    lon: number;
    lat: number;
}

import type { Academy, City } from "./models.js";
import type { City as CityLib } from "../templates/ts/src/index.js";
import type { Schema } from "ajv";

import path from "node:path";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, writeFileSync } from "node:fs";
import { parse } from "yaml";
import { Ajv2020 } from "ajv/dist/2020.js";

export async function readYaml(filePath: string, schemaPath: string): Promise<Array<Academy>> {
    const content = await readFile(filePath, "utf8");
    const data: unknown = parse(content);
    const schema: Schema = JSON.parse(await readFile(schemaPath, "utf8"));
    const ajv = new Ajv2020({ allErrors: true, strictTypes: false });
    const validate = ajv.compile<Array<Academy>>(schema);

    if (!validate(data)) {
        const errors = ajv.errorsText(validate.errors, { separator: "\n" });
        throw new Error(`${filePath} is invalid :\n${errors}`);
    }

    return data;
}

export function parseYaml(data: Array<Academy>): Array<City> {
    const cities: Array<City> = [];
    for (const academyData of data) {
        const academy = academyData.id;
        for (const city of academyData.cities) {
            cities.push({
                academy,
                ...city
            });
        }
    }

    return cities;
}

async function main(): Promise<void> {
    const dist = path.join(import.meta.dirname, "..", "dist");
    const templates = path.join(import.meta.dirname, "..", "templates");
    const citiesPath = path.join(import.meta.dirname, "..", "data", "cities.yaml");
    const schemaPath = path.join(import.meta.dirname, "..", "schema", "cities.schema.json");

    const rawCities = await readYaml(citiesPath, schemaPath);
    const cities = parseYaml(rawCities);

    const exists = existsSync(dist);
    if (exists) await rm(dist, { recursive: true, force: true });
    await mkdir(dist);

    await cp(templates, dist, { recursive: true });
    await generateTypeScript(cities, dist);
}

async function generateTypeScript(cities: Array<City>, dist: string) {
    const dataPath = path.join(dist, "ts", "src", "data.ts");
    let data: Array<CityLib> = cities.map(
        ({ id, name, academy, areas, exactCities, exactCity }) => ({
            id, name, academy, areas, exactCities, exactCity
        })
    )

    let lines = [
        "// GENERATED CODE - DO NOT MODIFY BY HAND",
        "import type { City } from './index.js';",
        "",
        `export const cities: City[] = ${JSON.stringify(data)}`
    ]

    await writeFile(dataPath, lines.join("\n"));
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

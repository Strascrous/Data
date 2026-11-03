import type { Academy, City } from "./models.js";
import type { City as CityLib } from "../templates/ts/src/index.js";
import type { Schema } from "ajv";

import path from "node:path";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

    return cities
        .sort((a, b) => a.name.localeCompare(b.name))
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
    await generateDart(cities, dist);
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

    console.log(`TypeScript: ${cities.length} villes ajoutées`)

    await writeFile(dataPath, lines.join("\n"));
}

function dartString(value: string): string {
    return JSON.stringify(value).replace(/\$/g, "\\$");
}

export async function generateDart(cities: Array<City>, dist: string): Promise<void> {
    const dataPath = path.join(dist, "dart", "lib", "data.dart");
    const assetsPath = path.join(dist, "dart", "assets", "icons", "cities");
    const mdiPath = path.dirname(fileURLToPath(import.meta.resolve("@mdi/svg/package.json")));
    const copiedMDI = new Set<string>();

    await mkdir(assetsPath, { recursive: true });
    await mkdir(path.dirname(dataPath), { recursive: true });

    const lines = [
        "// GENERATED CODE - DO NOT MODIFY BY HAND",
        "import 'package:flutter/material.dart';",
        "",
        "import 'city.dart';",
        "import 'city_icon.dart';",
        "",
        "final List<City> cities = ["
    ];

    for (const { name, id, icon } of cities) {
        let dartIcon: string;
        if (icon.source === "material") {
            dartIcon = `const CityIcon.builtin(icon: Icons.${icon.name})`;
        } else {
            if (!copiedMDI.has(icon.name)) {
                await cp(path.join(mdiPath, "svg", `${icon.name}.svg`), path.join(assetsPath, `${icon.name}.svg`));
                copiedMDI.add(icon.name);
                console.log(`MDI: ${icon.name} copied`)
            }
            dartIcon = `const CityIcon.svg(name: ${dartString(icon.name)})`;
        }

        lines.push(`  City(${dartString(name)}, ${dartString(id)}, ${dartIcon}),`);
        console.log(`Dart: ${name} ajouté`)
    }

    console.log(`Dart: ${cities.length} villes ajoutées`)
    console.log(`MDI: ${copiedMDI.size} icônes copiés`);

    lines.push("];", "");
    await writeFile(dataPath, lines.join("\n"));

    await cp(path.join(mdiPath, "LICENSE"), path.join(dist, "dart", "assets", "licenses", "pictogrammers-LICENSE.txt"))
    await generateThirdPartyNotices(copiedMDI, dist);
}

async function generateThirdPartyNotices(copiedMDI: Set<string>, dist: string) {
    let lines = [
        "# Third-party assets",
        "## Material Design Icons (MDI)",
        "Source: [https://pictogrammers.com/library/mdi/](https://pictogrammers.com/library/mdi/)",
        "",
        "Copyright (c) Pictogrammers contributors.",
        "",
        "License: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)",
        "",
        "The following SVG icons originate from the Material Design Icons collection:",
        ""
    ]

    for (const mdi of copiedMDI) {
        lines.push(`- [${mdi}.svg](assets/icons/cities/${mdi}.svg) (original: ${mdi})`)
    }
    lines.push("", "See [pictogrammers-LICENSE.txt](assets/licenses/pictogrammers-LICENSE.txt) for the complete license text.")

    await writeFile(path.join(dist, "dart", "THIRD_PARTY_NOTICES.md"), lines.join("\n"));

    console.log("TPN: Third Party Notices generated")
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

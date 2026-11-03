import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseDocument } from "yaml";

const execFileAsync = promisify(execFile);

async function main(): Promise<void> {
    let version = process.argv[2];
    if (!version) throw new Error("Usage: npm run generate:version <version>");
    version = version.replace(/^v/, "");

    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version))
        throw new Error(`Invalid version: "${version}".`);

    const dist = path.join(import.meta.dirname, "..", "dist");
    const tsPath = path.join(dist, "ts");
    const pubspecPath = path.join(dist, "dart", "pubspec.yaml");

    const pubspec = parseDocument(await readFile(pubspecPath, "utf8"));
    if (pubspec.errors.length > 0)
        throw new Error(pubspec.errors.map((error) => error.message).join("\n"));
    pubspec.set("version", version);

    await execFileAsync("npm", [
        "version",
        version,
        "--no-git-tag-version",
        "--ignore-scripts",
        "--allow-same-version"
    ], { cwd: tsPath });
    console.log(`TypeScript: Version edited`);

    await writeFile(pubspecPath, pubspec.toString());
    console.log(`Dart: Version edited`);
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

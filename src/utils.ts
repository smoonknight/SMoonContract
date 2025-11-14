import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dataFolder = path.join(__dirname, "data");
export const distFolder = path.join(__dirname, "dist");

export function ensureFolders() {
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
    if (!fs.existsSync(distFolder)) fs.mkdirSync(distFolder);
}

export function hashPassword(raw: string) {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

export function saveJSON(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

export function loadJSON(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function listContracts() {
    return fs.readdirSync(dataFolder).filter(f => f.endsWith(".json"));
}

export function loadBuilderPassword(guid: string): string {
    const builderPath = path.join(distFolder, `${guid}.json`);
    if (!fs.existsSync(builderPath)) return "";
    const builder = loadJSON(builderPath);
    return builder.password || "";
}

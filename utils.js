"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distFolder = exports.dataFolder = void 0;
exports.ensureFolders = ensureFolders;
exports.hashPassword = hashPassword;
exports.saveJSON = saveJSON;
exports.loadJSON = loadJSON;
exports.listContracts = listContracts;
exports.loadBuilderPassword = loadBuilderPassword;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
exports.dataFolder = path_1.default.join(__dirname, "data");
exports.distFolder = path_1.default.join(__dirname, "dist");
function ensureFolders() {
    if (!fs_1.default.existsSync(exports.dataFolder))
        fs_1.default.mkdirSync(exports.dataFolder);
    if (!fs_1.default.existsSync(exports.distFolder))
        fs_1.default.mkdirSync(exports.distFolder);
}
function hashPassword(raw) {
    return crypto_1.default.createHash("sha256").update(raw).digest("hex");
}
function saveJSON(filePath, data) {
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 4));
}
function loadJSON(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
}
function listContracts() {
    return fs_1.default.readdirSync(exports.dataFolder).filter(f => f.endsWith(".json"));
}
function loadBuilderPassword(guid) {
    const builderPath = path_1.default.join(exports.distFolder, `${guid}.json`);
    if (!fs_1.default.existsSync(builderPath))
        return "";
    const builder = loadJSON(builderPath);
    return builder.password || "";
}

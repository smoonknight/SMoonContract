"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const readline_1 = tslib_1.__importDefault(require("readline"));
const utils_1 = require("./utils");
const crypto_1 = require("crypto");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
(0, utils_1.ensureFolders)();
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
function getBaseUrl() {
    return process.env.APP_BASE_URL || "";
}
function ask(q) {
    return new Promise(res => rl.question(q, ans => res(ans.trim())));
}
async function chooseStatus(defaultValue) {
    console.log("\nChoose status:");
    console.log("1. allowed");
    console.log("2. denied");
    console.log(`Enter to keep current (${defaultValue})`);
    const ans = await ask("Select: ");
    if (ans === "1")
        return "allowed";
    if (ans === "2")
        return "denied";
    return defaultValue;
}
async function createContract() {
    const guid = (0, crypto_1.randomUUID)();
    const rawPassword = await ask("Enter password: ");
    const hashed = (0, utils_1.hashPassword)(rawPassword);
    const obj = {
        password: hashed,
        status: "allowed",
        lastEdit: new Date().toISOString()
    };
    // SAVE DATA FILE
    (0, utils_1.saveJSON)(path_1.default.join(utils_1.dataFolder, `${guid}.json`), obj);
    // SAVE BUILDER FILE
    (0, utils_1.saveJSON)(path_1.default.join(utils_1.distFolder, `${guid}.json`), {
        guid,
        password: rawPassword,
        url: getBaseUrl()
    });
    console.log("Contract created and builder generated.");
}
async function editContract() {
    const files = (0, utils_1.listContracts)();
    if (files.length === 0) {
        console.log("No contracts found.");
        return;
    }
    console.log("Select contract to edit:");
    files.forEach((f, i) => console.log(`${i + 1}. ${f}`));
    const pick = parseInt(await ask("Enter number: "));
    if (isNaN(pick) || pick < 1 || pick > files.length) {
        console.log("Invalid selection.");
        return;
    }
    const file = files[pick - 1];
    const guid = file.replace(".json", "");
    const filePath = path_1.default.join(utils_1.dataFolder, file);
    const oldBuilderPassword = (0, utils_1.loadBuilderPassword)(guid);
    // === NEW PASSWORD ===
    const newPassword = await ask("New password (leave empty to keep current): ");
    // raw password: either new or old
    const rawPassword = newPassword.length > 0 ? newPassword : oldBuilderPassword;
    // hashed version (either rehash new password or reuse old hash)
    const hashedPassword = newPassword.length > 0
        ? (0, utils_1.hashPassword)(newPassword)
        : (0, utils_1.loadJSON)(filePath).password;
    // === NEW STATUS ===
    console.log("\nChoose new status:");
    console.log("1. allowed");
    console.log("2. denied");
    const statusPick = await ask("Select: ");
    const finalStatus = statusPick === "1" ? "allowed" :
        statusPick === "2" ? "denied" :
            "allowed"; // default fallback
    // === REWRITE JSON COMPLETELY ===
    const newData = {
        password: hashedPassword,
        status: finalStatus,
        lastEdit: new Date().toISOString()
    };
    (0, utils_1.saveJSON)(filePath, newData);
    // === UPDATE BUILDER TOO ===
    (0, utils_1.saveJSON)(path_1.default.join(utils_1.distFolder, file), {
        guid,
        password: rawPassword,
        url: getBaseUrl()
    });
    console.log("Contract and builder rewritten successfully.");
}
async function deleteContract() {
    const files = (0, utils_1.listContracts)();
    if (files.length === 0) {
        console.log("No contracts found.");
        return;
    }
    console.log("Select contract to delete:");
    files.forEach((f, i) => console.log(`${i + 1}. ${f}`));
    const pick = parseInt(await ask("Enter number: "));
    if (isNaN(pick) || pick < 1 || pick > files.length) {
        console.log("Invalid selection.");
        return;
    }
    const file = files[pick - 1];
    const guid = file.replace(".json", "");
    fs_1.default.unlinkSync(path_1.default.join(utils_1.dataFolder, file));
    const distPath = path_1.default.join(utils_1.distFolder, file);
    if (fs_1.default.existsSync(distPath)) {
        fs_1.default.unlinkSync(distPath);
    }
    console.log("Contract and builder deleted.");
}
async function main() {
    console.log("\n== Contract Manager ==");
    console.log("1. Create");
    console.log("2. Edit");
    console.log("3. Delete");
    console.log("4. Exit");
    const choice = await ask("Choose: ");
    if (choice === "1")
        await createContract();
    else if (choice === "2")
        await editContract();
    else if (choice === "3")
        await deleteContract();
    else
        rl.close();
    rl.close();
}
main();

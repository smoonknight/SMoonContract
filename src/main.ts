import readline from "readline";
import { ensureFolders, hashPassword, saveJSON, loadJSON, listContracts, dataFolder, distFolder, loadBuilderPassword } from "./utils";
import { randomUUID } from "crypto";
import path from "path";
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();
ensureFolders();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getBaseUrl(): string {
    return process.env.APP_BASE_URL || "";
}

function ask(q: string): Promise<string> {
    return new Promise(res => rl.question(q, ans => res(ans.trim())));
}

async function chooseStatus(defaultValue: string): Promise<string> {
    console.log("\nChoose status:");
    console.log("1. allowed");
    console.log("2. denied");
    console.log(`Enter to keep current (${defaultValue})`);

    const ans = await ask("Select: ");

    if (ans === "1") return "allowed";
    if (ans === "2") return "denied";

    return defaultValue;
}

async function createContract() {
    const guid = randomUUID();
    const rawPassword = await ask("Enter password: ");

    const hashed = hashPassword(rawPassword);

    const obj = {
        password: hashed,
        status: "allowed",
        lastEdit: new Date().toISOString()
    };

    // SAVE DATA FILE
    saveJSON(path.join(dataFolder, `${guid}.json`), obj);

    // SAVE BUILDER FILE
    saveJSON(path.join(distFolder, `${guid}.json`), {
        guid,
        password: rawPassword,
        url: getBaseUrl()
    });

    console.log("Contract created and builder generated.");
}

async function editContract() {
    const files = listContracts();
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

    const filePath = path.join(dataFolder, file);
    const oldBuilderPassword = loadBuilderPassword(guid);

    // === NEW PASSWORD ===
    const newPassword = await ask("New password (leave empty to keep current): ");

    // raw password: either new or old
    const rawPassword = newPassword.length > 0 ? newPassword : oldBuilderPassword;

    // hashed version (either rehash new password or reuse old hash)
    const hashedPassword = newPassword.length > 0
        ? hashPassword(newPassword)
        : loadJSON(filePath).password;

    // === NEW STATUS ===
    console.log("\nChoose new status:");
    console.log("1. allowed");
    console.log("2. denied");
    const statusPick = await ask("Select: ");

    const finalStatus =
        statusPick === "1" ? "allowed" :
            statusPick === "2" ? "denied" :
                "allowed"; // default fallback

    // === REWRITE JSON COMPLETELY ===
    const newData = {
        password: hashedPassword,
        status: finalStatus,
        lastEdit: new Date().toISOString()
    };

    saveJSON(filePath, newData);

    // === UPDATE BUILDER TOO ===
    saveJSON(path.join(distFolder, file), {
        guid,
        password: rawPassword,
        url: getBaseUrl()
    });

    console.log("Contract and builder rewritten successfully.");
}

async function deleteContract() {
    const files = listContracts();
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

    fs.unlinkSync(path.join(dataFolder, file));

    const distPath = path.join(distFolder, file);
    if (fs.existsSync(distPath)) {
        fs.unlinkSync(distPath);
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

    if (choice === "1") await createContract();
    else if (choice === "2") await editContract();
    else if (choice === "3") await deleteContract();
    else rl.close();

    rl.close();
}

main();
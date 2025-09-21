import path from "node:path";
import * as fs from "node:fs";
import {fileURLToPath} from "url";

type ItemParser = {
    match: RegExp | RegExp[],
    parse: (url: URL) => Promise<{
        name: string,
        price: number,
        url: string,
        image: string | null,
    }>,
};

const parsers: ItemParser[] = [];
const currentDir = path.dirname(fileURLToPath(import.meta.url));

const loadParsers = async () => {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        if (file === "index.ts" || !file.endsWith(".ts")) continue;
        const mod = await import(`./${file.replace(".ts", "")}`) as ItemParser;
        if (!mod.match || !mod.parse) continue;
        const patterns = Array.isArray(mod.match) ? mod.match : [mod.match];
        for (const pattern of patterns) {
            parsers.push({match: pattern, parse: mod.parse});
        }
    }
};

const parseItem = async (url: string) => {
    if (parsers.length === 0) {
        await loadParsers();
    }
    const parser = parsers.find(p => {
        if ("test" in p.match) {
            p.match.lastIndex = 0;
            return p.match.test(url);
        }
    });
    return parser?.parse(new URL(url));
};

export default parseItem;

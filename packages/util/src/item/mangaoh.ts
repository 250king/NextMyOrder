import * as cheerio from "cheerio";
import {jStd} from "../data/string";

export const match = /https:\/\/www\.mangaoh\.co\.jp\/catalog\/\d+\//g;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("div.my-3 > div.h3")
        .contents() // 获取所有子节点（包括文本节点和标签节点）
        .filter((_, el) => el.type === "text") // 保留只有文本节点
        .text()
        .replace(/[^\d.]/g, ""));
    const name = jStd($("h1.product-name.my-3.my-md-4.opacity-9").text());
    return {name, price, url: url.toString()};
};

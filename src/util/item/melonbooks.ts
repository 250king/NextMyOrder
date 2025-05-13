import * as cheerio from "cheerio";
import {jStd} from "@/util/string";

export const match = /^https:\/\/www\.melonbooks\.co\.jp\/detail\/detail\.php\?product_id=\d+$/;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("span.yen.__discount").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h1.page-header").text());
    return {name, price, url: url.toString()}
}

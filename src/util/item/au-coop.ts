import * as cheerio from "cheerio";
import {jStd} from "@/util/string";

export const match = /^https:\/\/au-coop\.jp\/products\/([a-zA-Z0-9_-]+)$/;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("span.price").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h1.product-meta__title.heading.h1").text());
    return {name, price, url: url.toString()};
}

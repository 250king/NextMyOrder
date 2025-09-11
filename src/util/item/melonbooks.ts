import * as cheerio from "cheerio";
import {jStd} from "@/util/string";

export const match = /^https:\/\/www\.melonbooks\.co\.jp\/(?:detail|products)\/detail\.php\?product_id=\d+$/;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("span.price--value").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h1.page-header").text());
    const image = `https:${$(".slider > figure > a").attr("href")}`;
    return {name, price, image, url: url.toString().replace("/detail/", "/products/")};
};

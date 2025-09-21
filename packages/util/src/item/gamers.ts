import * as cheerio from "cheerio";
import {jStd} from "../data/string";

export const match = /^https:\/\/www\.gamers\.co\.jp\/pd\/\d+\/?$/;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("p.price > span").text().replace(/[^\d.]/g, ""));
    const name = jStd($("#item_detail > h1").text());
    const image = $("img.img_zoom").attr("src");
    return {name, price, url: url.toString(), image};
};

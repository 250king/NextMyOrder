import * as cheerio from "cheerio";
import {jStd} from "@/util/string";

export const match = /https:\/\/www\.ichijin-shop\.jp\/view\/item\/\d{12}/g;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($('span[data-id="makeshop-item-price:1"]').text().replace(/[^\d.]/g, ""));
    const name = jStd($("h2.item-detail-title").text());
    const image = $("img.item-image").attr("src") || null;
    return {url: url.toString().split("?")[0], name, price, image};
};

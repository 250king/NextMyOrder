import * as cheerio from "cheerio";
import client from "../client/common";
import {jStd} from "../data/string";

export const match = /https:\/\/ecs\.toranoana\.jp\/tora\/ec\/item\/\d{12}\/?/g;

export const parse = async (url: URL) => {
    const http = await client.get(url.toString());
    const $ = cheerio.load(http.data);
    const price = Number($("li.pricearea__price.pricearea__price--normal.color_price.js-price-area").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h1.product-detail-desc-title > span").text());
    return {name, price, url: url.toString()};
}

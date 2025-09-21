import * as cheerio from "cheerio";
import {jStd} from "../data/string";

export const match = /^https:\/\/www\.animate-onlineshop\.jp\/(?:pn\/.+\/)?pd\/(\d+)\/?$/;

export const parse = async (url: URL) => {
    const idMatch = url.href.match(match);
    const productId = idMatch?.[1];
    if (!productId) return null;
    const $ = await cheerio.fromURL(url);
    const price = Number($("p.price.new_price").text().replace(/[^\d.]/g, ""));
    const name = jStd($("div.item_overview_detail > h1").text());
    const image = $("ul.itemThumbnails > li > span > img").attr("src");
    return {name, price, image
        , url: `https://www.animate-onlineshop.jp/pd/${productId}/`};
};

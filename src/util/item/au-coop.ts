import * as cheerio from "cheerio";
import {jStd} from "@/util/string";
import client from "@/util/client/common";

export const match = /^https:\/\/au-coop\.jp\/products\/([a-zA-Z0-9_-]+)$/;

export const parse = async (url: URL) => {
    const http = await client.get(url.toString());
    const $ = cheerio.load(http.data);
    const price = Number($("span.price").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h1.product-meta__title.heading.h1").text());
    const image = $("img.product-gallery__image").attr("src")?.split("?")[0];
    return {name, price, url: url.toString(), image: `https:${image}`};
};

import * as cheerio from 'cheerio';
import {jStd} from "@/util/string";

export const match = /^https:\/\/www\.suruga-ya\.(?:jp|com\/zh-hans)\/product\/(?:detail\/)?([a-zA-Z0-9\-]+)$/;

export const parse = async (url: URL) => {
    const productId = url.pathname.split('/').pop();
    const normalizedUrl = `https://www.suruga-ya.jp/product/detail/${productId}`;
    const $ = await cheerio.fromURL(normalizedUrl);
    const price = Number($("span.text-price-detail.price-buy").text().replace(/[^\d.]/g, ""));
    const name = jStd($("#item_title").text());
    return {name, price, url: normalizedUrl};
}

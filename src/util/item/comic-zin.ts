import * as cheerio from "cheerio";
import {jStd} from "@/util/string";

export const match = /https:\/\/shop\.comiczin\.jp\/products\/detail\.php\?product_id=\d+/g;

export const parse = async (url: URL) => {
    const $ = await cheerio.fromURL(url);
    const price = Number($("span.fnt_mark_color.fnt_size_12em").text().replace(/[^\d.]/g, ""));
    const name = jStd($("h2.fw_main_block_header_type2.vb_space_15px").text());
    return {name, price, url: url.toString()};
}

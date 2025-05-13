import {Group, Item} from "@prisma/client";

export const statusMap = {
    true: {text: "已通过"},
    false: {text: "未通过"}
}

export interface ItemDetail extends Item {
    group: Group;
}

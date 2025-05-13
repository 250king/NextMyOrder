import {Delivery, Item, Order, User} from "@prisma/client";

export const statusMap = {
    pending: {text: "待处理"},
    confirmed: {text: "已确认"},
    waiting: {text: "待发货"},
    finished: {text: "已完成"},
    failed: {text: "失败"}
}

export interface OrderDetail extends Order {
    user: User;
    item: Item;
    delivery: Delivery
}

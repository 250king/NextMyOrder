import {Order, User} from "@prisma/client";
import {ItemDetail} from "@/type/item";
import SfIcon from "@/component/icon/sf";
import ZtoIcon from "@/component/icon/zto";

export const methodMap = {
    sf: {
        text: "顺丰",
        icon: <SfIcon/>
    },
    zto: {
        text: "中通",
        icon: <ZtoIcon/>
    }
};

export interface Delivery extends Order {
    user: User;
    item: ItemDetail;
}

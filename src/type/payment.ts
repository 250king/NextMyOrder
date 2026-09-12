import {
    Payment,
    PaymentItem,
    PaymentMethod as PaymentMethodEnum,
    PaymentType as PaymentTypeEnum,
} from "@/service/db/schema";
import { Query } from "@/type/common";

export type PaymentMethod = (typeof PaymentMethodEnum.enumValues)[number];
export type PaymentType = (typeof PaymentTypeEnum.enumValues)[number];
export type PaymentRow = typeof Payment.$inferSelect;
export type PaymentItemResult = typeof PaymentItem.$inferSelect;

export type PaymentQuery = Query<{
    type?: PaymentType;
    method?: PaymentMethod;
    isPaid?: string;
}>;

export type PaymentResult = PaymentRow & {
    items: PaymentItemResult[];
};

export const methodMap: Record<PaymentMethod, string> = {
    ALIPAY: "支付宝",
    WECHAT: "微信支付",
    JDPAY: "京东支付",
    UNIONPAY: "云闪付",
    CASH: "现金",
};

export const typeMap: Record<PaymentType, string> = {
    DELIVERY: "国内运费",
    TAX: "税费",
    LIST: "商品金额",
    TRANSIT: "国际运费",
};

export const referenceMap: Record<PaymentType, string> = {
    DELIVERY: "分发",
    TAX: "国际运单",
    LIST: "订单",
    TRANSIT: "国际运单",
};

export const statusMap: Record<string, string> = {
    true: "已支付",
    false: "未支付",
};

export const typeIconMap: Record<PaymentType, string> = {
    DELIVERY: "icon-[ri--box-1-fill]",
    TAX: "icon-[ri--money-cny-circle-fill]",
    LIST: "icon-[ri--shopping-cart-2-fill]",
    TRANSIT: "icon-[ri--ship-2-fill]",
};

export const iconMap: Record<PaymentMethod, string> = {
    ALIPAY: "icon-[ri--alipay-fill]",
    WECHAT: "icon-[ri--wechat-pay-fill]",
    JDPAY: "icon-[custom--jdpay]",
    UNIONPAY: "icon-[custom--unipay]",
    CASH: "icon-[ri--cash-fill]",
};

export const colorMap: Record<PaymentMethod, "default" | "success" | "danger" | "warning" | "accent"> = {
    ALIPAY: "accent",
    WECHAT: "success",
    JDPAY: "danger",
    UNIONPAY: "default",
    CASH: "warning",
};

import { Query } from "@/type/common";
import { UserResult } from "@/type/user";
import { payment, paymentMethod, paymentType } from "../service/db/schema";

export type PaymentMethod = (typeof paymentMethod.enumValues)[number]

export type PaymentType = (typeof paymentType.enumValues)[number]

export type PaymentQuery = Query<{
    type?: PaymentType;
    method?: PaymentMethod;
    userId?: number;
}>;

export type PaymentResult = typeof payment.$inferSelect & {
    user: UserResult;
};

export const methodMap: Record<PaymentMethod, string> = {
    ALIPAY: "支付宝",
    WECHAT: "微信支付",
    JDPAY: "京东支付",
    UNIONPAY: "云闪付",
    CASH: "现金",
};

export const typeMap: Record<PaymentType, string> = {
    DELIVERY: "运单",
    TAX: "税费",
    LIST: "需求单",
    TRANSIT: "国际运费",
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
    JDPAY: "icon-[ri--jdpay-fill]",
    UNIONPAY: "icon-[ri--unionpay-fill]",
    CASH: "icon-[ri--cash-fill]",
};

export const colorMap: Record<PaymentMethod, "default" | "success" | "danger" | "warning" | "accent"> = {
    ALIPAY: "accent",
    WECHAT: "success",
    JDPAY: "danger",
    UNIONPAY: "default",
    CASH: "warning",
};

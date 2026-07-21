import { Payment, PaymentMethod as PaymentMethodEnum, PaymentType as PaymentTypeEnum } from "@/service/db/schema";
import { Query } from "@/type/common";
import { UserResult } from "@/type/user";

export type PaymentMethod = (typeof PaymentMethodEnum.enumValues)[number]

export type PaymentType = (typeof PaymentTypeEnum.enumValues)[number]

export type PaymentQuery = Query<{
    type?: PaymentType;
    method?: PaymentMethod;
    userId?: number;
    isPaid?: string;
}>;

export type PaymentResult = typeof Payment.$inferSelect & {
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

export const statusMap: Record<string, string> = {
    true: "已支付",
    false: "未支付"
}

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

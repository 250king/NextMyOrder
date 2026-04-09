import { PaymentResponseMethod, PaymentResponseType } from "@/api/model";

export const methodMap: Record<PaymentResponseMethod, string> = {
    ALIPAY: "支付宝",
    WECHAT: "微信支付",
    JDPAY: "京东支付",
    UNIONPAY: "云闪付",
    CASH: "现金",
};

export const typeMap: Record<PaymentResponseType, string> = {
    DELIVERY: "运单",
    TAX: "税费",
    LIST: "需求单",
    SHIPPING: "国际运费",
};

export const iconMap: Record<PaymentResponseMethod, string> = {
    ALIPAY: "icon-[ri--alipay-fill]",
    WECHAT: "icon-[ri--wechat-pay-fill]",
    JDPAY: "icon-[ri--jdpay-fill]",
    UNIONPAY: "icon-[ri--unionpay-fill]",
    CASH: "icon-[ri--cash-fill]",
};

export const colorMap: Record<PaymentResponseMethod, "default" | "success" | "danger" | "warning" | "accent"> = {
    ALIPAY: "accent",
    WECHAT: "success",
    JDPAY: "danger",
    UNIONPAY: "default",
    CASH: "warning",
};

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
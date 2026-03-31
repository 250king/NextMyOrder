export const toUtf8 = (base64: string) => {
    return Buffer.from(base64, "base64").toString("utf-8");
}

export const currency = (amount: number, type: string) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: type,
    }).format(amount);
}

export const cStd = (value: number) => {
    return Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "JPY",
    }).format(Number(value));
}

export const mStd = (value: number | null) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "unit",
        unit: "gram",
        unitDisplay: "short"
    }).format(value || 0)
}

export const rStd = (value: number) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "percent",
        minimumFractionDigits: 2,
    }).format(value)
}

export const jStd = (value: string) => {
    return value.replace(/[\u3000\u00A0]/g, ' ').trim()
}

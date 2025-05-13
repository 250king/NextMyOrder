export const currencyFormat = (value: number) => {
    return Intl.NumberFormat("ja-JP", {style: "currency", currency: "JPY"}).format(Number(value));
}

export const jStd = (raw: string) => {
    return raw.replace(/[\u3000\u00A0]/g, ' ').trim()
}

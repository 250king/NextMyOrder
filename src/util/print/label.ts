import {labelSdk} from "@/util/print/sdk";
import {methodMap} from "@/type/delivery";
import {DrawTextParams} from "@/type/print";

const printLabel = async (data: Record<string, unknown>, isPrint?: boolean) => {
    const items = [
        {
            x: 2,
            y: 2,
            width: 30,
            height: 4.3,
            value: "香霖堂 中转",
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 0,
            textAlignVertical: 1,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false]
        },
        {
            x: 36,
            y: 2,
            width: 12,
            height: 4.3,
            value: methodMap[data?.method as keyof typeof methodMap].text,
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 2,
            textAlignVertical: 1,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false]
        },
        {
            x: 2,
            y: 15,
            width: 30,
            height: 12.8,
            value: `${data.name}\n${(data.phone as string).slice(-4)}\n${data.province}${data.city}`,
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 0,
            textAlignVertical: 0,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false]
        }
    ];
    if (isPrint) await labelSdk.startJob(3, 1, 1, 1)
    await labelSdk.initCanvas({width: 50, height: 30, rotate: 0, path: "", verticalShift: 0, HorizontalShift: 0});
    for (const item of items) await labelSdk.drawText(item as DrawTextParams)
    await labelSdk.drawQrCode({
        x: 36,
        y: 16,
        width: 12,
        height: 12,
        value: JSON.stringify({
            province: data.province,
            city: data.city,
            name: data.name,
            phone: (data.phone as string).slice(-4),
            method: data.method,
            createdAt: Math.floor(Date.now() / 1000),
        }),
        codeType: 31,
        rotate: 0
    })
    if (isPrint) {
        await labelSdk.commitJob(null, {printQuantity: 1});
    }
    else {
        return await labelSdk.preview(8);
    }
}

export default printLabel;

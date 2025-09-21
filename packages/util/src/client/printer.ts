import {labelSdk} from "../printer/niimbot";
import {companyMap} from "@repo/schema/delivery";
import {DrawTextParams} from "@repo/schema/printer";

const printLabel = async (data: Record<string, unknown>) => {
    const items = [
        {
            x: 2,
            y: 2,
            width: 30,
            height: 4.3,
            value: data.label,
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 0,
            textAlignVertical: 1,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false],
        },
        {
            x: 36,
            y: 2,
            width: 12,
            height: 4.3,
            value: companyMap[data?.company as keyof typeof companyMap].text,
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 2,
            textAlignVertical: 1,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false],
        },
        {
            x: 2,
            y: 15,
            width: 30,
            height: 12.8,
            value: `${data.name}\n${data.city}\n${(data.phone as string).slice(-4)}`,
            fontFamily: "",
            rotate: 0,
            fontSize: 9,
            textAlignHorizonral: 0,
            textAlignVertical: 0,
            letterSpacing: 0,
            lineSpacing: 0,
            lineMode: 6,
            fontStyle: [false, false, false, false],
        },
    ];
    await labelSdk.startJob(3, 1, 1, 1);
    await labelSdk.initCanvas({width: 50, height: 30, rotate: 0, path: "", verticalShift: 0, HorizontalShift: 0});
    for (const item of items) {
        await labelSdk.drawText(item as DrawTextParams);
    }
    await labelSdk.drawQrCode({
        x: 36,
        y: 16,
        width: 12,
        height: 12,
        value: `${window.location.origin}/delivery/${data.id}`,
        codeType: 31,
        rotate: 0,
    });
    await labelSdk.commitJob(null, {printQuantity: 1});
};

export default printLabel;

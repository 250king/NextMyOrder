import QRCode from "qrcode";

type CanvasProps = {
    url: string;
    logoUrl?: string;
    deliveryType?: string;
    carrierName: string;
    receiverName: string;
    receiverPhone: string;
    receiverCity: string;
};

const loadImage = async (src: string) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;

    await image.decode();

    return image;
};

const maskPhone = (phone: string) => {
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
};

export const createLabelCanvas = async ({
    url,
    logoUrl = "/icons/logo.png",
    carrierName,
    receiverName,
    receiverCity,
    receiverPhone,
    deliveryType = "对公",
}: CanvasProps) => {
    const canvas = document.createElement("canvas");

    canvas.width = 400;
    canvas.height = 240;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("无法创建打印画布");
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
        const logo = await loadImage(logoUrl);
        ctx.drawImage(logo, 22, 20, 190, 36);
    } catch {
        ctx.fillStyle = "#000";
        ctx.font = "italic bold 32px sans-serif";
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.fillText("TransDelivery", 22, 52);
    }

    ctx.fillStyle = "#000";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    ctx.font = "20px sans-serif";
    ctx.fillText(`${deliveryType}·${carrierName}`, 236, 28, 146);

    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, url, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 120,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });
    ctx.drawImage(qrCanvas, 250, 92, 120, 120);

    ctx.fillStyle = "#000";
    ctx.font = "24px sans-serif";
    ctx.fillText(receiverName, 24, 76, 200);
    ctx.fillText(receiverCity, 24, 108, 200);
    ctx.fillText(maskPhone(receiverPhone), 24, 140, 200);

    ctx.font = "18px sans-serif";
    ctx.fillText("详细信息请扫码查看，若", 24, 176);
    ctx.fillText("无法访问请联系发件人", 24, 198);

    return canvas;
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
};

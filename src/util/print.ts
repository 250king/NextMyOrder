export const createHelloWorldCanvas = () => {
    const canvas = document.createElement("canvas");

    // 先按 B1 常见标签尺寸粗暴测试，后面再按实际纸张调
    canvas.width = 384;
    canvas.height = 240;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("无法创建打印画布");
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.font = "bold 40px sans-serif";
    ctx.fillText("Hello World", canvas.width / 2, canvas.height / 2);

    return canvas;
};


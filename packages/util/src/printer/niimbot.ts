import {
    ApiResponse,
    DrawQrCodeParams,
    DrawTextParams,
    InitCanvasParams, PrinterRequest,
    PrinterResponse,
    SendMessage,
    StartJobParams,
} from "@repo/schema/printer";

export class LabelSdk {
    private websocket: WebSocket | null = null;
    private callbacks: Map<string, (res: PrinterResponse) => void> = new Map();
    private timeout = 10000;

    constructor(private url = "ws://127.0.0.1:37989") {}

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof window === "undefined") return reject("必须在浏览器中执行");

            this.websocket = new WebSocket(this.url);
            this.websocket.binaryType = "arraybuffer";

            this.websocket.addEventListener("open", () => resolve());
            this.websocket.addEventListener("error", (err) => reject(err));
            this.websocket.addEventListener("message", (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    const cb = this.callbacks.get(msg.apiName);
                    if (cb) {
                        cb(msg.resultAck);
                        this.callbacks.delete(msg.apiName);
                    }
                } catch {
                    console.warn("标签机返回非 JSON 格式", event.data);
                }
            });
        });
    }

    disconnect() {
        this.websocket?.close();
    }

    send<T = ApiResponse, P = Record<string, unknown>>(
        apiName: string,
        parameter: P = {} as P,
        displayScale?: number,
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                return reject(new Error("WebSocket 未连接"));
            }

            const msg: SendMessage<P> = displayScale ? {apiName, displayScale} : {apiName, parameter};
            this.callbacks.set(apiName, (res) => resolve(res as T));

            this.websocket.send(JSON.stringify(msg));

            setTimeout(() => {
                if (this.callbacks.has(apiName)) {
                    this.callbacks.delete(apiName);
                    reject(new Error(`调用 ${apiName} 超时`));
                }
            }, this.timeout);
        });
    }

    initSdk() {
        return this.send("initSdk");
    }

    getAllPrinters() {
        return this.send("getAllPrinters");
    }

    selectPrinter(printerName: string, port: number) {
        return this.send("selectPrinter", { printerName, port });
    }

    setPrinterAutoShutDownTime(nType: 1 | 2 | 3 | 4) {
        return this.send("setPrinterAutoShutDownTime", {nType});
    }

    startJob(printDensity: number, printLabelType: number, printMode: number, count: number) {
        const params: StartJobParams = { printDensity, printLabelType, printMode, count };
        return this.send("startJob", params as unknown as PrinterRequest);
    }

    commitJob(printData: Record<string, unknown> | null, printerImageProcessingInfo: Record<string, unknown>) {
        const params = {printData, printerImageProcessingInfo};
        return this.send("commitJob", params);
    }

    initCanvas(params: InitCanvasParams) {
        return this.send("InitDrawingBoard", params);
    }

    drawText(params: DrawTextParams) {
        return this.send("DrawLableText", params);
    }

    drawQrCode(params: DrawQrCodeParams) {
        return this.send("DrawLableQrCode", params);
    }

    preview(displayScale: number) {
        return this.send("generateImagePreviewImage", {}, displayScale);
    }
}

export const labelSdk = new LabelSdk();

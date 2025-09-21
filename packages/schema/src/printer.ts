export type ApiResponse = Record<string, unknown>;

export type PrinterRequest = Record<string, unknown>;

export interface SendMessage<P = Record<string, unknown>> {
    apiName: string,
    parameter?: P,
    displayScale?: number,
}

export interface PrinterResponse<T = unknown> {
    apiName: string,
    resultAck: T,
}

export interface InitCanvasParams {
    width: number,
    height: number,
    rotate: 0 | 90 | 180 | 270,
    path: "",
    verticalShift: 0,
    HorizontalShift: 0,
}

export interface DrawTextParams {
    x: number,
    y: number,
    width: number,
    height: number,
    value: string,
    fontFamily: "",
    rotate: 0 | 1 | 2 | 3,
    fontSize: number,
    textAlignHorizonral: 0 | 1 | 2,
    textAlignVertical: 0 | 1 | 2,
    letterSpacing: number,
    lineSpacing: number,
    lineMode: 1 | 2 | 4 | 6,
    fontStyle: boolean[],
}

export interface DrawQrCodeParams {
    x: number,
    y: number,
    height: number,
    width: number,
    value: string,
    codeType: 31 | 32 | 33 | 34,
    rotate: 0 | 90 | 180 | 270,
}

export interface StartJobParams {
    printDensity: number,
    printLabelType: number,
    printMode: number,
    count: number,
}

export interface InitCanvasParams {
    width: number,
    height: number,
}

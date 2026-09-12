"use client";
import React from "react";
import axios from "axios";
import QRCode from "qrcode";
import type { PaymentRow } from "@/type/payment";

type WeightProps = {
    url: string;
    data: PaymentRow;
};

export const PaymentWeight = ({ url, data }: WeightProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [finished, setFinished] = React.useState(false);

    React.useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        void QRCode.toCanvas(canvasRef.current, url, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 224,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        });

        const timer = setInterval(async () => {
            const result = await axios.get(`/api/payments/${data.id}`);
            if (result.data.finished) {
                clearInterval(timer);
                setFinished(true);
            }
        }, 2000);

        return () => {
            clearInterval(timer);
        };
    }, [url, data.id]);

    return (
        <div className="relative size-64 overflow-hidden rounded-2xl bg-white p-4">
            <canvas ref={canvasRef} className="size-full" />
            {finished && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95">
                    <div className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
                        <span className="icon-[ri--check-line] size-9" />
                    </div>
                    <div className="text-lg font-semibold text-success">支付成功</div>
                </div>
            )}
        </div>
    );
};

"use client";
import React from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { PaymentResult } from "@/type/payment";

type WeightProps = {
    url: string,
    data: Omit<PaymentResult, "user">
}

export const PaymentWeight = ({url, data}: WeightProps) => {
    const [finished, setFinished] = React.useState(false);
    React.useEffect(() => {
        const timer = setInterval(async () => {
            const result = await axios.get(`/api/payments/${data.id}`);
            if (result.data.finished) {
                clearInterval(timer);
                setFinished(true);
            }
        }, 5000)
        return () => {
            clearInterval(timer);
        }
    }, [data.id])

    return (
        <div className="relative size-64 overflow-hidden rounded-2xl bg-white p-4">
            <QRCode className="size-full" value={url} />
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
}

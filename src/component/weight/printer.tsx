"use client";
import React from "react";
import type { NiimbotSerialClient } from "@mmote/niimbluelib";

type PrinterContextValue = {
    isConnected: boolean;
    isPending: boolean;
    connect: () => Promise<NiimbotSerialClient>;
    disconnect: () => void;
    getClient: () => Promise<NiimbotSerialClient>;
};

const PrinterContext = React.createContext<PrinterContextValue | null>(null);

export const PrinterProvider = ({ children }: React.PropsWithChildren) => {
    const clientRef = React.useRef<NiimbotSerialClient | null>(null);
    const [isConnected, setIsConnected] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);

    const connect = React.useCallback(async () => {
        setIsPending(true);

        try {
            clientRef.current?.disconnect();

            const { NiimbotSerialClient } = await import("@mmote/niimbluelib");
            const client = new NiimbotSerialClient();

            client.on("connect", () => {
                setIsConnected(true);
            });

            client.on("disconnect", () => {
                clientRef.current = null;
                setIsConnected(false);
            });

            await client.connect();

            clientRef.current = client;
            setIsConnected(true);

            return client;
        } finally {
            setIsPending(false);
        }
    }, []);

    const disconnect = React.useCallback(() => {
        clientRef.current?.disconnect();
        clientRef.current = null;
        setIsConnected(false);
    }, []);

    const getClient = React.useCallback(async () => {
        if (clientRef.current?.isConnected()) {
            return clientRef.current;
        }

        return connect();
    }, [connect]);

    const value = React.useMemo(
        () => ({
            isConnected,
            isPending,
            connect,
            disconnect,
            getClient,
        }),
        [isConnected, isPending, connect, disconnect, getClient]
    );

    return <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>;
};

export const usePrinter = () => {
    const context = React.useContext(PrinterContext);

    if (!context) {
        throw new Error("usePrinter 必须在 PrinterProvider 内使用");
    }

    return context;
};

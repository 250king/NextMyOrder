"use client";

import React from "react";
import { toast } from "@heroui/react";

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "操作失败，请稍后重试";
};

export const useHttp = () => {
    const [isPending, startTransition] = React.useTransition();

    const runAction = React.useCallback(
        (
            action: () => Promise<void>,
            options?: {
                success?: string;
                error?: string;
            }
        ) => {
            if (isPending) return;

            startTransition(async () => {
                try {
                    await action();

                    if (options?.success) {
                        toast.success(options.success);
                    }
                } catch (error) {
                    console.error(error);
                    toast.danger(options?.error ?? getErrorMessage(error));
                }
            });
        },
        [isPending]
    );

    return [isPending, runAction] as const;
};

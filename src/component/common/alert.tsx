"use client";
import React from "react";
import { AlertDialog, Button } from "@heroui/react";
import { useHttp } from "@/util/request";

type AlertProps = React.PropsWithChildren<{
    title: string;
    status: "default" | "accent" | "success" | "warning" | "danger";
    onConfirmed: () => Promise<void>;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (value: boolean) => void;
    confirmLabel?: React.ReactNode;
    confirmVariant?: React.ComponentProps<typeof Button>["variant"];
}>;

export const AlertModal = ({
    title,
    onConfirmed,
    children,
    trigger,
    status,
    open,
    onOpenChange,
    confirmLabel = "确认",
    confirmVariant,
}: AlertProps) => {
    const [isPending, runAction] = useHttp();
    const [show, setShow] = React.useState(false);

    const current = open ?? show;
    const handleClose = onOpenChange ?? setShow;

    return (
        <AlertDialog isOpen={current} onOpenChange={handleClose}>
            {trigger}
            <AlertDialog.Backdrop isDismissable={false}>
                <AlertDialog.Container placement="center">
                    <AlertDialog.Dialog>
                        <AlertDialog.Header>
                            <AlertDialog.Icon status={status} />
                            <AlertDialog.Heading>{title}</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>{children}</AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button
                                slot="close"
                                variant="tertiary"
                                isPending={isPending}
                            >
                                取消
                            </Button>
                            <Button
                                variant={confirmVariant}
                                isPending={isPending}
                                onClick={async () => {
                                    runAction(async () => {
                                        await onConfirmed();
                                        handleClose(false);
                                    });
                                }}
                            >
                                {confirmLabel}
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
};

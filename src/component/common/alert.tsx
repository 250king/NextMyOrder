"use client";
import React from "react";
import { AlertDialog, Button } from "@heroui/react";

type AlertProps = React.PropsWithChildren<{
    title: string;
    status: "default" | "accent" | "success" | "warning" | "danger";
    onConfirmed: () => Promise<void>;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (value: boolean) => void;
}>;

export const AlertModal = ({title, onConfirmed, children, trigger, status, open, onOpenChange}: AlertProps) => {
    const [isPending, startTransition] = React.useTransition();
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
                                variant="danger"
                                isPending={isPending}
                                onClick={async () => {
                                    startTransition(async () => {
                                        await onConfirmed();
                                        handleClose(false);
                                    })
                                }}
                            >
                                确认
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}

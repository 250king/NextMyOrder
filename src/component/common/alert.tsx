"use client";
import React from "react";
import { AlertDialog, Button } from "@heroui/react";

type AlertProps = React.PropsWithChildren<{
    title: string;
    status: "default" | "accent" | "success" | "warning" | "danger";
    trigger: React.ReactNode;
    onConfirmed: () => Promise<void>;
}>;

export const AlertModal = ({title, onConfirmed, children, trigger, status}: AlertProps) => {
    const [isPending, startTransition] = React.useTransition();
    const [open, setOpen] = React.useState(false);

    return (
        <AlertDialog isOpen={open} onOpenChange={setOpen}>
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
                                        setOpen(false);
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

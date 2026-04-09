import { Spinner } from "@heroui/react";

export const Loading = () => {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Spinner size="md" />
        </div>
    );
}

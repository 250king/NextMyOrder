import React from "react";
import { Modal, Skeleton } from "@heroui/react";

type ImagePreviewProps = {
    src: string;
    alt: string;
    className?: string;
};

export const CardImage = ({ src }: { src: string }) => {
    const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null);
    const isLoading = loadedSrc !== src;

    const handleImageRef = React.useCallback(
        (image: HTMLImageElement | null) => {
            if (image?.complete && image.naturalWidth > 0) {
                setLoadedSrc(src);
            }
        },
        [src]
    );

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-default-100">
            {isLoading && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
            <img
                ref={handleImageRef}
                alt=""
                src={src}
                className={`z-0 h-full w-full object-cover transition-all duration-500 ${
                    isLoading ? "scale-105 opacity-0" : "scale-100 opacity-100"
                } hover:scale-110`}
                onLoad={() => setLoadedSrc(src)}
                onError={() => setLoadedSrc(src)}
                referrerPolicy="no-referrer"
            />
        </div>
    );
};

export const ImagePreview = ({ src, alt, className }: ImagePreviewProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <button
                type="button"
                className="absolute inset-0 block cursor-zoom-in"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(true);
                }}
            >
                <img src={src} alt={alt} className={className} loading="lazy"  />
            </button>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <Modal.Backdrop>
                    <Modal.Container placement="center">
                        <Modal.Dialog className="bg-transparent shadow-none">
                            <Modal.CloseTrigger />
                            <Modal.Body className="p-0">
                                <img
                                    src={src}
                                    alt={alt}
                                    className="max-h-[85vh] max-w-full rounded-2xl object-contain"
                                />
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
};
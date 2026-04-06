import React from "react";
import { Skeleton } from "@heroui/react";

export const CardImage = ({src}: {src: string}) => {
    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <div className="relative w-full aspect-video overflow-hidden bg-default-100 rounded-t-xl">
            {isLoading && <Skeleton className="absolute inset-0 z-10 w-full h-full" />}
            <img
                alt=""
                src={src}
                className={`z-0 w-full h-full object-cover transition-all duration-500 ${
                    isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
                } hover:scale-110`}
                onLoad={() => setIsLoading(false)}
                referrerPolicy="no-referrer"
            />
        </div>
    );
}

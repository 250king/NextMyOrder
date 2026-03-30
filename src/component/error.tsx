"use client";
import { LinkButton } from "@/component/button";

export const Error = ({ next }: { next?: string }) => {
    return (
        <div className="container mx-auto p-6">
            <div className="flex min-h-[70vh] flex-col gap-4">
                <div className="flex flex-1 flex-col items-center justify-center">
                    <h1 className="mb-4 text-2xl font-bold">请求非法，请稍后再试</h1>
                    <LinkButton href={`/login${next ? `?next=${next}` : ""}`}>重新登录</LinkButton>
                </div>
            </div>
        </div>
    );
};

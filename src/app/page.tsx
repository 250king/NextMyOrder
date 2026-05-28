"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();

    React.useEffect(() => {
        router.replace("/groups")
    }, [router])
}

export default Page;

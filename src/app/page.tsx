"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace("/groups")
    }, [router])
}

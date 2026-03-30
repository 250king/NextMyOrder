"use client";
import React from "react";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    React.useEffect(() => {
        void router.replace("/payments")
    }, [router])
}

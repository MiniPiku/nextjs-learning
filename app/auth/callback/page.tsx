"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userId = params.get("userId");

        if (token && userId) {
            // ✅ Store JWT and userId
            localStorage.setItem("jwt", token);
            localStorage.setItem("userId", userId);

            // ✅ Redirect to main page
            router.push("/");
        } else {
            console.error("OAuth callback missing token or userId");
        }
    }, []);

    return <div>Logging in…</div>;
}

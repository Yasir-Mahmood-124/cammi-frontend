// src/Views/linkedin/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import LinkedInPostForm from "./LinkedInPostForm";
import LinkedInLogin from "./LinkedInLogin";
// import GradientCard from "@/components/common/GradientCard";

const Linkedin = () => {
    const [sub, setSub] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // ✅ Check if URL contains ?sub=...
            const params = new URLSearchParams(window.location.search);
            const urlSub = params.get("sub");

            if (urlSub) {
                // Save in localStorage
                localStorage.setItem("linkedin_sub", urlSub);
                setSub(urlSub);

                // ✅ Clean the URL (remove ?sub=... from browser)
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // If already saved, load from localStorage
                const storedSub = localStorage.getItem("linkedin_sub");
                if (storedSub) setSub(storedSub);
            }
        }
    }, []);

    if (!sub) {
        return <LinkedInLogin />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* <Box sx={{ mb: 2 }}>
                <GradientCard
                    heading="Linkedin Post"
                    content="Craft Engaging Posts that drives results."
                />
            </Box> */}

            <LinkedInPostForm sub={sub} />
        </Container>
    );
};

export default Linkedin;
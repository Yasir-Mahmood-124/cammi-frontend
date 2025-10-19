"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useGetPostsMutation } from "@/redux/services/linkedin/viewApiSlice";
import CalendarView from "./CalendarView"; // adjust path if needed

const Events = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [sub, setSub] = useState<string | null>(null);

  const [getPosts, { isLoading, error }] = useGetPostsMutation();

  useEffect(() => {
    const fetchPosts = async (currentSub: string) => {
      try {
        const result = await getPosts({ sub: currentSub }).unwrap();

        const mappedPosts = result.map((item: any, index: number) => ({
          id: item.post_urn || `scheduled-${index}`,
          post_time: item.post_time,
          schedule_time: item.scheduled_time || item.post_time,
          message: item.message || item.post_urn || "",
          status: item.status === "pending" ? "pending" : "posted",
        }));

        setPosts(mappedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    // Always fetch fresh posts when Events is mounted
    const savedSub = localStorage.getItem("linkedin_sub");
    if (savedSub) {
      setSub(savedSub);
      fetchPosts(savedSub);
    }
  }, [getPosts]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">Error fetching posts</Typography>
      ) : (
        <CalendarView posts={posts} />
      )}
    </Box>
  );
};

export default Events;
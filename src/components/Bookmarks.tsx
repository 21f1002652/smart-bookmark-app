"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

// Type for bookmarks
type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Fetch bookmarks for the logged-in user
  const fetchBookmarks = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from("bookmarks") // No generics needed in Supabase v2
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks((data as Bookmark[]) ?? []);
  };

  // Realtime subscription and initial fetch
  useEffect(() => {
    fetchBookmarks();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        fetchBookmarks
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add new bookmark
  const addBookmark = async () => {
    if (!title || !url) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    setTitle("");
    setUrl("");
  };

  // Delete a bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={addBookmark}>Add</button>
      </div>

      <ul>
        {bookmarks.map((b) => (
          <li key={b.id} style={{ marginBottom: "0.5rem" }}>
            <a href={b.url} target="_blank" rel="noreferrer">
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              style={{ marginLeft: "0.5rem" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

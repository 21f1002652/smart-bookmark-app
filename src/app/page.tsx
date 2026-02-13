import Auth from "@/components/Auth";
import Bookmarks from "@/components/Bookmarks";

export default function Home() {
  return (
    <main>
      <h1>Smart Bookmark App</h1>
      <Auth />
      <Bookmarks />
    </main>
  );
}

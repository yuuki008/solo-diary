import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";

export default function Home() {
  return (
    <div className="flex flex-col relative max-w-lg w-[95%] mx-auto">
      <div className="pt-6 pb-[50vh]">
        <PostList />
      </div>

      <CreatePostForm />
    </div>
  );
}

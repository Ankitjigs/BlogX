import { createPost } from "@/actions/post";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function NewEditorPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Create an initial draft immediately so we have a valid ID for the new UI
  const post = await createPost({
    title: "",
    content: {}, // Empty JSON for Tiptap
    published: false,
  });

  if (post?.id) {
    redirect(`/editor/${post.id}`);
  }

  // Fallback if creation fails
  redirect("/dashboard");
}

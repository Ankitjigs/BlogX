import { getPost } from "@/actions/post";
import EditorScreen from "@/components/editor/EditorScreen";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage(props: EditorPageProps) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <EditorScreen initialPost={post} />;
}

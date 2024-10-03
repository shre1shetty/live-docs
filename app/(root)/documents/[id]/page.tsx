import CollaborativeRoom from "@/components/CollaborativeRoom";
import { Header } from "@/components/Header";
import { Editor } from "@/components/editor/Editor";
import { getDocument } from "@/lib/actions/room.action";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const room = await getDocument({
    userId: clerkUser.emailAddresses[0].emailAddress,
    roomId: id,
  });
  if (!room) redirect("/");
  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });
  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";
  return (
    <main className="flex flex-col w-full items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        currentUserType={currentUserType}
        users={usersData}
      ></CollaborativeRoom>
    </main>
  );
};

export default Document;

"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { Header } from "./Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Editor } from "./editor/Editor";
import ActiveCollaborators from "./ActiveCollaborators";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.action";
import Loader from "./Loader";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType,
}: CollaborativeRoomProps) => {
  const [editing, setediting] = useState(false);
  const [loading, setloading] = useState(false);
  const [documentTitle, setdocumentTitle] = useState(roomMetadata.title);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setloading(true);
      try {
        if (documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);
          if (updatedDocument) {
            console.log(updatedDocument);
            setediting(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
      setloading(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setediting(false);
        updateDocument(roomId, documentTitle);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roomId, documentTitle]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex justify-center items-center gap-2 w-fit"
            >
              {editing && !loading ? (
                <Input
                  ref={inputRef}
                  value={documentTitle}
                  placeholder="Enter Title"
                  onChange={(e) => setdocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}
              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="Edit"
                  width={24}
                  height={24}
                  onClick={() => setediting(true)}
                  className="pointer"
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View Only</p>
              )}
              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal
                collaborators={users}
                roomId={roomId}
                currentUserType={currentUserType}
                creatorId={roomMetadata.creatorId}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor currentUserType={currentUserType} roomId={roomId} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;

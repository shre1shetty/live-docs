"use client";
import { useSelf } from "@liveblocks/react/suspense";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import Image from "next/image";
import { Input } from "./ui/input";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
import { updateDocumentAccess } from "@/lib/actions/user.actions";

const ShareModal = ({
  collaborators,
  creatorId,
  currentUserType,
  roomId,
}: ShareDocumentDialogProps) => {
  const user = useSelf();
  const [Open, setOpen] = useState(false);
  const [loading, setloading] = useState(false);

  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");

  const shareDocumentHandler = async () => {
    setloading(true);
    await updateDocumentAccess({
      roomId,
      email,
      updatedBy: user.info,
      userType: userType as UserType,
    });
    setloading(false);
  };
  return (
    <Dialog open={Open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          <Image
            src={"/assets/icons/share.svg"}
            alt="share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription>
            Select the users who can view and edit this document
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="email" className="mt-6 text-blue-100">
          Email Address
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 rounded-md bg-dark-400">
            <Input
              id="email"
              value={email}
              placeholder="Enter email address"
              onChange={(e) => setEmail(e.target.value)}
              className="share-input"
            />
            <UserTypeSelector setUserType={setUserType} userType={userType} />
          </div>
          <Button
            type="submit"
            onClick={shareDocumentHandler}
            className="gradient-blue flex h-full gap-1 px-5"
            disabled={loading}
          >
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>
        <div className="my-2 space-y-2">
          <ul className="flex flex-col">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.id}
                collaborator={collaborator}
                creatorId={creatorId}
                email={collaborator.email}
                user={user.info}
                roomId={roomId}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

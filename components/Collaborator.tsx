import Image from "next/image";
import React, { useState } from "react";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "./ui/button";
import {
  removeCollabrator,
  updateDocumentAccess,
} from "@/lib/actions/user.actions";

const Collaborator = ({
  collaborator,
  creatorId,
  email,
  roomId,
  user,
}: CollaboratorProps) => {
  const [userType, setUserType] = useState(collaborator.userType || "viewer");
  const [loading, setloading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    setloading(true);
    await updateDocumentAccess({
      roomId,
      email,
      updatedBy: user,
      userType: type as UserType,
    });
    setloading(false);
  };
  const removeCollaboratorHandler = async (email: string) => {
    setloading(true);
    await removeCollabrator({ email, roomId });
    setloading(false);
  };
  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {collaborator.name}
            <span className="text-10-regular pl-2 text-blue-100">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-sm font-light text-blue-100">
            {collaborator.email}
          </p>
        </div>
      </div>
      {creatorId === collaborator.id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            setUserType={setUserType || "viewer"}
            userType={userType as UserType}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;

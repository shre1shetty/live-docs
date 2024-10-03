"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getAccessType, parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });
    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));
    const sortedUser = userIds.map((email) =>
      users.find((user) => user.email === email)
    );
    return parseStringify(sortedUser);
  } catch (error) {
    console.log(error);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );
    if (text.length) {
      const lowerCaseText = text.toLowerCase();
      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );
      return parseStringify(filteredUsers);
    }
    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
};

export const updateDocumentAccess = async ({
  email,
  roomId,
  updatedBy,
  userType,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };
    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });
    if (room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        subjectId: notificationId,
        kind: "$documentAccess",
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access : ${error}`);
  }
};

export const removeCollabrator = async ({
  email,
  roomId,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document");
    }
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: { [email]: null },
    });
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while updating a room access : ${error}`);
  }
};

"use client";
import React, { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import {
  InboxNotification,
  InboxNotificationList,
  LiveblocksUIConfig,
} from "@liveblocks/react-ui";

const Notification = () => {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();
  const unreadNotification = inboxNotifications.filter(
    (notification) => !notification.readAt
  );
  return (
    <Popover>
      <PopoverTrigger className="relative flex items-center justify-center rounded-lg size-10">
        <Image
          src="/assets/icons/bell.svg"
          alt="inbox"
          width={24}
          height={24}
        />
        {count > 0 && (
          <div className="absolute top-2 z-20 size-2 rounded-full bg-blue-500"></div>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="shad-popover">
        <LiveblocksUIConfig
          overrides={{
            INBOX_NOTIFICATION_TEXT_MENTION: (user: ReactNode) => (
              <>{user} mentioned you.</>
            ),
          }}
        >
          <InboxNotificationList>
            {unreadNotification.length <= 0 ? (
              <p className="py-2 text-center text-dark-500">
                No New Notifications
              </p>
            ) : (
              unreadNotification.map((notification) => (
                <InboxNotification
                  key={notification.id}
                  inboxNotification={notification}
                  className="bg-dark-200 text-white"
                  href={`/documents/${notification.roomId}`}
                  showActions={false}
                  kinds={{
                    thread: (props) => (
                      <InboxNotification.Thread
                        {...props}
                        showActions={false}
                        showRoomName={false}
                      />
                    ),
                    textMention: (props) => (
                      <InboxNotification.TextMention
                        {...props}
                        showRoomName={false}
                      />
                    ),
                    $documentAccess: (props) => {
                      const { title, avatar } =
                        props.inboxNotification.activities[0].data;

                      return (
                        <InboxNotification.Custom
                          {...props}
                          title={title}
                          aside={
                            <InboxNotification.Icon className="bg-transparent">
                              <Image
                                src={(avatar as string) || ""}
                                width={36}
                                height={36}
                                alt="avatar"
                                className="rounded-full"
                              />
                            </InboxNotification.Icon>
                          }
                        >
                          {props.children}
                        </InboxNotification.Custom>
                      );
                    },
                  }}
                />
              ))
            )}
          </InboxNotificationList>
        </LiveblocksUIConfig>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;

// کامپوننت MessageList (لیست پیام‌ها با اسکرول خودکار)
// src/components/chat/ChatArea/MessageList.tsx

import { Box, CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import type { Message } from "../../../types/chat";
import { MessageItem } from "./MessageItem";
import { useFontSize } from "../../../context/FontSizeContext";
// import { useFontSize } from "../../../hooks/useFontSize";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  // fetchNextPage: () => void;
  fetchNextPage: () => Promise<any>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const MessageList = ({
  messages,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: MessageListProps) => {
  const { fontSize } = useFontSize(); // ← فقط برای ایجاد وابستگی و رندر مجدد
  // console.log("MessageList fontSize", fontSize);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // اسکرول به پایین برای پیام‌های جدید
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // IntersectionObserver برای تشخیص رسیدن به بالای لیست (بارگذاری صفحات قدیمی‌تر)
  useEffect(() => {
    if (!loaderRef.current || !hasNextPage || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          // ذخیره موقعیت اسکرول قبل از بارگذاری
          const container = containerRef.current;
          if (container) {
            const scrollHeight = container.scrollHeight;
            const scrollTop = container.scrollTop;

            fetchNextPage().then(() => {
              // پس از بارگذاری، موقعیت اسکرول را به همان نسبت قبلی برگردان
              requestAnimationFrame(() => {
                if (container) {
                  const newScrollHeight = container.scrollHeight;
                  container.scrollTop = newScrollHeight - scrollHeight + scrollTop;
                }
              });
            });
          } else {
            fetchNextPage();
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

  // if (isLoading) {
  //   return (
  //     <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (isLoading && messages.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  // return (
  //   <Box
  //     sx={{
  //       flex: 1,
  //       overflowY: "auto",
  //       py: 2,
  //       bgcolor: "background.default",
  //       display: "flex",
  //       flexDirection: "column",
  //     }}
  //   >
  //     {messages.length === 0 ? (
  //       <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
  //         هیچ پیامی وجود ندارد. اولین پیام را ارسال کنید!
  //       </Box>
  //     ) : (
  //       messages?.map((message, index) => {
  //         const isPreviousSameSender =
  //           index > 0 && messages[index - 1].senderId === message.senderId;
  //         return (
  //           <MessageItem
  //             key={message.id}
  //             message={message}
  //             isPreviousSameSender={isPreviousSameSender}
  //             fontSize={fontSize} // ← پاس دادن fontSize به عنوان prop
  //           />
  //         );
  //       })
  //     )}
  //     <div ref={messagesEndRef} />
  //   </Box>
  // );

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflowY: "auto",
        py: 2,
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* المان Observer برای بارگذاری صفحات قبلی */}
      {hasNextPage && (
        <Box ref={loaderRef} sx={{ textAlign: "center", py: 1 }}>
          {isFetchingNextPage && <CircularProgress size={24} />}
        </Box>
      )}

      {messages.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
          هیچ پیامی وجود ندارد. اولین پیام را ارسال کنید!
        </Box>
      ) : (
        messages.map((message, index) => {
          const isPreviousSameSender =
            index > 0 && messages[index - 1].senderId === message.senderId;
          return (
            <MessageItem
              key={message.id}
              message={message}
              isPreviousSameSender={isPreviousSameSender}
              fontSize={fontSize}
            />
          );
        })
      )}

      {/* المان انتهای لیست برای اسکرول خودکار به پایین */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

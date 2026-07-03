// frontend/src/components/chat/NewChatDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  CircularProgress,
  Box,
  Typography,
  ListItemButton, // ← اضافه شده
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchUsers, createPrivateChat } from "../../services/chat";
import toast from "react-hot-toast";
import type { ChatSummary } from "../../types/chat";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export const NewChatDialog = ({ open, onClose, onChatCreated }: NewChatDialogProps) => {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 30000,
    select: (res) => res.body,
  });

  const createChatMutation = useMutation({
    mutationFn: createPrivateChat,
    onSuccess: (data) => {
      const chat = data?.body;
      toast.success("چت ایجاد شد");
      queryClient.setQueryData<ChatSummary[]>(["chats"], (old = []) => [chat, ...old]);
      onChatCreated(chat.id);
      onClose();
      setQuery("");
    },
    onError: (error: any) => {
      toast.error("خطا در ایجاد چت: " + (error.message || ""));
    },
  });

  const handleSelectUser = (userId: string) => {
    createChatMutation.mutate(userId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          شروع چت جدید
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="جستجوی نام کاربری، شماره یا نام..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
            },
          }}
          sx={{ mb: 2 }}
        />
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {!isLoading && users.length === 0 && query.length >= 2 && (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            کاربری یافت نشد
          </Typography>
        )}
        <List>
          {users?.map((user) => (
            <ListItemButton
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              disabled={createChatMutation.isPending}
              sx={{ cursor: "pointer" }}
            >
              <ListItemAvatar>
                <Avatar src={user.avatar || undefined}>{user.username?.[0] || "?"}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.name || user.username} secondary={user.username} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

// // frontend/src/components/chat/NewChatDialog.tsx

// import { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Avatar,
//   IconButton,
//   CircularProgress,
//   Box,
//   Typography,
// } from "@mui/material";
// import { Close, Search } from "@mui/icons-material";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { searchUsers, createPrivateChat } from "../../services/chat";
// import toast from "react-hot-toast";
// import type { ChatSummary } from "../../types/chat";

// interface NewChatDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onChatCreated: (chatId: string) => void;
// }

// export const NewChatDialog = ({ open, onClose, onChatCreated }: NewChatDialogProps) => {
//   const [query, setQuery] = useState("");
//   const queryClient = useQueryClient();

//   const { data: users = [], isLoading } = useQuery({
//     queryKey: ["searchUsers", query],
//     queryFn: () => searchUsers(query),
//     enabled: query.length >= 2,
//     staleTime: 30000,
//   });

//   const createChatMutation = useMutation({
//     mutationFn: createPrivateChat,
//     onSuccess: (chat) => {
//       toast.success("چت ایجاد شد");
//       queryClient.setQueryData<ChatSummary[]>(["chats"], (old = []) => [chat, ...old]);
//       onChatCreated(chat.id);
//       onClose();
//       setQuery("");
//     },
//     onError: (error: any) => {
//       toast.error("خطا در ایجاد چت: " + (error.message || ""));
//     },
//   });

//   const handleSelectUser = (userId: string) => {
//     createChatMutation.mutate(userId);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           شروع چت جدید
//           <IconButton onClick={onClose}>
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <TextField
//           fullWidth
//           placeholder="جستجوی نام کاربری، شماره یا نام..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           slotProps={{
//             input: {
//               startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
//             },
//           }}
//           sx={{ mb: 2 }}
//         />
//         {isLoading && (
//           <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
//             <CircularProgress size={24} />
//           </Box>
//         )}
//         {!isLoading && users.length === 0 && query.length >= 2 && (
//           <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
//             کاربری یافت نشد
//           </Typography>
//         )}
//         <List>
//           {users?.map((user) => (
//             <ListItem
//               key={user.id}
//               component="div"
//               onClick={() => handleSelectUser(user.id)}
//               disabled={createChatMutation.isPending}
//               sx={{ cursor: "pointer" }}
//             >
//               <ListItemAvatar>
//                 <Avatar src={user.avatar || undefined}>{user.username?.[0] || "?"}</Avatar>
//               </ListItemAvatar>
//               <ListItemText primary={user.name || user.username} secondary={user.username} />
//             </ListItem>
//           ))}
//         </List>
//       </DialogContent>
//     </Dialog>
//   );
// };

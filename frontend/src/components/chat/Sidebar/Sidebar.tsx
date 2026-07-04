// src/components/chat/Sidebar/Sidebar.tsx

import { Box, Drawer, Toolbar, Typography, IconButton, Divider, Badge, Fab } from "@mui/material";
import type { ChatSummary } from "../../../types/chat";
import ChatList from "./ChatList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import { Add as AddIcon } from "@mui/icons-material";
import { NewChatDialog } from "../NewChatDialog";
import { useMemo, useState } from "react";
import { ThemeToggle } from "../../common/ThemeToggle";
import { ProfileDialog } from "./ProfileDialog";
import { SettingsDialog } from "./SettingsDialog";

interface SidebarProps {
  chats: ChatSummary[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isConnected: boolean;
  handleChatCreated: (chatId: string) => void;
}

// const drawerWidth = Math.min(360, window?.innerWidth);
const DRAWER_WIDTH = 360;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.hover,
  marginLeft: 0,
  width: "100%",
  padding: "4px 12px",
  display: "flex",
  alignItems: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(0.5)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const Sidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  isConnected,
  handleChatCreated,
}: SidebarProps) => {
  const [newChatDialogOpen, setNewChatDialogOpen] = useState<boolean>(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState<boolean>(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats; // اگر جستجو خالی است، همه را نشان بده
    const lowerTerm = searchTerm.toLowerCase().trim();
    return chats.filter(
      (chat) =>
        chat?.name?.toLowerCase().includes(lowerTerm) ||
        chat.participants?.some(
          (p) =>
            p?.user?.name?.toLowerCase().includes(lowerTerm) ||
            p?.user?.username?.toLowerCase().includes(lowerTerm)
        )
    );
  }, [chats, searchTerm]);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: "100vw", sm: DRAWER_WIDTH },
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: { xs: "100vw", sm: DRAWER_WIDTH },
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" noWrap component="div">
              پیام‌ها
            </Typography>
            {!isConnected && <Badge color="warning" variant="dot" sx={{ ml: 1 }} />}
          </Box>
          <Box>
            <IconButton size="small" onClick={() => setProfileDialogOpen(true)}>
              <AccountCircleIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setSettingsDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <ThemeToggle />
          </Box>
        </Toolbar>
        <Box sx={{ px: 2, pb: 1 }}>
          <Search>
            <IconButton size="small" sx={{ p: 0.5, color: "text.secondary" }}>
              <SearchIcon fontSize="small" />
            </IconButton>
            <StyledInputBase
              placeholder="جستجوی چت‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ "aria-label": "search" }}
              sx={{
                pointerEvents: "auto",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </Search>
        </Box>
        <Divider />
        <Box sx={{ overflowY: "auto", flexGrow: 1, px: 1 }}>
          <ChatList
            chats={filteredChats || []}
            selectedChatId={selectedChatId}
            onSelectChat={onSelectChat}
          />
        </Box>

        <Fab
          color="primary"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          onClick={() => setNewChatDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Drawer>
      {/* دیالوگ‌ها */}
      <NewChatDialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        onChatCreated={handleChatCreated}
      />
      <ProfileDialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} />
      <SettingsDialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} />
    </>
  );
};

export default Sidebar;

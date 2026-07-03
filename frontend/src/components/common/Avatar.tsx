// src/components/common/Avatar.tsx

import { Avatar as MuiAvatar, Badge, styled } from "@mui/material";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  isOnline?: boolean;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: 12,
    height: 12,
    borderRadius: "50%",
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Avatar = ({ src, alt, size = 40, isOnline = false }: AvatarProps) => {
  const avatar = (
    <MuiAvatar
      src={src || undefined}
      alt={alt || "User avatar"}
      sx={{ width: size, height: size }}
    />
  );

  if (isOnline) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
      >
        {avatar}
      </StyledBadge>
    );
  }

  return avatar;
};

export default Avatar;

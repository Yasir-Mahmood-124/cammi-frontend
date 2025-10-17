// "use client";

// import { Button, CircularProgress } from "@mui/material";
// import React from "react";

// interface PrimaryButtonProps {
//   text: string;
//   onClick?: () => void;
//   disabled?: boolean;
//   loading?: boolean; // optional loading indicator
//   width?: string;
//   height?: string;
//   backgroundColor?: string;
// }

// export default function PrimaryButton({
//   text,
//   onClick,
//   disabled = false,
//   loading = false,
//   width = "356px",
//   height = "60px",
//   backgroundColor = "#3EA2FF",
// }: PrimaryButtonProps) {
//   return (
//     <Button
//       onClick={onClick}
//       disabled={disabled || loading}
//       sx={{
//         display: "flex",
//         width,
//         height,
//         padding: "14.5px 105px 15.5px 105px",
//         justifyContent: "center",
//         alignItems: "center",
//         flexShrink: 0,
//         borderRadius: "32px",
//         background: disabled ? "#A0CFFF" : backgroundColor,
//         color: "#FFF",
//         textAlign: "center",
//         fontFamily: "Poppins, sans-serif",
//         fontSize: "20px",
//         fontStyle: "normal",
//         fontWeight: 500,
//         lineHeight: "normal",
//         textTransform: "none",
//         boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//         "&:hover": {
//           background: "#3590E6",
//         },
//       }}
//     >
//       {loading ? <CircularProgress size={22} sx={{ color: "#FFF" }} /> : text}
//     </Button>
//   );
// }

"use client";

import { Button, CircularProgress, SxProps } from "@mui/material";
import React from "react";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean; // show spinner
  width?: string;
  height?: string;
  backgroundColor?: string;
  sx?: SxProps;
}

export default function PrimaryButton({
  text,
  onClick,
  disabled = false,
  loading = false,
  width = "356px",
  height = "60px",
  backgroundColor = "#3EA2FF",
  sx = {},
}: PrimaryButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        display: "flex",
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "32px",
        background: disabled ? "#A0CFFF" : backgroundColor,
        color: "#FFF",
        fontFamily: "Poppins, sans-serif",
        fontSize: "20px",
        fontWeight: 500,
        textTransform: "none",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          background: "#3590E6",
          color: "#ffff",
        },
        ...sx,
      }}
    >
      {loading ? <CircularProgress size={22} sx={{ color: "#FFF" }} /> : text}
    </Button>
  );
}

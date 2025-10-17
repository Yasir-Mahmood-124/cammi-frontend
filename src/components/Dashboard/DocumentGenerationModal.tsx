// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Grid,
//   Typography,
//   IconButton,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Box,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// export default function DocumentGenerationModal({
//   open,
//   onClose,
//   selected,
//   setSelected,
// }: {
//   open: boolean;
//   onClose: () => void;
//   selected: string[];
//   setSelected: React.Dispatch<React.SetStateAction<string[]>>;
// }) {
//   const clarifyOptions = [
//     "GTM Document",
//     "ICP Document",
//     "Strategy Roadmap",
//     "Messaging Framework",
//     "Brand Identity",
//   ];

//   const alignOptions = [
//     "Quarterly marketing plan",
//     "Content calendar template",
//   ];

//   const handleToggle = (option: string, type: "clarify" | "align") => {
//     // Clarify options should always stay checked — do nothing
//     if (type === "clarify") return;

//     // Align options can be toggled
//     setSelected((prev) =>
//       prev.includes(option)
//         ? prev.filter((i) => i !== option)
//         : [...prev, option]
//     );
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           width: "591px",
//           height: "340px",
//           flexShrink: 0,
//           borderRadius: "16px",
//           backgroundColor: "#FFF",
//           boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
//           overflow: "hidden",
//           py: 3,
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{
//           color: "#000000",
//           fontFamily: "Poppins, sans-serif",
//           fontSize: "36px",
//           fontStyle: "normal",
//           fontWeight: 500,
//           lineHeight: "24px", // 66.667%
//           textAlign: "center",
//           pb: 0,
//         }}
//       >
//         Document Generation
//         <IconButton
//           onClick={onClose}
//           sx={{
//             position: "absolute",
//             right: 16,
//             top: 16,
//             width: "20px",
//             height: "20px",
//             padding: 0,
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="11.485"
//             height="11.485"
//             viewBox="0 0 13 13"
//             fill="none"
//           >
//             <path
//               d="M9.54571 1.06068C10.1315 0.474891 11.0812 0.474891 11.667 1.06068C12.2528 1.64646 12.2528 2.59621 11.667 3.182L3.18175 11.6673C2.59597 12.2531 1.64622 12.2531 1.06043 11.6673C0.474647 11.0815 0.474647 10.1317 1.06043 9.54596L9.54571 1.06068Z"
//               fill="#D9D9D9"
//             />
//             <path
//               d="M1.06059 3.18202C0.474804 2.59623 0.474803 1.64648 1.06059 1.0607C1.64638 0.474909 2.59612 0.474909 3.18191 1.0607L11.6672 9.54598C12.253 10.1318 12.253 11.0815 11.6672 11.6673C11.0814 12.2531 10.1317 12.2531 9.54587 11.6673L1.06059 3.18202Z"
//               fill="#D9D9D9"
//             />
//           </svg>
//         </IconButton>
//       </DialogTitle>

//       <DialogContent
//         sx={{
//           mt: 3,
//           // px: 4,
//           display: "flex",
//           justifyContent: "space-between", // 👈 keeps Clarify left & Align right
//         }}
//       >
//         {/* Clarify Section */}
//         <Box sx={{ flex: 1 }}>
//           <Typography
//             sx={{
//               fontFamily: "Poppins, sans-serif",
//               fontWeight: 500,
//               fontSize: "16px",
//               color: "#7A7A83",
//               mb: 1,
//             }}
//           >
//             Clarify
//           </Typography>
//           <FormGroup>
//             {clarifyOptions.map((option) => (
//               <FormControlLabel
//                 key={option}
//                 control={
//                   <Checkbox
//                     checked
//                     disabled // ✅ permanently checked
//                     icon={
//                       <Box
//                         sx={{
//                           width: 20,
//                           height: 20,
//                           border: "1.5px solid #3EA2FF",
//                           borderRadius: "4px",
//                           flexShrink: 0,
//                         }}
//                       />
//                     }
//                     checkedIcon={
//                       <Box
//                         sx={{
//                           width: 20,
//                           height: 20,
//                           backgroundColor: "#3EA2FF",
//                           borderRadius: "4px",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           flexShrink: 0,
//                         }}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="20"
//                           height="21"
//                           viewBox="0 0 20 21"
//                           fill="none"
//                         >
//                           <path
//                             d="M17.2203 4.47088C17.5643 4.77664 17.5953 5.30337 17.2895 5.64735L8.40063 15.6474C8.24249 15.8253 8.01582 15.9271 7.77779 15.9271C7.53975 15.9271 7.31309 15.8253 7.15495 15.6474L2.7105 10.6474C2.40474 10.3034 2.43572 9.77664 2.77971 9.47088C3.12369 9.16511 3.65042 9.1961 3.95618 9.54008L7.77779 13.8394L16.0438 4.54008C16.3496 4.1961 16.8763 4.16511 17.2203 4.47088Z"
//                             fill="white"
//                           />
//                         </svg>
//                       </Box>
//                     }
//                   />
//                 }
//                 label={option}
//               />
//             ))}
//           </FormGroup>
//         </Box>

//         {/* Align Section */}
//         <Box sx={{ flex: 1 }}>
//           {" "}
//           {/* 👈 gives nice space from left column */}
//           <Typography
//             sx={{
//               fontFamily: "Poppins, sans-serif",
//               fontWeight: 500,
//               fontSize: "16px",
//               color: "#7A7A83",

//               mb: 1,
//             }}
//           >
//             Align
//           </Typography>
//           <FormGroup>
//             {alignOptions.map((option) => (
//               <FormControlLabel
//                 key={option}
//                 control={
//                   <Checkbox
//                     checked={selected.includes(option)}
//                     onChange={() => handleToggle(option, "align")}
//                     icon={
//                       <Box
//                         sx={{
//                           width: 20,
//                           height: 20,
//                           border: "1.5px solid #3EA2FF",
//                           borderRadius: "4px",
//                         }}
//                       />
//                     }
//                     checkedIcon={
//                       <Box
//                         sx={{
//                           width: 20,
//                           height: 20,
//                           backgroundColor: "#3EA2FF",
//                           borderRadius: "4px",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="20"
//                           height="21"
//                           viewBox="0 0 20 21"
//                           fill="none"
//                         >
//                           <path
//                             d="M17.2203 4.47088C17.5643 4.77664 17.5953 5.30337 17.2895 5.64735L8.40063 15.6474C8.24249 15.8253 8.01582 15.9271 7.77779 15.9271C7.53975 15.9271 7.31309 15.8253 7.15495 15.6474L2.7105 10.6474C2.40474 10.3034 2.43572 9.77664 2.77971 9.47088C3.12369 9.16511 3.65042 9.1961 3.95618 9.54008L7.77779 13.8394L16.0438 4.54008C16.3496 4.1961 16.8763 4.16511 17.2203 4.47088Z"
//                             fill="white"
//                           />
//                         </svg>
//                       </Box>
//                     }
//                   />
//                 }
//                 label={option}
//               />
//             ))}
//           </FormGroup>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Typography,
//   IconButton,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Box,
// } from "@mui/material";

// export default function DocumentGenerationModal({
//   open,
//   onClose,
//   selected,
//   setSelected,
// }: {
//   open: boolean;
//   onClose: () => void;
//   selected: string[];
//   setSelected: React.Dispatch<React.SetStateAction<string[]>>;
// }) {
//   const clarifyOptions = [
//     "GTM Document",
//     "ICP Document",
//     "Strategy Roadmap",
//     "Messaging Framework",
//     "Brand Identity",
//   ];

//   const alignOptions = [
//     "Quarterly marketing plan",
//     "Content calendar template",
//   ];

//   const handleToggle = (option: string, type: "clarify" | "align") => {
//     if (type === "clarify") return; // always checked
//     setSelected((prev) =>
//       prev.includes(option)
//         ? prev.filter((i) => i !== option)
//         : [...prev, option]
//     );
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           width: "591px",
//           height: "340px",
//           flexShrink: 0,
//           borderRadius: "16px",
//           backgroundColor: "#FFF",
//           boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
//           overflow: "hidden",
//           py: 3,
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{ textAlign: "center", pb: 0, fontSize: "36px", fontWeight: 500 }}
//       >
//         Document Generation
//         <IconButton
//           onClick={onClose}
//           sx={{
//             position: "absolute",
//             right: 16,
//             top: 16,
//             width: "20px",
//             height: "20px",
//             padding: 0,
//           }}
//         >
//           ×
//         </IconButton>
//       </DialogTitle>

//       <DialogContent
//         sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
//       >
//         {/* Clarify Section */}
//         <Box sx={{ flex: 1 }}>
//           <Typography
//             sx={{ fontWeight: 500, fontSize: "16px", color: "#7A7A83", mb: 1 }}
//           >
//             Clarify
//           </Typography>
//           <FormGroup>
//             {clarifyOptions.map((option) => (
//               <FormControlLabel
//                 key={option}
//                 control={<Checkbox checked disabled />}
//                 label={option}
//               />
//             ))}
//           </FormGroup>
//         </Box>

//         {/* Align Section */}
//         <Box sx={{ flex: 1 }}>
//           <Typography
//             sx={{ fontWeight: 500, fontSize: "16px", color: "#7A7A83", mb: 1 }}
//           >
//             Align
//           </Typography>
//           <FormGroup>
//             {alignOptions.map((option) => (
//               <FormControlLabel
//                 key={option}
//                 control={
//                   <Checkbox
//                     checked={selected.includes(option)}
//                     onChange={() => handleToggle(option, "align")}
//                   />
//                 }
//                 label={option}
//               />
//             ))}
//           </FormGroup>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";

export default function DocumentGenerationModal({
  open,
  onClose,
  selected,
  setSelected,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const clarifyOptions = [
    "GTM Document",
    "ICP Document",
    "Strategy Roadmap",
    "Messaging Framework",
    "Brand Identity",
  ];
  const alignOptions = [
    "Quarterly marketing plan",
    "Content calendar template",
  ];

  const handleToggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((i) => i !== option)
        : [...prev, option]
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "591px",
          height: "340px",
          borderRadius: "16px",
          backgroundColor: "#FFF",
          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
          py: 3,
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "center", pb: 0, fontSize: "36px", fontWeight: 500 }}
      >
        Document Generation
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            width: "20px",
            height: "20px",
            padding: 0,
          }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{ fontWeight: 500, fontSize: "16px", color: "#7A7A83", mb: 1 }}
          >
            Clarify
          </Typography>
          <FormGroup>
            {clarifyOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={<Checkbox checked disabled />}
                label={option}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{ fontWeight: 500, fontSize: "16px", color: "#7A7A83", mb: 1 }}
          >
            Align
          </Typography>
          <FormGroup>
            {alignOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={selected.includes(option)}
                    onChange={() => handleToggle(option)}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

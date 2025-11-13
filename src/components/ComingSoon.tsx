// 'use client';

// import React from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Container,
//   Chip,
//   Stack,
//   alpha,
//   useTheme,
//   keyframes,
// } from '@mui/material';
// import {
//   Construction,
//   RocketLaunch,
//   AutoAwesome,
// } from '@mui/icons-material';

// // Define the animation keyframes
// const pulse = keyframes`
//   0% {
//     transform: scale(1);
//     opacity: 1;
//   }
//   50% {
//     transform: scale(1.05);
//     opacity: 0.8;
//   }
//   100% {
//     transform: scale(1);
//     opacity: 1;
//   }
// `;

// const float = keyframes`
//   0% {
//     transform: translateY(0px);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
//   100% {
//     transform: translateY(0px);
//   }
// `;

// const gradientAnimation = keyframes`
//   0% {
//     background-position: 0% 50%;
//   }
//   50% {
//     background-position: 100% 50%;
//   }
//   100% {
//     background-position: 0% 50%;
//   }
// `;

// interface ComingSoonProps {
//   headingName: string;
//   description?: string;
//   variant?: 'default' | 'minimal' | 'detailed';
//   showIcon?: boolean;
//   centered?: boolean; // New prop to control centering
// }

// const ComingSoon: React.FC<ComingSoonProps> = ({
//   headingName,
//   description = 'We\'re working hard to bring you this amazing feature. Stay tuned!',
//   variant = 'default',
//   showIcon = true,
//   centered = true, // Default to centered for better presentation
// }) => {
//   const theme = useTheme();

//   // Your brand colors
//   const primaryBlue = '#3EA2FF';
//   const primaryPink = '#FF3C80';
//   const lightBlue = '#5FB0FE';
//   const darkBg = '#202224';

//   // Minimal variant - for sidebar
//   if (variant === 'minimal') {
//     return (
//       <Box
//         sx={{
//           p: 2,
//           borderRadius: 2,
//           background: `linear-gradient(135deg, ${alpha(primaryBlue, 0.1)} 0%, ${alpha(primaryPink, 0.1)} 100%)`,
//           border: `1px solid ${alpha(primaryBlue, 0.2)}`,
//           position: 'relative',
//           overflow: 'hidden',
//           '&:hover': {
//             background: `linear-gradient(135deg, ${alpha(primaryBlue, 0.15)} 0%, ${alpha(primaryPink, 0.15)} 100%)`,
//             transform: 'translateX(4px)',
//             transition: 'all 0.3s ease',
//           },
//         }}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Construction 
//             sx={{ 
//               fontSize: 16, 
//               color: primaryBlue,
//               animation: `${float} 3s ease-in-out infinite`,
//             }} 
//           />
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: 500,
//               color: theme.palette.text.primary,
//             }}
//           >
//             {headingName}
//           </Typography>
//           <Chip
//             label="Coming Soon"
//             size="small"
//             sx={{
//               ml: 'auto',
//               height: 20,
//               fontSize: '0.7rem',
//               background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//               color: '#fff',
//               fontWeight: 600,
//               animation: `${pulse} 2s ease-in-out infinite`,
//             }}
//           />
//         </Stack>
//       </Box>
//     );
//   }

//   // Detailed variant
//   if (variant === 'detailed') {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Card
//           sx={{
//             background: theme.palette.mode === 'dark' 
//               ? `linear-gradient(135deg, ${alpha(darkBg, 0.9)} 0%, ${alpha(darkBg, 0.95)} 100%)`
//               : '#FFFFFF',
//             border: `1px solid ${alpha(primaryBlue, 0.2)}`,
//             borderRadius: 3,
//             position: 'relative',
//             overflow: 'hidden',
//             boxShadow: theme.palette.mode === 'dark'
//               ? `0 8px 32px ${alpha(primaryBlue, 0.2)}`
//               : `0 8px 32px ${alpha('#000000', 0.08)}`,
//             '&::before': {
//               content: '""',
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               height: '4px',
//               background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink}, ${lightBlue})`,
//               backgroundSize: '200% 200%',
//               animation: `${gradientAnimation} 3s ease infinite`,
//             },
//           }}
//         >
//           <CardContent sx={{ p: 4 }}>
//             <Stack spacing={3} alignItems="center" textAlign="center">
//               {/* Animated Icon Container */}
//               <Box
//                 sx={{
//                   width: 120,
//                   height: 120,
//                   borderRadius: '50%',
//                   background: `linear-gradient(135deg, ${alpha(primaryBlue, 0.1)} 0%, ${alpha(primaryPink, 0.1)} 100%)`,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   position: 'relative',
//                   animation: `${float} 4s ease-in-out infinite`,
//                 }}
//               >
//                 <Box
//                   sx={{
//                     position: 'absolute',
//                     width: '100%',
//                     height: '100%',
//                     borderRadius: '50%',
//                     background: `linear-gradient(135deg, ${primaryBlue}, ${primaryPink})`,
//                     opacity: 0.2,
//                     animation: `${pulse} 2s ease-in-out infinite`,
//                   }}
//                 />
//                 <RocketLaunch
//                   sx={{
//                     fontSize: 48,
//                     color: primaryBlue,
//                     zIndex: 1,
//                   }}
//                 />
//               </Box>

//               {/* Status Badge */}
//               <Stack direction="row" spacing={1}>
//                 <Chip
//                   icon={<AutoAwesome sx={{ fontSize: 16 }} />}
//                   label="Under Development"
//                   sx={{
//                     background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//                     color: '#fff',
//                     fontWeight: 600,
//                   }}
//                 />
//               </Stack>

//               {/* Heading */}
//               <Typography
//                 variant="h4"
//                 sx={{
//                   fontWeight: 700,
//                   background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   backgroundClip: 'text',
//                 }}
//               >
//                 {headingName}
//               </Typography>

//               {/* Description */}
//               <Typography
//                 variant="body1"
//                 sx={{
//                   color: theme.palette.text.secondary,
//                   maxWidth: 500,
//                 }}
//               >
//                 {description}
//               </Typography>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Container>
//     );
//   }

//   // Default variant - now with better card styling and centering
//   const cardContent = (
//     <Card
//       sx={{
//         maxWidth: 600,
//         width: '100%',
//         borderRadius: 3,
//         background: theme.palette.mode === 'dark'
//           ? alpha(darkBg, 0.8)
//           : '#FFFFFF',
//         border: `1px solid ${alpha(primaryBlue, 0.2)}`,
//         position: 'relative',
//         overflow: 'hidden',
//         transition: 'all 0.3s ease',
//         boxShadow: theme.palette.mode === 'dark'
//           ? `0 10px 40px ${alpha(primaryBlue, 0.2)}`
//           : `0 10px 40px ${alpha('#000000', 0.1)}`,
//         '&:hover': {
//           transform: 'translateY(-4px)',
//           boxShadow: theme.palette.mode === 'dark'
//             ? `0 20px 50px ${alpha(primaryBlue, 0.3)}`
//             : `0 20px 50px ${alpha('#000000', 0.15)}`,
//         },
//         '&::before': {
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           height: '3px',
//           background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//           backgroundSize: '200% 200%',
//           animation: `${gradientAnimation} 3s ease infinite`,
//         },
//       }}
//     >
//       <CardContent sx={{ p: 4 }}>
//         <Stack spacing={3} alignItems="center" textAlign="center">
//           {showIcon && (
//             <Box
//               sx={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: '50%',
//                 background: `linear-gradient(135deg, ${alpha(primaryBlue, 0.1)} 0%, ${alpha(primaryPink, 0.1)} 100%)`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 position: 'relative',
//                 animation: `${float} 3s ease-in-out infinite`,
//               }}
//             >
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   width: '100%',
//                   height: '100%',
//                   borderRadius: '50%',
//                   background: `linear-gradient(135deg, ${primaryBlue}, ${primaryPink})`,
//                   opacity: 0.15,
//                   animation: `${pulse} 2s ease-in-out infinite`,
//                 }}
//               />
//               <Construction 
//                 sx={{ 
//                   fontSize: 36, 
//                   color: primaryBlue,
//                   zIndex: 1,
//                 }} 
//               />
//             </Box>
//           )}
          
//           <Chip
//             label="Coming Soon"
//             sx={{
//               background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//               color: '#fff',
//               fontWeight: 600,
//               fontSize: '0.875rem',
//               padding: '4px 8px',
//               animation: `${pulse} 2s ease-in-out infinite`,
//             }}
//           />

//           <Box>
//             <Typography
//               variant="h4"
//               sx={{
//                 fontWeight: 700,
//                 mb: 2,
//                 background: `linear-gradient(90deg, ${primaryBlue}, ${primaryPink})`,
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               {headingName}
//             </Typography>
//             <Typography
//               variant="body1"
//               sx={{
//                 color: theme.palette.text.secondary,
//                 lineHeight: 1.6,
//               }}
//             >
//               {description}
//             </Typography>
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );

//   // If centered is true, wrap the card in a centering container
//   if (centered) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           minHeight: '60vh',
//           width: '100%',
//           p: 2,
//         }}
//       >
//         {cardContent}
//       </Box>
//     );
//   }

//   // Otherwise, just return the card
//   return cardContent;
// };

// export default ComingSoon;

"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import BackgroundImage from '@/assests/images/Background.png';

const ComingSoon: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `url(${BackgroundImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          sx={{
            marginLeft: '200px',
            fontSize: '4rem',
            fontWeight: 900,
            letterSpacing: '0.5rem',
            textAlign: 'center',
            background: 'linear-gradient(90deg, #FF3C80 0%, #3EA3FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          COMING SOON
        </Typography>
      </Box>

      {/* Global style to remove scrollbar */}
      <style jsx global>{`
        html,
        body,
        #__next {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </>
  );
};

export default ComingSoon;
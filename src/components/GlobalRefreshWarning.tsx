"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

/**
 * Global component that monitors ICP, KMF, BS, and SR generation states and warns users
 * before refreshing the page, even when they're on a different page.
 * 
 * This component monitors ICP, KMF, BS, and SR generation states simultaneously.
 * If any document is being generated, it will prevent accidental page refresh.
 * 
 * Add this component to your root layout or app component.
 */
const GlobalRefreshWarning: React.FC = () => {
  const icpIsGenerating = useSelector((state: RootState) => state.icp.isGenerating);
  const kmfIsGenerating = useSelector((state: RootState) => state.kmf.isGenerating);
  const bsIsGenerating = useSelector((state: RootState) => state.bs.isGenerating);
  const srIsGenerating = useSelector((state: RootState) => state.sr.isGenerating);

  // Combine all states - warn if ANY is generating
  const isGenerating = icpIsGenerating || kmfIsGenerating || bsIsGenerating || srIsGenerating;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        e.preventDefault();
        e.returnValue = 'Document generation is in progress. All your progress will be lost. Are you sure you want to reload?';
        return 'Document generation is in progress. All your progress will be lost. Are you sure you want to reload?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGenerating]);

  // Optional: Log which documents are generating (helpful for debugging)
  useEffect(() => {
    if (icpIsGenerating || kmfIsGenerating || bsIsGenerating || srIsGenerating) {
      const generating = [];
      if (icpIsGenerating) generating.push('ICP');
      if (kmfIsGenerating) generating.push('KMF');
      if (bsIsGenerating) generating.push('BS');
      if (srIsGenerating) generating.push('SR');
      console.log(`🔒 [Refresh Warning] Active generation: ${generating.join(', ')}`);
    }
  }, [icpIsGenerating, kmfIsGenerating, bsIsGenerating, srIsGenerating]);

  return null; // This component doesn't render anything
};

export default GlobalRefreshWarning;
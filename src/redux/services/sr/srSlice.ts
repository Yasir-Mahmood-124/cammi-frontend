// redux/services/sr/srSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface SRState {
  view: "initial" | "upload" | "questions" | "preview";
  questions: Question[];
  currentQuestionIndex: number;
  answeredIds: number[];
  projectId: string;
  
  // Document generation states
  isGenerating: boolean;
  wsUrl: string;
  generatingProgress: number;
  generatingContent: string;
  displayedContent: string;
  generationComplete: boolean;
  hasReceivedCompletionMessage: boolean;
  
  // Document preview states
  showDocumentPreview: boolean;
  docxBase64: string;
  fileName: string;
  
  // Flags for fetching
  shouldFetchUnanswered: boolean;
  shouldFetchAll: boolean;
}

const initialState: SRState = {
  view: "initial",
  questions: [],
  currentQuestionIndex: 0,
  answeredIds: [],
  projectId: "",
  isGenerating: false,
  wsUrl: "",
  generatingProgress: 0,
  generatingContent: "Waiting for Document Generation...",
  displayedContent: "Waiting for Document Generation...",
  generationComplete: false,
  hasReceivedCompletionMessage: false,
  showDocumentPreview: false,
  docxBase64: "",
  fileName: "",
  shouldFetchUnanswered: false,
  shouldFetchAll: false,
};

const srSlice = createSlice({
  name: "sr",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<SRState["view"]>) => {
      state.view = action.payload;
    },
    
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    
    updateQuestionAnswer: (state, action: PayloadAction<{ id: number; answer: string }>) => {
      const question = state.questions.find(q => q.id === action.payload.id);
      if (question) {
        question.answer = action.payload.answer;
      }
    },
    
    updateCurrentQuestionAnswer: (state, action: PayloadAction<string>) => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (currentQuestion) {
        currentQuestion.answer = action.payload;
      }
    },
    
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    
    goToQuestion: (state, action: PayloadAction<number>) => {
      const index = state.questions.findIndex(q => q.id === action.payload);
      if (index !== -1) {
        state.currentQuestionIndex = index;
      }
    },
    
    addAnsweredId: (state, action: PayloadAction<number>) => {
      if (!state.answeredIds.includes(action.payload)) {
        state.answeredIds.push(action.payload);
      }
    },
    
    setAnsweredIds: (state, action: PayloadAction<number[]>) => {
      state.answeredIds = action.payload;
    },
    
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    
    // Document generation
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
      if (!action.payload) {
        // Reset generation state when not generating
        state.generatingProgress = 0;
        state.generatingContent = "Waiting for Document Generation...";
        state.displayedContent = "Waiting for Document Generation...";
        state.generationComplete = false;
        state.hasReceivedCompletionMessage = false;
      }
    },
    
    setWsUrl: (state, action: PayloadAction<string>) => {
      state.wsUrl = action.payload;
    },
    
    setGeneratingProgress: (state, action: PayloadAction<number>) => {
      state.generatingProgress = action.payload;
    },
    
    setGeneratingContent: (state, action: PayloadAction<string>) => {
      state.generatingContent = action.payload;
    },
    
    appendGeneratingContent: (state, action: PayloadAction<string>) => {
      if (state.generatingContent === "Waiting for Document Generation...") {
        state.generatingContent = action.payload;
      } else {
        state.generatingContent += "\n\n" + action.payload;
      }
    },
    
    setDisplayedContent: (state, action: PayloadAction<string>) => {
      state.displayedContent = action.payload;
    },
    
    setCompletionMessageReceived: (state, action: PayloadAction<boolean>) => {
      state.hasReceivedCompletionMessage = action.payload;
      if (action.payload) {
        state.generationComplete = true;
        state.generatingProgress = 100;
        state.displayedContent = state.generatingContent;
      }
    },
    
    setGenerationComplete: (state, action: PayloadAction<boolean>) => {
      state.generationComplete = action.payload;
      if (action.payload) {
        state.generatingProgress = 100;
        state.displayedContent = state.generatingContent;
      }
    },
    
    clearGenerationState: (state) => {
      state.isGenerating = false;
      state.generatingProgress = 0;
      state.generatingContent = "Waiting for Document Generation...";
      state.displayedContent = "Waiting for Document Generation...";
      state.generationComplete = false;
      state.hasReceivedCompletionMessage = false;
      state.wsUrl = "";
    },
    
    // Document preview
    setShowDocumentPreview: (state, action: PayloadAction<boolean>) => {
      state.showDocumentPreview = action.payload;
    },
    
    setDocumentData: (state, action: PayloadAction<{ docxBase64: string; fileName: string }>) => {
      state.docxBase64 = action.payload.docxBase64;
      state.fileName = action.payload.fileName;
      state.showDocumentPreview = true;
      state.isGenerating = false;
      state.generationComplete = false;
      state.generatingProgress = 0;
      state.generatingContent = "Waiting for Document Generation...";
      state.displayedContent = "Waiting for Document Generation...";
      state.hasReceivedCompletionMessage = false;
    },
    
    setShouldFetchUnanswered: (state, action: PayloadAction<boolean>) => {
      state.shouldFetchUnanswered = action.payload;
    },
    
    setShouldFetchAll: (state, action: PayloadAction<boolean>) => {
      state.shouldFetchAll = action.payload;
    },
    
    resetSRState: (state) => {
      return initialState;
    },
    
    resetForNewDocument: (state) => {
      state.view = "initial";
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.answeredIds = [];
      state.isGenerating = false;
      state.generatingProgress = 0;
      state.generatingContent = "Waiting for Document Generation...";
      state.displayedContent = "Waiting for Document Generation...";
      state.generationComplete = false;
      state.hasReceivedCompletionMessage = false;
      state.showDocumentPreview = false;
      state.docxBase64 = "";
      state.fileName = "";
      state.shouldFetchUnanswered = false;
      state.shouldFetchAll = false;
    },
  },
});

export const {
  setView,
  setQuestions,
  updateQuestionAnswer,
  updateCurrentQuestionAnswer,
  setCurrentQuestionIndex,
  nextQuestion,
  goToQuestion,
  addAnsweredId,
  setAnsweredIds,
  setProjectId,
  setIsGenerating,
  setWsUrl,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setDisplayedContent,
  setCompletionMessageReceived,
  setGenerationComplete,
  clearGenerationState,
  setShowDocumentPreview,
  setDocumentData,
  setShouldFetchUnanswered,
  setShouldFetchAll,
  resetSRState,
  resetForNewDocument,
} = srSlice.actions;

export default srSlice.reducer;
// src/redux/services/linkedin/linkedinSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InputItem {
  id: number;
  question: string;
  answer: string;
}

export interface LinkedinState {
  sub: string | null;
  hasOrgId: boolean;
  items: InputItem[];
  currentQuestionId: number;
  answeredIds: number[];
  allAnswered: boolean;
  isQuestionsLoaded: boolean;
}

const initialState: LinkedinState = {
  sub: null,
  hasOrgId: false,
  items: [],
  currentQuestionId: 1,
  answeredIds: [],
  allAnswered: false,
  isQuestionsLoaded: false,
};

const linkedinSlice = createSlice({
  name: 'linkedin',
  initialState,
  reducers: {
    setSub: (state, action: PayloadAction<string | null>) => {
      state.sub = action.payload;
    },

    setHasOrgId: (state, action: PayloadAction<boolean>) => {
      state.hasOrgId = action.payload;
    },

    setItems: (state, action: PayloadAction<InputItem[]>) => {
      state.items = action.payload;
      state.isQuestionsLoaded = true;
      // Only reset question index if starting fresh
      if (state.currentQuestionId === 1 && state.answeredIds.length === 0) {
        state.currentQuestionId = 1;
      }
    },

    updateItemAnswer: (state, action: PayloadAction<{ id: number; answer: string }>) => {
      const { id, answer } = action.payload;
      const item = state.items.find((q) => q.id === id);
      if (item) {
        item.answer = answer;
      }
    },

    setCurrentQuestionId: (state, action: PayloadAction<number>) => {
      state.currentQuestionId = action.payload;
    },

    addAnsweredId: (state, action: PayloadAction<number>) => {
      if (!state.answeredIds.includes(action.payload)) {
        state.answeredIds.push(action.payload);
      }
    },

    nextQuestion: (state) => {
      if (state.currentQuestionId < state.items.length) {
        state.currentQuestionId += 1;
      } else {
        state.allAnswered = true;
      }
    },

    setAllAnswered: (state, action: PayloadAction<boolean>) => {
      state.allAnswered = action.payload;
    },

    resetQuestions: (state) => {
      state.items = [];
      state.currentQuestionId = 1;
      state.answeredIds = [];
      state.allAnswered = false;
      state.isQuestionsLoaded = false;
    },

    clearSub: (state) => {
      state.sub = null;
      state.items = [];
      state.currentQuestionId = 1;
      state.answeredIds = [];
      state.allAnswered = false;
      state.isQuestionsLoaded = false;
      state.hasOrgId = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('linkedin_sub');
      }
    },

    // ✅ FIXED: Reset each property individually (works better with Redux Persist)
    resetLinkedinState: (state) => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('linkedin_sub');
      }
      
      // Reset each property individually (important for Redux Persist)
      state.sub = null;
      state.hasOrgId = false;
      state.items = [];
      state.currentQuestionId = 1;
      state.answeredIds = [];
      state.allAnswered = false;
      state.isQuestionsLoaded = false;
    },
  },
});

export const {
  setSub,
  setHasOrgId,
  setItems,
  updateItemAnswer,
  setCurrentQuestionId,
  addAnsweredId,
  nextQuestion,
  setAllAnswered,
  resetQuestions,
  clearSub,
  resetLinkedinState,
} = linkedinSlice.actions;

export default linkedinSlice.reducer;
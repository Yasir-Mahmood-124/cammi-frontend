// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./services/auth/authSlice";
import { authApi } from "./services/auth/authApi";
import { onboardingApi } from "./services/onboarding/onboardingApi";
import { googleApi } from "./services/auth/googleApi";
import { projectsApi } from "./services/projects/projectApi";
import { reviewApi } from "./services/documentReview/reviewApi";
import { refineApi } from "./services/common/refineApi";
import { uploadApiSlice } from "./services/common/uploadApiSlice";
import {downloadDocument} from "./services/document/downloadApi";
import {downloadPdfApi} from "./services/document/download-pdf";
import { sendReviewApi } from "./services/common/send_review";
import {getUnansweredQuestionsApi} from "./services/common/getUnansweredQuestionsApi";
import { addQuestionApi } from "./services/common/addQuestion";
import { getQuestionsApi } from "./services/common/getQuestionsApi";
import {aiGenerateApi} from "./services/linkedin/aiGenerateApi";
import { editDeleteApi } from "./services/linkedin/editDeleteApi";
import { fetchSchedulePostApi } from "./services/linkedin/fetchSchedulePostApi";
import { linkedinLoginApi } from "./services/linkedin/linkedinLoginApi";
import { linkedinPostApi } from "./services/linkedin/linkedinPostApi";
import {schedulePostApi} from "./services/linkedin/schedulePostApi";
import { viewApiSlice } from "./services/linkedin/viewApiSlice";
import { imageGenerationApi } from "./services/linkedin/imageGeneration";
import { getPostQuestionsApi } from "./services/linkedin/getPostQuestion";
import { insertPostQuestionApi } from "./services/linkedin/insertPostQuestion";
import { userFeedbackApi } from "./services/feedback/userFeedbackApi";

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer, // slice reducer
    [authApi.reducerPath]: authApi.reducer, // RTK Query API reducer
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [googleApi.reducerPath]: googleApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [refineApi.reducerPath]: refineApi.reducer,
    [uploadApiSlice.reducerPath]: uploadApiSlice.reducer,
    [downloadDocument.reducerPath]: downloadDocument.reducer,
    [downloadPdfApi.reducerPath]: downloadPdfApi.reducer,
    [sendReviewApi.reducerPath]: sendReviewApi.reducer,
    [getUnansweredQuestionsApi.reducerPath]: getUnansweredQuestionsApi.reducer,
    [addQuestionApi.reducerPath]: addQuestionApi.reducer,
    [getQuestionsApi.reducerPath]: getQuestionsApi.reducer,
    [aiGenerateApi.reducerPath]: aiGenerateApi.reducer,
    [editDeleteApi.reducerPath]: editDeleteApi.reducer,
    [fetchSchedulePostApi.reducerPath]: fetchSchedulePostApi.reducer,
    [linkedinLoginApi.reducerPath]: linkedinLoginApi.reducer,
    [linkedinPostApi.reducerPath]: linkedinPostApi.reducer,
    [schedulePostApi.reducerPath]: schedulePostApi.reducer,
    [viewApiSlice.reducerPath]: viewApiSlice.reducer,
    [imageGenerationApi.reducerPath]: imageGenerationApi.reducer,
    [getPostQuestionsApi.reducerPath]: getPostQuestionsApi.reducer,
    [insertPostQuestionApi.reducerPath]: insertPostQuestionApi.reducer,
    [userFeedbackApi.reducerPath]: userFeedbackApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(onboardingApi.middleware)
      .concat(googleApi.middleware)
      .concat(projectsApi.middleware)
      .concat(reviewApi.middleware)
      .concat(refineApi.middleware)
      .concat(uploadApiSlice.middleware)
      .concat(downloadDocument.middleware)
      .concat(downloadPdfApi.middleware)
      .concat(sendReviewApi.middleware)
      .concat(getUnansweredQuestionsApi.middleware)
      .concat(addQuestionApi.middleware)
      .concat(getQuestionsApi.middleware)
      .concat(aiGenerateApi.middleware)
      .concat(editDeleteApi.middleware)
      .concat(fetchSchedulePostApi.middleware)
      .concat(linkedinLoginApi.middleware)
      .concat(linkedinPostApi.middleware)
      .concat(schedulePostApi.middleware)
      .concat(viewApiSlice.middleware)
      .concat(imageGenerationApi.middleware)
      .concat(getPostQuestionsApi.middleware)
      .concat(insertPostQuestionApi.middleware)
      .concat(userFeedbackApi.middleware)
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

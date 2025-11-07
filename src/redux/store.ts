// redux/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from "./services/auth/authSlice";
import { authApi } from "./services/auth/authApi";
import { onboardingApi } from "./services/onboarding/onboardingApi";
import { googleApi } from "./services/auth/googleApi";
import { projectsApi } from "./services/projects/projectApi";
import { reviewApi } from "./services/documentReview/reviewApi";
import { refineApi } from "./services/common/refineApi";
import { uploadApiSlice } from "./services/common/uploadApiSlice";
import { downloadDocument } from "./services/document/downloadApi";
import { downloadPdfApi } from "./services/document/download-pdf";
import { sendReviewApi } from "./services/common/send_review";
import { getUnansweredQuestionsApi } from "./services/common/getUnansweredQuestionsApi";
import { addQuestionApi } from "./services/common/addQuestion";
import { getQuestionsApi } from "./services/common/getQuestionsApi";
import { aiGenerateApi } from "./services/linkedin/aiGenerateApi";
import { editDeleteApi } from "./services/linkedin/editDeleteApi";
import { fetchSchedulePostApi } from "./services/linkedin/fetchSchedulePostApi";
import { linkedinLoginApi } from "./services/linkedin/linkedinLoginApi";
import { linkedinPostApi } from "./services/linkedin/linkedinPostApi";
import { schedulePostApi } from "./services/linkedin/schedulePostApi";
import { viewApiSlice } from "./services/linkedin/viewApiSlice";
import { imageGenerationApi } from "./services/linkedin/imageGeneration";
import { getPostQuestionsApi } from "./services/linkedin/getPostQuestion";
import { insertPostQuestionApi } from "./services/linkedin/insertPostQuestion";
import { userFeedbackApi } from "./services/feedback/userFeedbackApi";
import { checkFeedbackApi } from './services/feedback/checkFeedbackApi';
import { webscrapApi } from './services/webscrap/webscrapApi';
import { editHeadingWebsocketApi } from "./services/common/editHeadingWebsocketApi";
import { documentsApi } from "./services/document/documentsApi";
import { creditsApi } from "./services/credits/credits";
import { documentParsingApi } from "./services/webscrap/documentParcing";
import { profileSettingsApi } from "./services/settings/profileSettings";
import icpReducer from "./services/icp/icpSlice";
import kmfReducer from "./services/kmf/kmfSlice";
import bsReducer from "./services/bs/bsSlice";
import srReducer from "./services/sr/srSlice";
import gtmReducer from "./services/gtm/gtmSlice";
import { icpWebSocketMiddleware } from "./middleware/icpWebSocketMiddleware";
import { kmfWebSocketMiddleware } from "./middleware/kmfWebSocketMiddleware";
import { bsWebSocketMiddleware } from "./middleware/bsWebSocketMiddleware";
import { srWebSocketMiddleware } from "./middleware/srWebSocketMiddleware";
import { gtmWebSocketMiddleware } from "./middleware/gtmWebSocketMiddleware";

// ==================== REDUX PERSIST CONFIGURATION ====================

const icpPersistConfig = {
  key: 'icp',
  storage,
  whitelist: [
    'projectId',
    'isGenerating',
    'generatingProgress',
    'generatingContent',
    'displayedContent',
    'hasReceivedCompletionMessage',
    'generationComplete',
    'docxBase64',
    'fileName',
    'showDocumentPreview',
    'questions',
    'answeredIds',
    'currentQuestionIndex',
    'view',
  ],
};

const kmfPersistConfig = {
  key: 'kmf',
  storage,
  whitelist: [
    'projectId',
    'isGenerating',
    'generatingProgress',
    'generatingContent',
    'displayedContent',
    'hasReceivedCompletionMessage',
    'generationComplete',
    'docxBase64',
    'fileName',
    'showDocumentPreview',
    'questions',
    'answeredIds',
    'currentQuestionIndex',
    'view',
  ],
};

const bsPersistConfig = {
  key: 'bs',
  storage,
  whitelist: [
    'projectId',
    'isGenerating',
    'generatingProgress',
    'generatingContent',
    'displayedContent',
    'hasReceivedCompletionMessage',
    'generationComplete',
    'docxBase64',
    'fileName',
    'showDocumentPreview',
    'questions',
    'answeredIds',
    'currentQuestionIndex',
    'view',
  ],
};

const srPersistConfig = {
  key: 'sr',
  storage,
  whitelist: [
    'projectId',
    'isGenerating',
    'generatingProgress',
    'generatingContent',
    'displayedContent',
    'hasReceivedCompletionMessage',
    'generationComplete',
    'docxBase64',
    'fileName',
    'showDocumentPreview',
    'questions',
    'answeredIds',
    'currentQuestionIndex',
    'view',
  ],
};

const gtmPersistConfig = {
  key: 'gtm',
  storage,
  whitelist: [
    'projectId',
    'sessionId',
    'isGenerating',
    'generatingProgress',
    'generatingContent',
    'displayedContent',
    'hasReceivedCompletionMessage',
    'generationComplete',
    'docxBase64',
    'fileName',
    'showDocumentPreview',
    'questions',
    'answeredIds',
    'currentQuestionIndex',
    'view',
  ],
};

const persistedIcpReducer = persistReducer(icpPersistConfig, icpReducer);
const persistedKmfReducer = persistReducer(kmfPersistConfig, kmfReducer);
const persistedBsReducer = persistReducer(bsPersistConfig, bsReducer);
const persistedSrReducer = persistReducer(srPersistConfig, srReducer);
const persistedGtmReducer = persistReducer(gtmPersistConfig, gtmReducer);

// ==================== ROOT REDUCER ====================

const rootReducer = combineReducers({
  auth: authReducer,
  icp: persistedIcpReducer,
  kmf: persistedKmfReducer,
  bs: persistedBsReducer,
  sr: persistedSrReducer,
  gtm: persistedGtmReducer,

  [authApi.reducerPath]: authApi.reducer,
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
  [checkFeedbackApi.reducerPath]: checkFeedbackApi.reducer,
  [webscrapApi.reducerPath]: webscrapApi.reducer,
  [editHeadingWebsocketApi.reducerPath]: editHeadingWebsocketApi.reducer,
  [documentsApi.reducerPath]: documentsApi.reducer,
  [creditsApi.reducerPath]: creditsApi.reducer,
  [documentParsingApi.reducerPath]: documentParsingApi.reducer,
  [profileSettingsApi.reducerPath]: profileSettingsApi.reducer,
});

// ==================== STORE CONFIGURATION ====================

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(icpWebSocketMiddleware)
      .concat(kmfWebSocketMiddleware)
      .concat(bsWebSocketMiddleware)
      .concat(srWebSocketMiddleware)
      .concat(gtmWebSocketMiddleware)
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
      .concat(checkFeedbackApi.middleware)
      .concat(webscrapApi.middleware)
      .concat(editHeadingWebsocketApi.middleware)
      .concat(documentsApi.middleware)
      .concat(creditsApi.middleware)
      .concat(documentParsingApi.middleware)
      .concat(profileSettingsApi.middleware),
});

export const persistor = persistStore(store);

if (typeof window !== 'undefined') {
  (window as any).__REDUX_STATE__ = store.getState();
  store.subscribe(() => {
    (window as any).__REDUX_STATE__ = store.getState();
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
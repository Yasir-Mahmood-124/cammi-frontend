// redux/actions/resetActions.ts
import { resetGTMState } from '../services/gtm/gtmSlice';
import { resetICPState } from '../services/icp/icpSlice';
import { resetKMFState } from '../services/kmf/kmfSlice';
import { resetSRState } from '../services/sr/srSlice';
import { resetBSState } from '../services/bs/bsSlice';
import { wsManager } from '../services/websocketManager';
import { resetLinkedinState } from '../services/linkedin/linkedinSlice';
import type { AppDispatch } from '../store'; // Adjust path as needed

export const resetAllStates = () => (dispatch: AppDispatch) => {
  console.log('🧹 Resetting all Redux states...');
  
  // Reset all slices
  dispatch(resetGTMState());
  dispatch(resetICPState());
  dispatch(resetKMFState());
  dispatch(resetSRState());
  dispatch(resetBSState());
  dispatch(resetLinkedinState());
  
  // Disconnect WebSocket
  console.log('🔌 Disconnecting WebSocket...');
  wsManager.disconnect();
};
import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import replyIdsByProductIdReducer from './slices/replyIdsByProductIdSlice';
import productByIdReducer from './slices/productByIdSlice';

export default configureStore({
  reducer: {
    replyIdsByProductId: replyIdsByProductIdReducer,
    productById: productByIdReducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false
  })
})

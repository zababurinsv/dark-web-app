import { CommentsState } from './slices/replyIdsByProductIdSlice';
import { ProductState } from './slices/productByIdSlice';
import { ProductWithAllDetails, ProductWithSomeDetails } from '@darkpay/dark-types';

export type Store = {
  replyIdsByProductId: CommentsState
  productById: ProductState
}

export type ProductsStoreType = ProductWithAllDetails | ProductWithSomeDetails | (ProductWithAllDetails | ProductWithSomeDetails)[]

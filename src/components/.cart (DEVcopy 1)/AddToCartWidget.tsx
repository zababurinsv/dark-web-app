import React, { useState } from 'react'
import { HasStorefrontIdOrHandle, productUrl } from '../urls'
import { IconWithLabel } from '../utils'
import { useAuth } from '../auth/AuthContext'
import { ProductWithSomeDetails, ProductWithAllDetails, StorefrontData, ProductData } from '@darkpay/dark-types'
import { None, ProductExtension } from '@darkpay/dark-types/substrate/classes'
import { ShoppingCartOutlined } from '@ant-design/icons'
// import { ShareModal } from './ShareModal'
import { Button, InputNumber, notification, Space } from 'antd';
import TickerDarkUsd from '../cart/TickerDarkUsd'
import AddToCartTotal from '../cart/AddToCartTotal'
//import { add, total } from './localstore' 
//import { Cart,} from './CartUtils
import store from 'store2'
import { ProductId, StorefrontId } from '@darkpay/dark-types/substrate/interfaces'
import { Option } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'


import Cart from 'cart-localstorage' 


type Props = {
  storefront: HasStorefrontIdOrHandle
  product: ProductData
  productdetails: ProductWithAllDetails
  title?: string
  hint?: string
  className?: string
}

export const AddToCartWidget = ({
  storefront,
  product,
  productdetails,
  title,
  hint,
  className
}: Props) => {

  
const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()

const ProductTitle = product.content?.title
const ProductId = productdetails.product.struct.id
const ProductImage = productdetails.product.content?.image
const ProductSf = productdetails.product.struct.storefront_id
const ProductSeller = productdetails.product.struct.owner


const ProductPrice = Number(productdetails.product.struct.price)/100
// console.log('DEBUG PRICE **** '+productdetails.product.struct.price)

const BuyerEscrow = productdetails.product.content?.bescrow
const SellerEscrow = productdetails.product.content?.sescrow
const ShipCost = productdetails.product.content?.shipcost
const ShipsTo = productdetails.product.content?.shipsto


const openNotification = (ProductTitle: string | undefined) => {
  notification.open({
    type: 'success',
    message: 'Item added to your cart',
    description:
    ProductTitle,
    onClick: () => {
      console.log('Add to cart Notification Clicked!');
    },
  });
};

const [ qty=1, setQty ] = useState<string | number | undefined>()

const onQtyChanged = (qty: string | number | undefined) => {
 // console.log('qty is ---> '+qty)
  setQty(qty)
}


   // function checkCart () {
    // if(Cart) {
    //   console.log('Cart structure exists.') 
    // }
    //   else {
    // //Setting store key and data
    // store('Darkdot_Cart', {'products': [], 'totals':[]}); 
    // console.log('Cart structure created.')
    // }
    const cartStore = store.namespace('Darkdot_Cart')




    const checkCart = new Promise<any>(async (resolve, reject) => {
      if(cartStore.get('products')) {
        console.log('Cart structure exists.') 
        resolve(cartStore.get('products'))
      }
        else if(!cartStore.get('products')){
      //Setting store key and data
      cartStore.add('products', [])
      cartStore.add('totals', {prod_total: 0, escrow_total: 0, shipping_total: 0})
      console.log('Cart structure created.')
      resolve(cartStore.get('products'))
      }
      else {
        reject('Zero or no data given by Offchain store')
      }
  
    });
  

  const data = {
            "id": ProductId,
            "img": ProductImage,
            "name": ProductTitle,
            "qty":  qty,
            "price": ProductPrice,
            "sfId": ProductSf,
            "seller": ProductSeller,
            "bescrow" : BuyerEscrow,
            "sescrow": SellerEscrow,
            "shipcost": ShipCost,
            "shipsto": ShipsTo,  
}


  const addToCart = (data: { id: ProductId; img: string | undefined; name: string | undefined; qty: string | number | undefined; price: number; sfId: Option<StorefrontId>; seller: AccountId; bescrow: string | undefined; sescrow: string | undefined; shipcost: string | undefined; shipsto: string | undefined }) => {
    console.log('***** ADD TO CART TRIGGERED ****')

    checkCart
    .then(result => {
  //   console.warn('Hi', result)
  //    result.each(function(key: string, value: any) {
  //     console.log(key, '->', value);
  // });


  // override result for format => TODO refactor


  cartStore.each(function(key, value) {
    console.log(key, '->', value);
    if (key === 'products') {
      // caching map
var objMap = new Map(Object.entries(value));

// fast iteration on Map object
objMap.forEach((item, key) => {
  // do something with an item
  console.log(key, item);
});
    }
});

      // if (result.find((p: any) => p.name === data.name)) {
      //   console.log('find match !')
      //   result.find((p: { qty: any }) => p.qty === p.qty+qty)
      //   result.splice(
      //     result.findIndex((p: any) => p.name === data.name),
      //     1,
      //     product
      //   )
      //   cartStore.set('products', data)
      // }
      // else {
   
      // }
      
    });
    cartStore.add('products', data)

    Cart.add({id: 1, name: "Product 1", price: 100},1)


    openNotification(data.name)
    //const prevCartContent = checkCart()
    //console.log('Previous cart content : '+prevCartContent)
    //addToCart(data)
    // if(!localstore.getItem('cart')) {
    //   console.log('$0 Cart is empty')
    //   localstore.setItem('cart', JSON.stringify([]))
    // }
    // var gotstore = localstore.getItem('cart')
    // var dataCart = JSON.parse((gotstore)!)
    // var product = data

    // if (dataCart.length === 0 || !dataCart.find((p: { name: any }) => p.name === product.name)) {
    //   dataCart.push(product)
    //   localstore.setItem('cart', JSON.stringify(dataCart))
    // } else if (dataCart.find((p: any) => p.name === product.name)) {
    //   dataCart.find((p: { qty: any }) => p.qty === p.qty+qty)
    //   dataCart.splice(
    //     dataCart.findIndex((p: any) => p.name === product.name),
    //     1,
    //     product
    //   )
    //   localstore.setItem('cart', JSON.stringify(dataCart))
    //   openNotification()
    // }
    // openNotification(ProductTitle)
  }



  // console.log('** Got price --> ' + ProductPrice)

  return <>

  <div className="addtocart-price">

Qty.
      <InputNumber
      name='qty'
      min={1} max={10} 
      defaultValue={1}
      step='1'
      prefix='Qty: '
      style={{
        width: 60,
        margin: 10
      }}
      onChange={onQtyChanged} 
    />
  </div>
  <div className="addtocart-btn">
    <a
      className='ant-btn ant-btn-primary addtocart'
      onClick={() => isSignedIn ? addToCart(data) : openSignInModal('AuthRequired')}
      title={title}
    >
      <IconWithLabel icon={<ShoppingCartOutlined />} label={title} />
      <AddToCartTotal product={product} productPrice={Number(product.struct.price)} qty={qty}  />
      {/* <TickerDarkUsd /> */}
    </a>
  </div>
  </>
}

export default AddToCartWidget



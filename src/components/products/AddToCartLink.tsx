import React, { useState } from 'react'
import { HasStorefrontIdOrHandle,  productUrl } from '../urls'
import { IconWithLabel } from '../utils'
import { isMyAddress } from '../auth/MyAccountContext'
import { useAuth } from '../auth/AuthContext'
import { ProductWithSomeDetails, ProductWithAllDetails, StorefrontData } from '@darkpay/dark-types'
import { None, ProductExtension } from '@darkpay/dark-types/substrate/classes'
import { ShoppingCartOutlined } from '@ant-design/icons'
// import { ShareModal } from './ShareModal'
import { isRegularProduct } from './view-product'
import { Button, InputNumber, notification, Space } from 'antd';




type Props = {
  storefront: HasStorefrontIdOrHandle
  product: ProductWithSomeDetails
  productdetails: ProductWithAllDetails
  title?: string
  hint?: string
  className?: string
}

export const AddToCartLink = ({
  storefront,
  product,
  productdetails,
  title,
  hint,
  className
}: Props) => {

  
const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()

const ProductTitle = productdetails.product.content?.title
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

const isMyProduct = isMyAddress(productdetails.product.struct.owner);


const openNotification = () => {
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

const [ qty, setQty ] = useState<string | number | undefined>()

const onQtyChanged = (qty: string | number | undefined) => {
 // console.log('qty is ---> '+qty)
  setQty(qty)
}



  const data = {
    "products":[
        {
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
    ]
}


  const addToCart = (data: any) => {
    console.log('***** ADD TO CART TRIGGERED ****')
    if(!localStorage.getItem('cart')) {
      console.log('$0 Cart is empty')
      localStorage.setItem('cart', JSON.stringify([]))
    }
    var gotStorage = localStorage.getItem('cart')
    var dataCart = JSON.parse((gotStorage)!)
    var product = data

    if (dataCart.length === 0 || !dataCart.find((p: { name: any }) => p.name === product.name)) {
      dataCart.push(product)
      localStorage.setItem('cart', JSON.stringify(dataCart))
    } else if (dataCart.find((p: any) => p.name === product.name)) {
      dataCart.find((p: { qty: any }) => p.qty === p.qty+qty)
      dataCart.splice(
        dataCart.findIndex((p: any) => p.name === product.name),
        1,
        product
      )
      localStorage.setItem('cart', JSON.stringify(dataCart))
      openNotification()
    }

  }



  // console.log('** Got price --> ' + ProductPrice)

  return <>

  <div className="addtocart-price">
  <InputNumber
      name='price'
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={ProductPrice}
      step='0.01'
      style={{
        width: 200,
      }}
      disabled={true}
    />  X 
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
    </a>
  </div>
  </>
}

export default AddToCartLink



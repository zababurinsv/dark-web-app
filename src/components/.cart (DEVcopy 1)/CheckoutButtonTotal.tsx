import store from 'store2'
import React from 'react';
import { InputNumber } from 'antd';




type CheckoutButtonTotalProps = {
    cartTotal?:  string | undefined
  }
  


  export const CheckoutButtonTotal = ({ cartTotal }: CheckoutButtonTotalProps) => {

    const cartStore = store.namespace('Darkdot_Cart')

 const cartProductTotal = cartStore.get(['totals'])
//  const cartEscrowTotal = store('Darkdot_Cart')['totals']['escrow_total']
//  const cartShippingTotal = store('Darkdot_Cart')['totals']['shipping_total']

    console.warn(cartProductTotal)
  
 if(cartProductTotal != 0) {
  cartTotal = cartProductTotal
 }
 else{
   cartTotal = undefined
 }


  return <>
    {cartTotal
      ? <>

  <InputNumber
      name='price'
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={cartTotal}
      step='0.01'
      style={{
        width: 200,
      }}
      disabled={true}
    />
      </>
      :
<span>Cart is empty</span>
}
  </>
}

export default CheckoutButtonTotal;



// export const productstoreKey = 'products'
// export const totalsstoreKey = 'totals'

// interface Options {
//     location?: {
//       x?: number;
//       y?: number;
//     };
//   }
//   function foo(options?: Options) {
//     if (options && options.location && options.location.x) {
//       const x = options.location.x; // Type of x is number
//     }
//   }


//     function checkCart () {
//     if(Cart) {
//       console.log('Cart structure exists.') 
//     }
//       else {
//     //Setting store key and data
//     store('Darkdot_Cart', {'products': [], 'totals':[]}); 
//     console.log('Cart structure created.')
//     }
        
//   }

//   function addToCart (data: any) {
//     Cart.add('products', data); 
//     console.log('Product : '+data['name']+' added to cart.')
//   }
  
//   function getCartTotal () : number | undefined { 
//     let cartTotal = 0
//     if(Cart.get('totals').length > 0) {
//         cartTotal = Cart.get('totals')
//     }
//     return cartTotal
//   }
  





//   export function maxLenError (fieldName: string, maxLen: number | BN): string {
//     return `${fieldName} is too long. Maximum length is ${pluralize(maxLen, 'char')}.`
//   }
  

// export { checkCart, addToCart, getCartTotal  }
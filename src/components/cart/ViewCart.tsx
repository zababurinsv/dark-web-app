import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { notification } from "antd";
import Link from "next/link";
import React from "react";
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from "src/ipfs";
import { PageContent } from "../main/PageWrapper";
import ButtonLink from "../utils/ButtonLink";
import Section from "../utils/Section";
import CartPriceToDark from './CartPriceToDark';
import EmptyCart from './EmptyCart';

type ViewCartProps = {

}

export const ViewCart = ({ }: ViewCartProps) => {


    const {
        isEmpty,
        cartTotal,
        totalUniqueItems,
        items,
        updateItemQuantity,
        updateCartMetadata,
        removeItem,
        emptyCart
    } = useCart();

    // Buyer escrow total
    const totalBescrow = items
    .filter((item) => item.quantity != undefined)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.price * (cur.bescrow / 100) * cur.quantity!)) );
    }, 0); 
    // Shipping total
    const totalShipping = items
    .filter((item) => item.shipcost > 0)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.shipcost * cur.quantity!)) );
    }, 0); 
    // Cart total
    const grandTotal = cartTotal + totalBescrow + totalShipping;

// Accepts the array and key
const groupBy = (array: any[], key: string) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };
  



  const openNotification = (DiffSellers: number | undefined) => {
    notification.open({
      type: 'warning',
      message: 'As the automated escrow system proof of concept works, you can only order in one storefront at a time.',
      description:
      'You have ' + DiffSellers?.toString()+' different sellers, your cart will be split.',
      onClick: () => {
        console.log('Orders splitted from different storefronts!');
      },
    });
  };

  // Group by seller as key to the person array
  const cartGroupedBySeller = groupBy(items, 'seller');
  // Keep first group as main order to complete, keep others in cart
//  console.warn(cartGroupedBySeller)

//   for (const [key, value] of Object.entries(cartGroupedBySeller)) {
//     console.log(`${key}: ${value}`);
//   }




  if( Object.keys(cartGroupedBySeller).length > 1) {
    openNotification(Object.keys(cartGroupedBySeller).length)
    const objToArray = Object.values(cartGroupedBySeller);  //makes the array


    let constFirstCart : any = objToArray.shift()
    
    console.log(constFirstCart);

     updateCartMetadata({ for_later: objToArray });
    // console.log(objToArray[0]);

    for(var i = 0; i < objToArray.length; i++){
      if(objToArray[i] instanceof Array){
        let forLater : any = objToArray[i]
        forLater.forEach((entry: any) => {
          console.log(entry.id);
          removeItem(entry.id)
      });      }else{
          console.log(objToArray[i]);
      }
    }
  }
  


    // if empty cart
    if (isEmpty) return <EmptyCart />

    // cart
    return (
        <>

    <Section className='DfContentPage mt-4'>

                <h1>My Cart </h1>

            <table className='ant-table view-cart-table'>
                <thead className='ant-table-thead'>
                    <tr>
                    <th className='ant-table-cell cart-th'>
                    </th>
                    <th className='ant-table-cell cart-th'>
                        Description
                    </th>
                    <th className='ant-table-cell cart-th'>
                        Unit price
                    </th>
                    <th className='ant-table-cell cart-th'>
                        Qty
                    </th>
                    <th className='ant-table-cell cart-th'>
                    </th>
                    <th className='ant-table-cell cart-th'>
                    </th>
                    <th className='ant-table-cell cart-th'>
                    </th>
                    </tr>
                </thead>
                <tbody className='ant-table-tbody'>
                {items.map(item => (
                    <tr className='ant-table-row' key={item.id}>
                        <td className='ant-table-cell'>
                        <img src={resolveIpfsUrl(item.img)} className='DfCartImage' /* add onError handler */ />
                        </td>
                        <td className='ant-table-cell cart-cell cart-desc'>
                        <span className='cart-product-title'>{item.name}</span><br />
                        <span className='cart-product-escrow'>Escrow : {item.bescrow}%</span>
                        <br />
                        <span className='cart-product-shipcost'>Shipping cost : {item.shipcost ? (item.shipcost.toFixed(2)).toLocaleString()+'$' : 'free'}</span>
                        {/* <br />
                        <span className='cart-product-seller'>Seller : {item.seller}</span> */}
                        </td>
                        <td className='ant-table-cell cart-cell'>
                        {(item.price.toFixed(2)).toLocaleString()}$
                        </td>
                        <td className='ant-table-cell cart-cell'>
                        {item.quantity}
                        </td>
                        <td className='ant-table-cell'>
                        <a className="removeOne"
                            onClick={() => updateItemQuantity(item.id, item.quantity! - 1)}
                        >
                          <MinusCircleOutlined />
                        </a>
                        </td>
                        <td className='ant-table-cell'>
                        <a className="addOne"
                            onClick={() => updateItemQuantity(item.id, item.quantity! + 1)}
                        >
                           <PlusCircleOutlined />
                        </a>
                        </td>
                        <td className='ant-table-cell'>
                        <a className="removeItem" onClick={() => removeItem(item.id)}><DeleteOutlined /></a>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </Section>
            
            <Section className='DfContentPage mt-4'>
            <div className="cart-totals">
              <table className='ant-table view-cart-total'>
                <thead className='ant-table-thead'></thead>
                <tbody className='ant-table-tbody'>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Items total : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(cartTotal.toFixed(2)).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Shipping total : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(totalShipping.toFixed(2)).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Escrow  : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {totalBescrow.toFixed(2).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Order total : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(grandTotal.toFixed(2)).toLocaleString()}<br />
                        <CartPriceToDark price={grandTotal} />
                </td>
                </tr>
                </tbody>
              </table>
                   </div>
                <ButtonLink className='checkout-btn' href='/cart/checkout'>
                 Checkout
                </ButtonLink>
                
          
            {!isEmpty && <ButtonLink className='empty-cart-btn' href='#' onClick={emptyCart}>Empty cart</ButtonLink>}
  
            </Section>
        </>
    );
}

export default ViewCart;


import React from "react";
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from "src/ipfs";
import { PageContent } from "../main/PageWrapper";
import Section from "../utils/Section";

type CheckoutProps = {

}

export const Checkout = ({ }: CheckoutProps) => {


    const {
        isEmpty,
        cartTotal,
        totalUniqueItems,
        items,
        updateItemQuantity,
        removeItem,
        emptyCart
    } = useCart();

    if (isEmpty) return <p>Your cart is empty</p>;

    return (
        <>
                <PageContent>
      <Section className='DfContentPage DfEntireProduct'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}

            <h1>
                Checkout / Order ({totalUniqueItems} - {cartTotal})
          </h1>

            {!isEmpty && <button onClick={emptyCart}>Empty cart</button>}

            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <img src={resolveIpfsUrl(item.img)} className='DfCartImage' /* add onError handler */ />
                        {item.quantity} x {item.name}
                        <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                            -
                </button>
                        <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                            +
                </button>
                        <button onClick={() => removeItem(item.id)}>Remove &times;</button>
                    </li>
                ))}
            </ul>
            </Section>
            </PageContent>
        </>
    );
}

export default Checkout;


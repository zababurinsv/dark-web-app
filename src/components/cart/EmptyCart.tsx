import React from "react";

import { PageContent } from "../main/PageWrapper";

import Section from "../utils/Section";
import SubTitle from "../utils/SubTitle";

type EmptyCartProps = {

}

export const EmptyCart = ({ }: EmptyCartProps) => {


 

    return (
        <>
        <PageContent>
            <Section className='mb-3'>
           <SubTitle title='Your cart is empty.' className='empty-cart-titke' />
       

  
            </Section>
            </PageContent>
        </>
    );
}

export default EmptyCart;


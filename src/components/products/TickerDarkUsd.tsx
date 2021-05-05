import React, { useState } from 'react';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';
import { StorefrontUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@darkpay/dark-types/substrate/classes';
import { Option } from '@polkadot/types'
import registry from '@darkpay/dark-types/substrate/registry';
import { ProductData, ProductWithAllDetails } from '@darkpay/dark-types/dto';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';
import { mdToText } from 'src/utils';
import { HeadMeta } from '../utils/HeadMeta';
import { NextPage } from 'next';
import { getProfileName } from '../substrate';

import Section from '../utils/Section';


type TickerDarkUsdProps = {
  storefront: Storefront,
  product: ProductData,
  avgPrice?: number
}


export const TickerDarkUsd: React.FunctionComponent<TickerDarkUsdProps> = React.memo(({ product,  storefront,  }) => {
  const address = product.struct.owner.toString()


  const [ tickerDarkUsd, settickerDarkUsd ] = useState<string | number | undefined>()

  const getAvgPrice = new Promise<number>(async (resolve, reject) => {
    const darkdot = await getDarkdotApi();
    const { substrate } = darkdot
    const prices = await substrate.getPrices()
    
  
    if(prices.length > 0) {
    var sum = 0;
  for( var i = 0; i < prices.length; i++ ){
      sum += parseInt( prices[i], 10 ); //don't forget to add the base
  }
  
  const lastPrice = (sum/prices.length)/100000;
  settickerDarkUsd(lastPrice)
  resolve(lastPrice)
    // return {
    //   lastPrice
    // }
  }
  else {
  reject('Zero or no data given by Offchain storage')
  }

});


const avgPrice = getAvgPrice.then((price) => {  
  settickerDarkUsd(price)
  console.log('******* NowgetAvgPrice : ' + price)
  return(price) // Succès !
  }, (err ) => {
  console.log('******* NowgetAvgPrice ERROR: '+ err) // Erreur !
});


  return <Section className={`DfTickerDarkUsd`}>
{tickerDarkUsd}
    <h3>TESTEU : {address} ---- </h3> 
  </Section>
})







/////////////
export default TickerDarkUsd;
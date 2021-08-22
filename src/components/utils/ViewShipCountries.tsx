import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@darkpay/dark-utils';
import { Tag } from 'antd';
import Link from 'next/link';
import React from 'react';
import { BaseProps } from '@polkadot/react-identicon/types';

type ViewShipCountryProps = {
  country?: string
}

const ViewShipCountry = React.memo(({ country }: ViewShipCountryProps) => {
  const searchLink = `/search?q=${country}`

  return isEmptyStr(country)
    ? null
    : <Tag key={country} className='mt-3'>
      <Link href={searchLink} as={searchLink}>
        <a className='DfGreyLink'>{country}</a>
      </Link>
    </Tag>
})

type ViewShipCountriesProps = BaseProps & {
  countries?: string[]
}

export const ViewShipCountries = React.memo(({
  countries = [],
  className = '',
  ...props
}: ViewShipCountriesProps) =>
  isEmptyArray(countries)
    ? null
    : <div className={`DfTags ${className}`} {...props}>
      {countries.filter(nonEmptyStr).map((country, i) => <ViewShipCountry key={`${country}-${i}`} country={country} />)}
    </div>
)

export default ViewShipCountries

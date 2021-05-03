import React, { useState } from 'react'
import { Form, Input } from 'antd'
import Router from 'next/router'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProfileUpdate, OptionIpfsContent, IpfsContent } from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { ProfileContent, AnyAccountId, ProfileData } from '@darkpay/dark-types'
import { newLogger } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import DfMdEditor from '../utils/DfMdEditor'
import { withMyProfile } from './address-views/utils/withLoadedOwner'
import { accountUrl } from '../urls'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN } from 'src/config/ValidationsConfig'
import { UploadAvatar } from '../uploader'
import { resolveCidOfContent } from '@darkpay/dark-api/utils'
import messages from 'src/messages'

const log = newLogger('EditProfile')

type Content = ProfileContent

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {
  address: AnyAccountId,
  owner?: ProfileData
}

function getInitialValues ({ owner }: FormProps): FormValues {
  if (owner) {
    const { content } = owner
    return { ...content }
  }
  return {}
}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  const { owner, address } = props
  const isProfile = owner?.profile
  const initialValues = getInitialValues(props)

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    // const fieldValues = getFieldValues()

    // /** Returns `undefined` if value hasn't been changed. */
    // function getValueIfChanged (field: FieldName): any | undefined {
    //   return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    // }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = resolveCidOfContent(owner?.profile?.content)
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!isProfile) {
      return [ new IpfsContent(cid) ];
    } else {
      // Update only dirty values.

      const update = new ProfileUpdate({
        content: new OptionIpfsContent(getCidIfChanged())
      })

      return [ update ]
    }
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const goToView = () => {
    if (address) {
      Router.push('/accounts/[address]', accountUrl({ address })).catch(err => log.error('Error while route:', err));
    }
  };

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    goToView()
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('avatar')]: url })
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>

      <Form.Item
        name={fieldName('avatar')}
        label='Avatar'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadAvatar onChange={onAvatarChanged} img={initialValues.avatar} />
      </Form.Item>

      <Form.Item
        name={fieldName('name')}
        label='Profile name'
        hasFeedback
        rules={[
          // { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Full name or nickname' />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='About'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      <DfFormButtons
        form={form}
        txProps={{
          label: isProfile
            ? 'Update profile'
            : 'Create new profile',
          tx: isProfile
            ? 'profiles.updateProfile'
            : 'profiles.createProfile',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection (props: FormProps) {
  const { owner } = props
  const title = owner?.profile ? `Edit profile` : `New profile`

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} />
    </Section>
  </>
}

export const EditProfile = withMyProfile(FormInSection)

export const NewProfile = withMyProfile(FormInSection)

export default NewProfile

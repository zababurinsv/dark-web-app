// Copyright 2017-2019 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Options } from './types';

const WSS_LOCALHOST = 'ws://127.0.0.1:9944/';

const ENDPOINTS: Options = [
  { text: 'Local Node (127.0.0.1:9944)', value: WSS_LOCALHOST }
];

const LANGUAGE_DEFAULT = 'default';

const CRYPTOS: Options = [
  { text: 'Edwards (ed25519)', value: 'ed25519' },
  { text: 'Schnorrkel (sr25519)', value: 'sr25519' }
];

const LANGUAGES: Options = [
  { value: LANGUAGE_DEFAULT, text: 'Default browser language (auto-detect)' }
];

const UIMODES: Options = [
  { value: 'full', text: 'Fully featured' },
  { value: 'light', text: 'Basic features only' }
];

const UITHEMES: Options = [
  { value: 'substrate', text: 'Substrate' }
];

const ENDPOINT_DEFAULT = WSS_LOCALHOST;

const UITHEME_DEFAULT = 'substrate';

// tslint:disable-next-line
const UIMODE_DEFAULT = typeof window !== 'undefined'
  ? 'light'
  : 'full';

export {
  CRYPTOS,
  ENDPOINT_DEFAULT,
  ENDPOINTS,
  LANGUAGE_DEFAULT,
  LANGUAGES,
  UIMODE_DEFAULT,
  UIMODES,
  UITHEME_DEFAULT,
  UITHEMES
};

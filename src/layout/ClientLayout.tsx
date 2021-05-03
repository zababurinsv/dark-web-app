import React from 'react';
import { DarkdotApiProvider } from '../components/utils/DarkdotApiContext';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { Navigation } from './Navigation'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from '../components/auth/AuthContext';
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate';
import { ResponsiveSizeProvider } from 'src/components/responsive';
import { KusamaProvider } from 'src/components/kusama/KusamaContext';
import { kusamaUrl } from 'src/components/utils/env';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  return (
    <ResponsiveSizeProvider >
      <SidebarCollapsedProvider>
        <SubstrateProvider>
          <KusamaProvider endpoint={kusamaUrl}>
          <SubstrateWebConsole />
          <DarkdotApiProvider>
            <MyAccountProvider>
              <AuthProvider>
                <Navigation>
                  {children}
                </Navigation>
              </AuthProvider>
            </MyAccountProvider>
          </DarkdotApiProvider>
          </KusamaProvider>
        </SubstrateProvider>
      </SidebarCollapsedProvider>
    </ResponsiveSizeProvider>
  )
};

export default ClientLayout;

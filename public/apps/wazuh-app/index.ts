import { AppMountParameters } from 'opensearch_dashboards/public';
import { setErrorOrchestrator } from '../../react-services/common-services';
import { AppState } from '../../react-services/app-state';
import { ErrorOrchestratorService } from '../../react-services/error-orchestrator/error-orchestrator.service';
import { Cookies } from 'react-cookie';
import {
  setHttp,
  setScopedHistory,
  setCookies,
} from '../../kibana-services';
import store from '../../redux/store';
import { updateAppConfig } from '../../redux/actions/appConfigActions';

export default function wazuhAppRegisterConfig(stateUpdater) {
  const innerAngularName = 'app/wazuh';

  return {
    id: `wazuh`,
    title: 'Wazuh',
    mount: async ({ core, params, initializeInnerAngular, logos, euiIconType }) => {
      try {
        if (!initializeInnerAngular) {
          throw Error('Wazuh plugin method initializeInnerAngular is undefined');
        }

        // Update redux app state logos with the custom logos
        if (logos) {
          store.dispatch(updateAppConfig(logos));
        }


        setScopedHistory(params.history);
        // Load application bundle
        const { renderApp } = await import('../../application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        setErrorOrchestrator(ErrorOrchestratorService);
        setHttp(core.http);
        setCookies(new Cookies());
        if (!AppState.checkCookies() || params.history.parentHistory.action === 'PUSH') {
          window.location.reload();
        }
        await initializeInnerAngular();
        params.element.classList.add('dscAppWrapper', 'wz-app');
        const unmount = await renderApp(innerAngularName, params.element);
        stateUpdater.next(() => {
          return {
            status: 0,
            category: {
              id: 'wazuh',
              label: 'Wazuh',
              order: 0,
              euiIconType,
            }
          }
        })
        return () => {
          unmount();
        };
      } catch (error) {
        console.debug(error);
      }
    },
    updater$: stateUpdater
  }
}
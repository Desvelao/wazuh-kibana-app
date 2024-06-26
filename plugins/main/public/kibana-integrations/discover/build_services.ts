/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { History } from 'history';

import {
  Capabilities,
  ChromeStart,
  CoreStart,
  DocLinksStart,
  ToastsStart,
  IUiSettingsClient,
  PluginInitializerContext,
} from 'opensearch_dashboards/public';
import {
  FilterManager,
  TimefilterContract,
  IndexPatternsContract,
  DataPublicPluginStart,
} from 'src/plugins/data/public';
import { Start as InspectorPublicPluginStart } from '../../../../../src/plugins/inspector/public';
import { SharePluginStart } from 'src/plugins/share/public';
import { ChartsPluginStart } from 'src/plugins/charts/public';
import { VisualizationsStart } from 'src/plugins/visualizations/public';
import { SavedObjectOpenSearchDashboardsServices } from 'src/plugins/saved_objects/public';

//import { createSavedSearchesLoader, SavedSearch } from './saved_searches';
import { syncHistoryLocations } from './kibana_services';
import { OpenSearchDashboardsLegacyStart } from '../../../../../src/plugins/opensearch_dashboards_legacy/public';
import { UrlForwardingStart } from '../../../../../src/plugins/url_forwarding/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import {
  getDataPlugin,
  getNavigationPlugin,
  getVisualizationsPlugin,
} from '../../kibana-services';
//import { DiscoverStartPlugins, SavedSearch } from '../../../../../src/plugins/discover/public';

export interface DiscoverServices {
  addBasePath: (path: string) => string;
  capabilities: Capabilities;
  chrome: ChromeStart;
  core: CoreStart;
  data: DataPublicPluginStart;
  docLinks: DocLinksStart;
  history: () => History;
  theme: ChartsPluginStart['theme'];
  filterManager: FilterManager;
  indexPatterns: IndexPatternsContract;
  inspector: InspectorPublicPluginStart;
  metadata: { branch: string };
  navigation: NavigationPublicPluginStart;
  share?: SharePluginStart;
  kibanaLegacy: OpenSearchDashboardsLegacyStart;
  urlForwarding: UrlForwardingStart;
  timefilter: TimefilterContract;
  toastNotifications: ToastsStart;
  /* getSavedSearchById: (id: string) => Promise<SavedSearch>;
  getSavedSearchUrlById: (id: string) => Promise<string>; */
  getEmbeddableInjector: any;
  uiSettings: IUiSettingsClient;
  visualizations: VisualizationsStart;
}

export async function buildServices(
  core: CoreStart,
  plugins: any, //DiscoverStartPlugins,
  context: PluginInitializerContext,
  getEmbeddableInjector: any,
): Promise<DiscoverServices> {
  /*   const services: SavedObjectOpenSearchDashboardsServices = {
    savedObjectsClient: core.savedObjects.client,
    indexPatterns: plugins.data.indexPatterns,
    search: plugins.data.search,
    chrome: core.chrome,
    overlays: core.overlays,
  };
  const savedObjectService = createSavedSearchesLoader(services); */
  return {
    addBasePath: core.http.basePath.prepend,
    capabilities: core.application.capabilities,
    chrome: core.chrome,
    core,
    data: getDataPlugin(),
    docLinks: core.docLinks,
    theme: plugins.charts.theme,
    filterManager: getDataPlugin().query.filterManager,
    getEmbeddableInjector,
    /* getSavedSearchById: async (id: string) => savedObjectService.get(id),
    getSavedSearchUrlById: async (id: string) => savedObjectService.urlFor(id), */
    /* Discover currently uses two history instances:
    one from Opensearch Dashboards Platform and another from history package.
    getHistory is replaced by the following function that is used each time the Discover application is loaded to synchronise both instances */
    history: syncHistoryLocations,
    indexPatterns: getDataPlugin().indexPatterns,
    inspector: plugins.inspector,
    metadata: {
      branch: context.env.packageInfo.branch,
    },
    navigation: getNavigationPlugin(),
    share: plugins.share,
    kibanaLegacy: plugins.kibanaLegacy,
    urlForwarding: plugins.urlForwarding,
    timefilter: getDataPlugin().query.timefilter.timefilter,
    toastNotifications: core.notifications.toasts,
    uiSettings: core.uiSettings,
    visualizations: getVisualizationsPlugin(),
  };
}

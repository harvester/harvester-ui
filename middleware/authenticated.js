import { get } from '@/utils/object';
import { ClusterNotFoundError } from '@/utils/error';
import { applyProducts } from '@/store/type-map';
import { NAME as VIRTUAL } from '@/config/product/virtual';
import { HARVESTER_SETTING } from '@/config/types';
import Parse from 'url-parse';

let beforeEachSetup = false;

function setProduct(store, to) {
  let product = to.params?.product;

  if ( !product ) {
    const match = to.name?.match(/^c-cluster-([^-]+)/);

    if ( match ) {
      product = match[1];
    }
  }

  if ( !product ) {
    product = VIRTUAL;
  }

  store.commit('setProduct', product);
}

export default async function({ route, store, redirect }) {
  if ( route.path && typeof route.path === 'string') {
    // Ignore webpack hot module reload requests
    if ( route.path.startsWith('/__webpack_hmr/') ) {
      return;
    }

    // Ignore the error page
    if ( route.path.startsWith('/fail-whale') ) {
      return;
    }
  }

  // Load stuff
  await applyProducts(store);

  // Setup a beforeEach hook once to keep track of the current product
  if ( !beforeEachSetup ) {
    beforeEachSetup = true;

    store.app.router.beforeEach((to, from, next) => {
      setProduct(store, to);
      next();
    });

    // Call it for the initial pageload
    setProduct(store, route);
  }

  try {
    let clusterId = get(route, 'params.cluster') || 'local';

    if ( clusterId ) {
      // Run them in parallel
      await Promise.all([
        await store.dispatch('loadManagement'),
        await store.dispatch('loadCluster', clusterId),
      ]);
    } else {
      await store.dispatch('loadManagement');

      clusterId = store.getters['defaultClusterId']; // This needs the cluster list, so no parallel

      if ( clusterId ) {
        await store.dispatch('loadCluster', clusterId);
      }
    }
  } catch (e) {
    if ( e instanceof ClusterNotFoundError ) {
      // return redirect(302, '/clusters');
    } else {
      store.commit('setError', e);

      return redirect(302, '/fail-whale');
    }
  }

  // setting-url
  const serverUrl = store.getters['cluster/byId'](HARVESTER_SETTING, 'server-url');
  const { origin } = Parse(window.location.href);

  if (serverUrl && !serverUrl?.value) {
    serverUrl.value = origin;
    serverUrl.save();
  } else if (!serverUrl) {
    const value = {
      apiVersion: 'harvester.cattle.io/v1alpha1',
      kind:       'Setting',
      metadata:   { name: 'server-url' },
      value:      origin
    };

    const proxyResource = await store.dispatch('cluster/create', value);

    await proxyResource.save({ url: 'v1/harvester.cattle.io.settings' });
  }
}

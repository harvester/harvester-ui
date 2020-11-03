import { get } from '@/utils/object';
import { ClusterNotFoundError } from '@/utils/error';
import { applyProducts } from '@/store/type-map';
import { NAME as VIRTUAL } from '@/config/product/virtual';
import { addParam } from '@/utils/url';

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
      // If history back leaves the router base, redirect (to ember) instead of letting nuxt try to render it
      if ( !to.path.startsWith(app.router.options.base) && !to.query.redir ) {
        window.location.href = addParam(to.fullPath, 'redir', 1);

        return;
      }

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
}

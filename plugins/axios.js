import https from 'https';
import { parse as setCookieParser } from 'set-cookie-parser';
import { getPrefix } from '@/utils/url';
import pkg from '../package.json';

export default function({
  $axios, $cookies, isDev, req, route, redirect, store
}) {
  $axios.defaults.headers.common['Accept'] = 'application/json';
  $axios.defaults.withCredentials = true;
  $axios.defaults.timeout = 20000;

  $axios.onRequest((config) => {
    const csrf = $cookies.get('CSRF');

    if ( csrf ) {
      config.headers['x-api-csrf'] = csrf;
    }

    if ( process.server ) {
      config.headers.common['access-control-expose-headers'] = `set-cookie`;
      config.headers.common['user-agent'] = `Dashboard (Mozilla) v${ pkg.version }`;

      if ( req.headers.cookie ) {
        config.headers.common['cookies'] = req.headers.cookie;
      }

      if ( config.url.startsWith('/') ) {
        config.baseURL = `${ req.protocol || 'https' }://${ req.headers.host }`;
      }
    }
  });

  if ( process.server ) {
    $axios.onResponse((res) => {
      const parsed = setCookieParser(res.headers['set-cookie'] || []);

      for ( const opt of parsed ) {
        const key = opt.name;
        const value = opt.value;

        delete opt.name;
        delete opt.value;

        opt.encode = x => x;
        opt.sameSite = false;
        opt.path = '/';
        opt.secure = true;

        $cookies.set(key, value, opt);
      }
    });
  }

  if ( isDev ) {
    // https://github.com/nuxt-community/axios-module/blob/dev/lib/module.js#L78
    // forces localhost to http, for no obvious reason.
    // But we never have any reason to talk to anything plaintext.
    if ( $axios.defaults.baseURL.startsWith('http://') ) {
      $axios.defaults.baseURL = $axios.defaults.baseURL.replace(/^http:/, 'https:');
    }

    const insecureAgent = new https.Agent({ rejectUnauthorized: false });

    $axios.defaults.httpsAgent = insecureAgent;
    $axios.httpsAgent = insecureAgent;
  }

  $axios.interceptors.response.use(
    response => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        if (error.response.config.url.includes('auth?action=login') || error.response.config.url.includes('local?action=login')) {
          return Promise.reject(error.response);
        }

        if (error.response.config.url.includes('v1-public/auth-modes')) {
          store.dispatch('auth/canGetAuthModes', { status: false });
        }

        if (getPrefix()) {
          redirect(401, '/auth/login');
        } else {
          redirect(401, '/auth/logout');
        }

        return new Promise(() => {});
      }

      if (error.code === 'ECONNABORTED') {
        error.message = store.getters['i18n/t']('harvester.axios.timeoutErrorMessage', { timeout: 20 });
      }

      return Promise.reject(error);
    }
  );
}

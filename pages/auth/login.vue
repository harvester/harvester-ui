<script>
import { mapGetters } from 'vuex';
import { mapPref, DEV } from '@/store/prefs';
import { sortBy } from '@/utils/sort';
import { removeObject } from '@/utils/array';
import { LOGGED_OUT, _FLAGGED, LOCAL } from '@/config/query-params';
import { importLogin } from '@/utils/dynamic-importer';
import { configType } from '@/models/management.cattle.io.authconfig';
import AsyncButton from '@/components/AsyncButton';
import Loading from '@/components/Loading';
import Banner from '@/components/Banner';
import LabeledInput from '@/components/form/LabeledInput';
export default {
  name:       'Login',
  layout:     'unauthenticated',
  components: {
    AsyncButton, Loading, LabeledInput, Banner
  },
  async asyncData({ route, redirect, store }) {
    const drivers = await store.dispatch('auth/getAuthProviders');
    const providers = sortBy(drivers.map(x => x.id), ['id']);

    const hasLocal = providers.includes('local');
    const hasOthers = hasLocal && !!providers.find(x => x !== 'local');

    if ( hasLocal ) {
      // Local is special and handled here so that it can be toggled
      removeObject(providers, 'local');
    }

    return {
      providers,
      hasOthers,
      hasLocal,
      showLocal: !hasOthers || (route.query[LOCAL] === _FLAGGED),
    };
  },
  data({ $cookies }) {
    return {
      loginMode: '',
      err:       '',
      loading:   false,
      form:      {
        username: '',
        password: ''
      },
      rules:     {
        username: [{ required: true, message: this.$store.getters['i18n/t']('validation.required', { key: 'Username' }) }],
        password: [{ required: true, message: this.$store.getters['i18n/t']('validation.required', { key: 'Password' }) }]
      },
      providers:          [],
      providerComponents: [],
    };
  },
  computed: {
    ...mapGetters('i18n', ['selectedLocaleLabel', 'availableLocales']),
    ...mapGetters('auth', ['isFirstLogin']),
    dev: mapPref(DEV),
    loggedOut() {
      return this.$route.query[LOGGED_OUT] === _FLAGGED;
    },
    showNone() {
      return this.dev && process.env.dev;
    },
    showLocale() {
      return Object.keys(this.availableLocales).length > 1 || this.dev;
    },
    equalPassword() {
      if (!this.form.password || !this.form.confirmPassword) {
        return false;
      }
      if (this.form.password !== this.form.confirmPassword) {
        return false;
      }

      return true;
    },
  },
  created() {
    this.providerComponents = this.providers.map((name) => {
      return importLogin(configType[name]);
    });
  },
  mounted() {
    this.focusSomething();
    document.body.addEventListener('keyup', this.pressEnter);
    if (this.$cookies.get('loggedIn')) {
      this.loading = true;
      this.$store.commit('auth/loggedIn');
      this.$router.replace('/');
    }
  },
  destroyed() {
    document.body.removeEventListener('keyup', this.pressEnter);
  },
  methods: {
    focusSomething() {
      let elem;

      if ( this.hasGithub && !this.showLocal ) {
        elem = this.$refs.github;
      } else if ( this.username ) {
        elem = this.$refs.password;
      } else {
        elem = this.$refs.username;
      }
      if ( elem ) {
        elem.focus();
        if ( elem.select ) {
          elem.select();
        }
      }
    },
    toggleLocal() {
      this.showLocal = true;
      this.$router.applyQuery({ [LOCAL]: _FLAGGED });
      this.$nextTick(() => {
        this.focusSomething();
      });
    },
    login(buttonCb) {
      const data = {};

      this.err = null;
      if (!this.isFirstLogin && (!this.form.username || this.form.username === '')) {
        this.err = this.getInvalidMsg(this.t('harvester.loginPage.username'));

        return buttonCb(false);
      }
      if (!this.form.password || this.form.password === '') {
        this.err = this.getInvalidMsg(this.t('harvester.loginPage.password'));

        return buttonCb(false);
      }
      if (this.isFirstLogin && this.form.confirmPassword !== this.form.password) {
        this.err = this.t('harvester.loginPage.validation.notEquivalent');

        return buttonCb(false);
      }
      data.username = this.form.username;
      data.password = this.form.password;
      this.realLogin(buttonCb, data);
    },
    async realLogin(buttonCb, data) {
      try {
        await this.$store.dispatch('auth/login', { body: { ...data }, isLocalUser: true });
        this.$router.replace('/');
        buttonCb(true);
      } catch (err) {
        const data = err.data || err.response?.data;

        this.err = data?.errors?.[0] || data?.message || 'An error occurred logging in.  Please try again.';
        buttonCb(false);
      }
    },
    getInvalidMsg(key) {
      return this.$store.getters['i18n/t']('validation.required', { key });
    },
    pressEnter(e) {
      if (e.keyCode === 13) {
        this.$refs.loginButton.$el.click();
      }
    },
    switchLocale(locale) {
      this.$store.dispatch('i18n/switchTo', locale);
      this.$refs.popover.isOpen = false;
    }
  }
};
</script>
<template>
  <main class="login">
    <div class="row mb-20">
      <div v-if="!isFirstLogin" class="col span-6">
        <p class="text-center">
          {{ t('harvester.loginPage.howdy') }}
        </p>
        <h1 class="text-center">
          {{ t('harvester.loginPage.welcome') }}
        </h1>
        <div class="login__container">
          <div v-if="showLocale" class="locale">
            <v-popover
              ref="popover"
              placement="bottom"
              trigger="click"
            >
              <a>
                <i class="icon icon-globe"></i> {{ selectedLocaleLabel }}
              </a>
              <template slot="popover">
                <ul class="list-unstyled dropdown" style="margin: -1px;">
                  <li v-if="showNone" v-t="'locale.none'" class="p-10 hand" @click="switchLocale('none')" />
                  <li
                    v-for="(value, name) in availableLocales"
                    :key="name"
                    class="p-10 hand"
                    @click="switchLocale(name)"
                  >
                    {{ value }}
                  </li>
                </ul>
              </template>
            </v-popover>
          </div>
          <div v-if="providers.length" class="mt-50">
            <component
              :is="providerComponents[idx]"
              v-for="(name, idx) in providers"
              :key="name"
              class="mb-10"
              :focus-on-mount="(idx === 0 && !showLocal)"
              :name="name"
              :only-option="providers.length === 1 && !showLocal"
            />
          </div>
          <template v-if="hasLocal">
            <div v-if="showLocal" class="mt-20 half">
              <LabeledInput v-model="form.username" :label="t('harvester.loginPage.username')" required />
              <LabeledInput
                v-model="form.password"
                :label="t('harvester.loginPage.password')"
                type="password"
                class="mt-10"
                required
              />
              <Banner v-if="err" class="mt-20 half" color="error" :label="err" />
              <AsyncButton
                ref="loginButton"
                class="login__go mt-20"
                :action-label="t('harvester.loginPage.signIn')"
                :waiting-label="t('harvester.loginPage.loggingIn')"
                :success-label="t('harvester.loginPage.loggedIn')"
                :error-label="t('harvester.loginPage.error')"
                v-bind="$attrs"
                @click="login"
              />
            </div>
            <div v-if="hasLocal && !showLocal" class="mt-20 text-center">
              <button type="button" class="btn bg-link" @click="toggleLocal">
                {{ t('login.useLocal') }}
              </button>
            </div>
          </template>
          <Loading v-if="loading" />
        </div>
      </div>
      <div v-else class="col span-6">
        <div class="login__container">
          <p class="text-center">
            {{ t('harvester.loginPage.howdy') }}
          </p>
          <h1 class="text-center">
            {{ t('harvester.loginPage.welcome') }}
          </h1>
          <t k="harvester.loginPage.firstLoginProtip" :raw="true" class="login__protip mt-10 mb-10" />
          <div class="half">
            <LabeledInput
              v-model="form.password"
              :label="t('harvester.loginPage.newPassword')"
              type="password"
              class="mt-10"
              required
            />
            <LabeledInput
              v-model="form.confirmPassword"
              :label="t('harvester.loginPage.confirmPassword')"
              type="password"
              class="mt-10"
              required
            />
          </div>
          <Banner v-if="err" class="mt-20 half" color="error" :label="err" />
          <AsyncButton
            ref="loginButton"
            class="login__go mt-20"
            :action-label="t('harvester.loginPage.continue')"
            :waiting-label="t('harvester.loginPage.loggingIn')"
            :success-label="t('harvester.loginPage.loggedIn')"
            :error-label="t('harvester.loginPage.error')"
            v-bind="$attrs"
            :disabled="!equalPassword"
            @click="login"
          />
        </div>
      </div>
      <div class="col span-6 landscape"></div>
    </div>
  </main>
</template>
<style lang="scss">
  .login {
    overflow: hidden;
    .locale {
      a {
        cursor: pointer;
      }
    }
    .row {
      align-items: center;
    }
    &__alert {
      width: 450px;
    }
    &__go {
      width: 50%;
      display: block;
      margin: 0 auto;
    }
    &__container {
      display: grid;
      grid-template-columns: 100%;
      place-items: center;
    }
    &__protip {
      display: block;
      code {
        padding: 2px 4px;
        background: var(--primary);
      }
    }
    .half {
      width: 50%;
    }
    .landscape {
      background-image: url('~assets/images/login-landscape.svg');
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center center;
      height: 100vh;
    }
  }
</style>

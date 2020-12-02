<script>
import { LOGGED_OUT, _FLAGGED } from '@/config/query-params';
import AsyncButton from '@/components/AsyncButton';
import Loading from '@/components/Loading';
import Banner from '@/components/Banner';
import ButtonGroup from '@/components/ButtonGroup';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  name:       'Login',
  layout:     'unauthenticated',
  components: {
    AsyncButton, Loading, ButtonGroup, LabeledInput, Banner
  },

  async asyncData(ctx) {
    const data = await ctx.store.dispatch('auth/getAuthModes');

    return { authModes: data.modes };
  },

  data({ $cookies }) {
    return {
      loginMode: '',
      file:      {},
      toUpload:  null,
      token:     '',
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
    };
  },

  computed: {
    groupOptions() {
      return [
        { value: 'kubeconfig', label: 'kubeconfig' },
        { value: 'token', label: 'token' },
        { value: 'local', label: 'local' },

      ];
    },

    fileMode() {
      return this.loginMode === 'kubeconfig';
    },

    tokenMode() {
      return this.loginMode === 'token';
    },

    localMode() {
      return this.loginMode === 'local';
    },

    fileName() {
      return this.file?.name;
    },

    unauthorized() {
      return this.$route.query.unauthorized === _FLAGGED;
    },

    loggedOut() {
      return this.$route.query[LOGGED_OUT] === _FLAGGED;
    },

    allowKubeCredentials() {
      return (this.authModes || []).includes('kubernetesCredentials');
    },

    allowLocalUser() {
      return (this.authModes || []).includes('localUser');
    },

    onlyLocalUser() {
      const modes = (this.authModes || []);

      return modes.length === 1 && modes.includes('localUser');
    },

  },

  watch: {
    authModes: {
      handler(neu) {
        let mode = '';

        if (neu.includes('kubernetesCredentials')) {
          mode = 'kubeconfig';
        } else if (neu.includes('localUser')) {
          mode = 'local';
        }

        this.loginMode = mode;
      },
      deep:      true,
      immediate: true
    },
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

    fileChange() {
      const reader = new FileReader();

      this.file = this.$refs.uploader.files[0];

      if (!this.file) {
        return;
      }

      reader.onload = (loaded) => {
        const value = loaded.target.result;

        this.toUpload = value;
      };

      reader.onerror = (err) => {
        this.$dispatch('growl/fromError', { title: 'Error reading file', err }, { root: true });
      };

      reader.readAsText(this.file);
    },

    login(buttonCb) {
      const data = {};

      this.err = null;

      if (this.fileMode) {
        if (!this.toUpload) {
          this.err = this.getInvalidMsg('Kubeconfig');

          return buttonCb(false);
        }

        data.kubeconfig = this.toUpload;
      } else if (this.tokenMode) {
        if (!this.token || this.token === '') {
          this.err = this.getInvalidMsg('Token');

          return buttonCb(false);
        }

        data.token = this.token;
      }

      if (this.localMode) {
        if (!this.form.username || this.form.username === '') {
          this.err = this.getInvalidMsg('Username');

          return buttonCb(false);
        }

        if (!this.form.password || this.form.password === '') {
          this.err = this.getInvalidMsg('Password');

          return buttonCb(false);
        }

        data.username = this.form.username;
        data.password = this.form.password;
      }

      this.realLogin(buttonCb, data);
    },

    async realLogin(buttonCb, data) {
      try {
        await this.$store.dispatch('auth/login', { data });
        this.$router.replace('/');
        buttonCb(true);
      } catch (err) {
        const data = err.data || err.response.data;

        this.err = data?.errors?.[0] || 'An error occurred logging in.  Please try again.';
        buttonCb(false);
      }
    },

    getInvalidMsg(key) {
      return this.$store.getters['i18n/t']('validation.required', { key });
    },

    mockBtnClicked() {
      this.$refs.uploader.click();
    },

    pressEnter(e) {
      if (e.keyCode === 13) {
        this.$refs.loginButton.$el.click();
      }
    },
  }
};
</script>

<template>
  <main class="login">
    <div class="row mb-20">
      <div class="col span-6">
        <p class="text-center">
          Howdy!
        </p>
        <h1 class="text-center">
          Welcome to Harvester
        </h1>
        <div class="login__container">
          <div v-if="!onlyLocalUser">
            <div v-if="allowKubeCredentials" class="mt-20">
              <div>
                <ButtonGroup v-model="loginMode" :options="groupOptions" />
                <i v-if="fileMode" v-tooltip="t('loginPage.tips.kubeconfigLimitations', {}, raw=true)" class="icon icon-info" />
              </div>
            </div>
          </div>

          <div v-if="allowKubeCredentials && !localMode" class="mt-20 half">
            <div v-if="fileMode" class="file">
              <div class="file__url" @click="mockBtnClicked">
                {{ fileName }}
              </div>
              <button class="btn btn-sm role-primary">
                <i class="icon icon-upload" />
                <input
                  ref="uploader"
                  type="file"
                  @change="fileChange"
                />
              </button>
            </div>
            <div v-else>
              <LabeledInput v-model="token" type="password" />
            </div>
          </div>
          <div v-if="allowLocalUser && localMode" class="mt-20 half">
            <LabeledInput v-model="form.username" label="Username" required />
            <LabeledInput
              v-model="form.password"
              label="Password"
              type="password"
              class="mt-10"
              required
            />
          </div>
          <Banner v-if="err" class="mt-20 half" color="error" :label="err" />
          <AsyncButton
            ref="loginButton"
            class="login__go mt-20"
            action-label="SIGN IN"
            waiting-label="Logging In..."
            success-label="Logged In!"
            error-label="Error"
            v-bind="$attrs"
            @click="login"
          />
          <Loading v-if="loading" />
        </div>
      </div>
      <div class="col span-6 landscape"></div>
    </div>
  </main>
</template>

<style lang="scss">
  .login {
    overflow: hidden;

    .row {
      align-items: center;
    }

    &__alert {
      width: 450px;
    }

    .file {
      display: flex;
      flex-direction: row;
      overflow: hidden;

      BUTTON {
        position: relative;
        width: 45px;
        margin-left: 10px;
        overflow: hidden;
      }

      INPUT {
        position: absolute;
        right: 0;
        top: 0;
        font-size: 200px;
        filter: alpha(opacity=0);
        cursor: pointer;
        outline: none;

        &:focus {
          box-shadow: none;
        }
      }

      .file__url {
        flex: 1;
        display: flex;
        align-items: center;
        border-bottom: 1px solid darken(#EBEEF5, 5%);
        cursor: pointer;
      }
    }

    &__go {
      width: 50%;
      justify-content: center;
    }

    &__container {
      display: grid;
      grid-template-columns: 100%;
      place-items: center;
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

<script>
import { findBy } from '@/utils/array';
import { USERNAME } from '@/config/cookies';
import { LOCAL, LOGGED_OUT, TIMED_OUT, _FLAGGED } from '@/config/query-params';
import AsyncButton from '@/components/AsyncButton';
import Loading from '@/components/Loading';
import { getVendor, getProduct } from '../../config/private-label';

export default {
  name:       'Login',
  layout:     'unauthenticated',
  components: { AsyncButton, Loading },

  async asyncData(ctx) {
    const data = await ctx.store.dispatch('auth/getAuthModes');

    return { authModes: data.modes };
  },

  data({ $cookies }) {
    return {
      loginMethod: '',
      file:        {},
      toUpload:    null,
      token:       '',
      err:         '',
      loading:     false,
      form:        {
        username: '',
        password: ''
      },
      rules:       {
        username: [{ required: true, message: this.$store.getters['i18n/t']('validation.required', { key: 'Username' }) }],
        password: [{ required: true, message: this.$store.getters['i18n/t']('validation.required', { key: 'Password' }) }]
      }
    };
  },

  computed: {
    fileMode() {
      return this.loginMethod === 'kubeconfig';
    },
    tokenMode() {
      return this.loginMethod === 'token';
    },
    localMode() {
      return this.loginMethod === 'local';
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
        let method = '';

        if (neu.includes('kubernetesCredentials')) {
          method = 'kubeconfig';
        } else if (neu.includes('localUser')) {
          method = 'local';
        }

        this.loginMethod = method;
      },
      deep:      true,
      immediate: true
    },
    err(neu) {
      if (neu) {
        this.$message.error(neu);
        this.err = null;
      }
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
    <el-card>
      <div slot="header" class="clearfix">
        <span>Harvester Dashboard</span>
      </div>
      <div v-if="!onlyLocalUser">
        <p>Authentication methods:</p>
        <div v-if="allowKubeCredentials" class="mt-20">
          <div>
            <el-radio v-model="loginMethod" label="kubeconfig">
              Kubeconfig
            </el-radio>
            <el-tooltip placement="top" effect="dark">
              <div slot="content">
                {{ t('loginPage.tips.kubeconfigLimitations') }}
              </div>
              <span><i class="el-icon-info"></i></span>
            </el-tooltip>
          </div>
          <div>
            <el-radio v-model="loginMethod" label="token">
              Token
            </el-radio>
          </div>
        </div>
        <div v-if="allowLocalUser">
          <el-radio v-model="loginMethod" label="local">
            Local User
          </el-radio>
        </div>
      </div>
      <div v-if="allowKubeCredentials && !localMode" class="mt-20">
        <div v-if="fileMode" class="file">
          <div class="file__url" @click="mockBtnClicked">
            {{ fileName }}
          </div>
          <el-button icon="el-icon-more" size="small">
            <input
              ref="uploader"
              type="file"
              @change="fileChange"
            />
          </el-button>
        </div>
        <div v-else>
          <a-input-password v-model="token" />
        </div>
      </div>
      <div v-if="allowLocalUser && localMode">
        <a-form>
          <a-form-item label="Username" required>
            <a-input v-model="form.username" />
          </a-form-item>
          <a-form-item label="Password" required>
            <a-input-password v-model="form.password" />
          </a-form-item>
        </a-form>
      </div>
      <div class="mt-20">
        <AsyncButton
          ref="loginButton"
          class="login__go"
          action-label="SIGN IN"
          waiting-label="Logging In..."
          success-label="Logged In!"
          error-label="Error"
          v-bind="$attrs"
          @click="login"
        />
      </div>
    </el-card>
    <Loading v-if="loading" />
  </main>
</template>

<style lang="scss">
  .login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &__alert {
      width: 450px;
    }

    .el-card {
      width: 450px;
      margin: 0 auto;
      font-size: 14px;

      &__header {
        background-color: var(--header-bg);
        font-size: 16px;
        color: #fff;
      }

      .el-radio {
        margin-bottom: 10px;
        margin-right: 0;
      }

      .el-radio__input.is-checked+.el-radio__label {
        color: var(--primary);
      }

      .el-radio__input.is-checked .el-radio__inner {
        background-color: var(--primary);
        color: var(--primary);
      }
    }

    .file {
      display: flex;
      flex-direction: row;
      overflow: hidden;

      .el-button {
        position: relative;
        width: 45px;
        margin-left: 10px;
        overflow: hidden;

        &:hover {
          background-color: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
      }

      Input {
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
      width: 100%;
      justify-content: center;
    }

    .landscape {
      background-image: url('~assets/images/login-landscape.svg');
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center center;
      height: 100vh;
    }

    LABEL {
      margin: 0;
    }
  }
</style>

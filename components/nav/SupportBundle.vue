<script>
import randomstring from 'randomstring';
import { exceptionToErrorsArray } from '@/utils/error';
import { HCI } from '@/config/types';
import LabeledInput from '@/components/form/LabeledInput';
import AsyncButton from '@/components/AsyncButton';
import GraphCircle from '@/components/graph/Circle';

export default {
  name:       'SuppportBundle',
  components: {
    LabeledInput, GraphCircle, AsyncButton
  },
  data() {
    return {
      url:         '',
      description: '',
    };
  },

  computed: {
    bundlePending() {
      return this.$store.getters['common/isBundlePending'];
    },

    isShowBundleModal() {
      return this.$store.getters['common/isShowBundleModal'];
    },

    percentage() {
      return this.$store.getters['common/getBundlePercentage'];
    }
  },

  watch: {
    isShowBundleModal: {
      handler(show) {
        if (show) {
          this.$nextTick(() => {
            this.$modal.show('bundle-modal');
          });
        } else {
          this.$modal.hide('bundle-modal');
          this.url = '';
          this.description = '';
        }
      },
      immediate: true
    },
  },

  methods: {
    close() {
      this.$store.commit('common/toggleBundleModal', false);
      this.backUpName = '';
    },

    async save(buttonCb) {
      const name = `bundle-${ randomstring.generate(5).toLowerCase() }`;
      const namespace = 'harvester-system';

      if (!this.description) {
        this.$notify({
          title:    this.t('harvester.notification.title.warning'),
          duration: 5000,
          message:  this.t('harvester.bundleModal.requiredDesc'),
          type:     'warning'
        });
        buttonCb(false);

        return;
      }

      const bundleCrd = {
        apiVersion: 'harvesterhci.io/v1beta1',
        type:       HCI.SUPPORT_BUNDLE,
        kind:       'SupportBundle',
        metadata:   {
          name,
          namespace
        },
        spec: {
          issueURL:    this.url,
          description: this.description
        }
      };

      const bundleValue = await this.$store.dispatch('cluster/create', bundleCrd);

      try {
        const res = await bundleValue.save({ extend: { isRes: true } });

        if (res._status === 200 || res._status === 204 || res._status === 201) {
          await this.$store.commit('common/setLatestBundleId', `${ namespace }/${ name }`, { root: true });
          this.$store.dispatch('common/bundleProgress', { root: true });
        } else {
          this.$notify({
            title:    this.t('harvester.notification.title.error'),
            duration: 0,
            message:  'unknown mistake',
            type:     'error'
          });
        }
      } catch (err) {
        this.$notify({
          title:    this.t('harvester.notification.title.error'),
          duration: 0,
          message:  err?.data || exceptionToErrorsArray(err) || err,
          type:     'error'
        });
      }
    },

    open() {
      this.$store.commit('common/toggleBundleModal', true);
    },
  }
};
</script>

<template>
  <div class="bundleModal">
    <span class="bundle" @click="open">
      {{ t('harvester.bundleModal.title') }}
    </span>

    <modal
      styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
      name="bundle-modal"
      :click-to-close="false"
      :width="550"
      :height="350"
    >
      <div class="p-20">
        <h2>{{ t('harvester.bundleModal.title') }}</h2>

        <div v-if="!bundlePending" class="content">
          <LabeledInput
            v-model="url"
            :label="t('harvester.bundleModal.url')"
            class="mb-20"
          />

          <LabeledInput
            v-model="description"
            :label="t('harvester.bundleModal.description')"
            type="multiline"
            :min-height="120"
            required
          />
        </div>

        <div v-else class="content">
          <div class="circle">
            <GraphCircle primary-stroke-color="green" secondary-stroke-color="white" :stroke-width="6" :percentage="percentage" :show-text="true" />
          </div>
        </div>

        <div class="footer mt-20">
          <button class="btn btn-sm role-secondary mr-10" @click="close">
            {{ t('generic.close') }}
          </button>

          <!-- <button class="btn btn-sm bg-primary" :disabled="bundlePending" @click="save">
            {{ t('generic.create') }}
          </button> -->
          <AsyncButton
            type="submit"
            mode="create"
            class="btn btn-sm bg-primary"
            :disabled="bundlePending"
            @click="save"
          />
        </div>
      </div>
    </modal>
  </div>
</template>

<style lang="scss" scoped>
.bundleModal {
  .bundle {
    cursor: pointer;
    color: var(--primary);
  }

  .icon-spinner {
    font-size: 100px;
  }

  .content {
    height: 218px;

    .circle {
      padding-top: 20px;
      height: 160px;
    }
  }

  div {
    line-height: normal;
  }

  .footer {
    display: flex;
    justify-content: center;
  }
}
</style>

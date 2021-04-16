<script>
import Vue from 'vue';
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import LabeledInput from '@/components/form/LabeledInput';
import Footer from '@/components/form/Footer';
import RadioGroup from '@/components/form/RadioGroup';
import Tip from '@/components/Tip';
import { HARVESTER_SETTING } from '@/config/types';
import CreateEditView from '@/mixins/create-edit-view';

export default {
  name:       'ClusterNetworkSetting',
  components: {
    Footer,
    Tab,
    Tabbed,
    LabeledInput,
    RadioGroup,
    Tip
  },
  mixins: [CreateEditView],
  props:  {
    value: {
      type:     Object,
      required: true,
    },
  },
  data() {
    if (!this.value.config) {
      Vue.set(this.value, 'config', { defaultPhysicalNIC: '' });
    }

    const isShowTip = this.value.enable;

    return {
      isShowTip,
      errors:             [],
      isOpenVlan:         true,
      defaultPhysicalNic: ''
    };
  },

  created() {
    this.registerBeforeHook(() => {
      if (this.value.enable && !this.value.config.defaultPhysicalNIC) {
        return Promise.reject(new Error('DefaultPhysicalNIC is required!'));
      }
    });
  },
  methods: {
    done() {
      if ( this.doneLocationOverride) {
        return this.$router.replace(this.doneLocationOverride);
      }
      if ( !this.doneRoute ) {
        return;
      }
      this.$router.push({
        name:   this.doneRoute,
        params: { ...this.doneParams, resource: HARVESTER_SETTING } || { resource: HARVESTER_SETTING }
      });
    },
  }
};
</script>

<template>
  <div id="network-setting">
    <Tabbed v-bind="$attrs" class="mt-15" :side-tabs="true">
      <Tab name="Vlan" label="Vlan" :weight="3" class="bordered-table">
        <div class="network">
          <!-- <Switches v-model="value.spec.vlanNetwork.enable" class="mb-20" label="Enable Vlan" /> -->
          <RadioGroup
            v-model="value.enable"
            class="mb-20"
            name="model"
            :options="[true,false]"
            :labels="['Enable', 'Disable']"
          />

          <LabeledInput
            v-if="value.enable"
            v-model="value.config.defaultPhysicalNIC"
            label="DefaultPhysicalNIC"
            class="mb-5"
          />

          <Tip v-if="isShowTip && value.enable" class="mb-20" icon="icons icon-h-question" text="The newly modified default physical NIC only applies to newly added nodes, not existing ones" />
        </div>
      </Tab>
    </Tabbed>
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>

<style lang="scss">
#network-setting {
  .radio-group {
    display: flex;
    .radio-container {
      margin-right: 30px;
    }
  }
}
</style>

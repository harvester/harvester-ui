<script>
import Tabbed from '@/components/Tabbed';
import Tab from '@/components/Tabbed/Tab';
import Footer from '@/components/form/Footer';
import InfoBox from '@/components/InfoBox';
import NameNsDescription from '@/components/form/NameNsDescription';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import CreateEditView from '@/mixins/create-edit-view';
import { allHash } from '@/utils/promise';
import { HOST_CUSTOM_NAME } from '@/config/labels-annotations';
import { HARVESTER_NODE_NETWORK } from '@/config/types';

export default {
  name: 'EditNode',

  components: {
    Footer,
    Tabbed,
    InfoBox,
    Tab,
    LabeledInput,
    LabeledSelect,
    NameNsDescription
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    }
  },

  async fetch() {
    const hash = await allHash({ hostNetworks: this.$store.dispatch('cluster/findAll', { type: HARVESTER_NODE_NETWORK }) });

    const hostNetowrkResource = hash.hostNetworks.find( O => this.value.id === O.attachNodeName);

    if (hostNetowrkResource) {
      this.hostNetowrkResource = hostNetowrkResource;
      this.nic = hostNetowrkResource.spec?.nic;
      this.physicalNics = hostNetowrkResource.physicalNics;
    }
  },

  data() {
    return {
      hostNetowrkResource: null,
      customName:          this.value.getAnnotationValue(HOST_CUSTOM_NAME),
      nic:                 '',
      physicalNics:        []
    };
  },

  computed: {
    nicsOptions() {
      return this.physicalNics.map( (N) => {
        const isRecommended = N.usedByManageNetwork ? '  (Not recommended)' : '';

        return {
          value: N.name,
          label: `${ N.name } ${ isRecommended } `
        };
      });
    }
  },

  watch: {
    customName(neu) {
      this.value.setAnnotation(HOST_CUSTOM_NAME, neu);
    },

  },

  created() {
    if (this.registerBeforeHook) {
      this.registerBeforeHook(this.saveHostNetwork);
    }
  },

  methods: {
    saveHostNetwork() {
      if (this.hostNetowrkResource) {
        this.hostNetowrkResource.save();
      }
    },
  },

};
</script>

<template>
  <div class="node">
    <NameNsDescription
      :value="value"
      :namespaced="false"
      :mode="mode"
    />

    <Tabbed ref="tabbed" class="mt-15" :side-tabs="true">
      <Tab name="basics" :weight="100" :label="t('harvester.vmPage.detail.tabs.basics')">
        <LabeledInput
          v-model="customName"
          :label="t('node.detail.basic.customName')"
          class="mb-20"
          :mode="mode"
        />
      </Tab>

      <Tab v-if="hostNetowrkResource" name="network" :weight="90" :label="t('harvester.hostPage.tabs.network')">
        <InfoBox class="wrapper">
          <div class="row warpper">
            <div class="col span-6">
              <LabeledInput
                v-model="hostNetowrkResource.spec.type"
                label="Type"
                class="mb-20"
                :mode="mode"
                :disabled="true"
              />
            </div>

            <div class="col span-6">
              <LabeledSelect
                v-model="hostNetowrkResource.spec.nic"
                :options="nicsOptions"
                :label="t('harvester.fields.PhysicalNic')"
                class="mb-20"
                :mode="mode"
              />
            </div>
          </div>
        </InfoBox>
      </Tab>
    </Tabbed>
    <Footer :mode="mode" :errors="errors" @save="save" @done="done" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper{
  position: relative;
}
</style>

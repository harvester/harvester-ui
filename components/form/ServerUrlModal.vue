<script>
import Card from '@/components/Card';
import AsyncButton from '@/components/AsyncButton';
import LabeledInput from '@/components/form/LabeledInput';

export default {
  name:       'ServerUrlModal',
  components: {
    Card, AsyncButton, LabeledInput
  },

  data() {
    return { url: '' };
  },

  mounted() {
    // this.$modal.show('settingUrl');
  },

  methods: {
    apply() {

    }
  }
};
</script>

<template>
  <modal
    class="server-url-modal"
    name="settingUrl"
    styles="background-color: var(--nav-bg); border-radius: var(--border-radius); max-height: 100vh;"
    width="400"
  >
    <Card>
      <h4 slot="title" class="text-default-text">
        Harvester Server URL
      </h4>

      <div slot="body" class="pl-10 pr-10">
        <p class="pr-10 pl-10">
          What URL should be used for this Harvester installation? All the nodes in your clusters will need to be able to reach this.
        </p>

        <hr />

        <LabeledInput v-model="url" label="URL">
          <template #prefix>
            <div class="prefix">
              https://
            </div>
          </template>
        </LabeledInput>
      </div>

      <div slot="actions">
        <AsyncButton
          mode="save"
          @click="apply"
        />
      </div>
    </Card>
  </modal>
</template>

<style lang="scss" scoped>
.prefix {
  padding: 17px 0px 0px 0px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  display: table-cell;
  width: 1%;
  white-space: nowrap;
  vertical-align: middle;
  color: var(--input-text);
}
.server-url-modal {
  p {
    font-size: 15px;
    line-height: 22px;
    display: block;
    text-indent: 1em;
  }
}
</style>

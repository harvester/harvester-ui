<script>
export default {
  name: 'Detail',

  props:      {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    let parseDefaultValue = {};

    try {
      parseDefaultValue = JSON.parse(this.value.value);
    } catch (error) {
      parseDefaultValue = JSON.parse(this.value.default);
    }

    return {
      type: 'VLAN',
      parseDefaultValue
    };
  },
};
</script>

<template>
  <div>
    <div class="row mb-15">
      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            Type
          </label>
          <div>
            {{ type }}
          </div>
        </div>
      </div>

      <div class="col span-4">
        <div class="labeled-input view">
          <label>
            Physical NIC
          </label>
          <div>
            {{ parseDefaultValue.NIC }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

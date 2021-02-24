<template>
  <label :class="classObject">
    <span v-if="shouldShowLabel" class="vue-switcher__label">
      <span v-if="label" v-text="label"></span>
      <span v-if="!label && value" v-text="textEnabled"></span>
      <span v-if="!label && !value" v-text="textDisabled"></span>
    </span>

    <input type="checkbox" :disabled="disabled" :checked="value" @change="trigger">

    <div></div>
  </label>
</template>

<script>
export default {
  name:  'Switches',
  props: {
    typeBold:     {
      type:    Boolean,
      default: true
    },
    value:    {
      type:    [Boolean, String, Number],
      default: false
    },
    disabled:     {
      type:    Boolean,
      default: false
    },
    label:        {
      type:    String,
      default: ''
    },
    textEnabled:  {
      type:    String,
      default: ''
    },
    textDisabled: {
      type:    String,
      default: ''
    },
    color:        {
      type:    String,
      default: 'green'
    },
    theme: {
      type:    String,
      default: 'default'
    },
    emitOnMount: {
      type:    Boolean,
      default: true
    }
  },
  computed: {
    classObject() {
      const {
        color, value, theme, typeBold, disabled
      } = this;

      return {
        'vue-switcher':                     true,
        'vue-switcher--unchecked':          !value,
        'vue-switcher--disabled':           disabled,
        'vue-switcher--bold':               typeBold,
        'vue-switcher--bold--unchecked':    typeBold && !value,
        [`vue-switcher-theme--${ theme }`]:  color,
        [`vue-switcher-color--${ color }`]:  color,
      };
    },
    shouldShowLabel() {
      return this.label !== '' || this.textEnabled !== '' || this.textDisabled !== '';
    }
  },
  mounted() {
    if (this.emitOnMount) {
      this.$emit('input', this.value);
    }
  },
  methods: {
    trigger(e) {
      this.$emit('input', e.target.checked);
    }
  }
};
</script>

<style lang="scss" scoped>

$color-default-default: #aaa;
$color-default-green: #139448;
$color-default-blue: #539bb9;
$color-default-red: #b95353;
$color-default-orange: #b97953;
$color-default-yellow: #bab353;

$theme-default-colors: (
    default : $color-default-default,
    blue    : $color-default-blue,
    red     : $color-default-red,
    yellow  : $color-default-yellow,
    orange  : $color-default-orange,
    green   : $color-default-green
);

.vue-switcher {
    position: relative;
    display: flex;

    &__label {
        display: block;
        font-size: 14px;
        margin-right: 5px;
    }

    input {
        opacity: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
        cursor: pointer;
    }

    div {
        height: 15px;
        width: 36px;
        position: relative;
        border-radius: 30px;
        display: -webkit-flex;
        display: -ms-flex;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        transition: linear .2s, background-color linear .2s;

        &:after {
            content: '';
            height: 20px;
            width: 20px;
            border-radius: 100px;
            display: block;
            transition: linear .15s, background-color linear .15s;
            position: absolute;
            left: 100%;
            margin-left: -18px;
            cursor: pointer;
            top: -3px;
            box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
        }
    }

    &--unchecked {
        div {
            justify-content: flex-end;

            &:after {
                left: 15px;
            }
        }
    }

    &--disabled {
        div {
            opacity: .3;
        }

        input {
            cursor: not-allowed;
        }
    }

    &--bold {
        div {
            top: -8px;
            height: 26px;
            width: 51px;

            &:after {
                margin-left: -24px;
                top: 3px;
            }
        }

        &--unchecked {
            div {
                &:after {
                    left: 28px;
                }
            }
        }

        .vue-switcher__label {
            span {
                padding-bottom: 7px;
                display: inline-block;
            }
        }
    }

    &-theme--default {
        @each $colorName, $color in $theme-default-colors {
            &.vue-switcher-color--#{$colorName} {

                div {
                    background-color: lighten($color, 5%);

                    &:after {
                      background-color: #fff;
                    }
                }

                &.vue-switcher--unchecked {
                    div {

                        background-color: red;

                        &:after {
                            background-color: #fff;
                        }
                    }
                }

            }
        }
    }
}

</style>

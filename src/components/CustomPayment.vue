<template>
  <div class="form" style="width: -webkit-fill-available;padding: 0;margin: 0;"
  >
    <SfSearchBar
      aria-label="Search"
      v-model="searchValue"
      placeholder="Buscar socio de negocio"
      class="form__element form__element--half"
    />
    <SfSelect
      v-model="currentBusinessPartners"
      class="form__element form__element--half"
      name="countries"
      label="Direcciones"
      style="padding-left: 20px;"
    >
      <SfSelectOption
        v-for="(address) in listAddress"
        :key="address.id"
        :value="address.id"
      >
        {{ address.address }}
      </SfSelectOption>
    </SfSelect>
    <br>
    {{ showListCustomer }}
    <br>
    <transition name="sf-collapse-bottom">
      <SfScrollable 
        v-if="showListCustomer"
        customStyle="89.899rem"
        style="width: 50%;background: #F1F2F3;border: 1px solid #8d8f9a;"
        showText="."
      >
        <SfList :style="{maxWidth: '100%', maxHeight: '300px'}">
          <SfListItem 
            v-for="item in listCustomer" 
            :key="item.id" 
            :style="{'--list-item-margin':'24px 0'}"
          >
            <SfButton
              class="sf-button--underlined"
              @click="onClick(item)"
            >
              {{ item.value + ' - ' + item.name }}
            </SfButton>
          </SfListItem>
        </SfList>
      </SfScrollable> 
    </transition>
  </div>
</template>

<script>
import {
  SfSelect,
  SfSearchBar,
  SfList,
  SfDropdown,
  SfButton,
  SfScrollable
} from '@storefront-ui/vue';

export default {
  name: 'CustomPayment',
  components: {
    SfSelect,
    SfSearchBar,
    SfList,
    SfDropdown,
    SfButton,
    SfScrollable
  },
  data () {
    return {
      searchValue: '',
      currentBusinessPartners: '',
      isOpen: true,
    }
  },
  computed: {
    iconCheck() {
      return this.iconSize || this.iconColor
        ? {
            size: this.iconSize,
            color: this.iconColor,
          }
        : null;
    },
    customerAddress: {
      get() {
        if (!this.$store.getters.getCustomerAddress) {
          return {
            id: 0
          }
        }
        return this.$store.getters.getCustomerAddress
      },
      set(value) {
        this.$store.commit('setCustomerAddress', value)
      }
    },
    showListCustomer() {
      if (this.searchValue.length >= 3 && this.searchValue !== this.currentBusinessPartners) {
        return true
      }
      return false
    },
    listAddress () {
      const address = this.$store.getters.getListAddress
      if (address.length <= 0) {
        return []
      }
      return address.map(customer => {
        return {
          code: customer.id,
          name: customer.city.name,
          address: customer.city.name + '/' + customer.region.name
        }
      })
    },
    listCustomer () {
      const list = this.$store.getters.getListBusinessPartners
      if (list.length <= 0) {
        return []
      }
      return list
    }
  },
  watch: {
    searchValue(value) {
      if(value.length >= 3) {
        this.$store.dispatch('listBusinessPartners', value)
      }
    }
  },
  created() {
    this.$store.dispatch('listBusinessPartners')
  },
  methods: {
    onClick(customer) {
      this.searchValue = customer.name
      this.currentBusinessPartners = customer.name
      this.$store.dispatch('listAddressCustomer', customer.value)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
.form {
  &__checkbox {
    --checkbox-label-color: var(--c-dark-variant);
    margin: 0 0 var(--spacer-sm) 0;
  }
  &__group {
    display: flex;
    align-items: center;
  }
  &__action {
    margin: var(--spacer-base) 0;
    &-button {
      &:first-child {
        --button-height: 4.0625rem;
      }
      &--secondary {
        margin: var(--spacer-base) 0;
      }
    }
  }
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: 0 var(--spacer-2xl) 0 var(--spacer-xs);
    &__element {
      padding: 0 0 var(--spacer-xs) 0;
      flex: 0 0 100%;
      &--half {
        flex: 1 1 50%;
        &-even {
          padding: 0 0 var(--spacer-xs) var(--spacer-xl);
        }
      }
      &--mini {
        flex: 1 1 1%;
      }
    }
    &__action {
      flex: 0 0 100%;
      display: flex;
    }
  }
}
.payment-method {
  --radio-container-align-items: center;
  --radio-container-padding: var(--spacer-sm) 0;
  --ratio-content-margin: 0 0 0 var(--spacer-lg);
  --radio-background: transparent;
  white-space: nowrap;
  @include for-desktop {
    --radio-container-padding: var(--spacer-sm);
  }
}
</style>
<style lang="scss">
.feedback {
  box-sizing: border-box;
  border: 1px solid var(--c-light);
  width: 100%;
  height: 25vh;
  padding: 0.5em;
  font-family: var(--font-family-primary);
  resize: vertical;
}
.sf-select__options {
  margin: 0;
  padding: 0;
  list-style-type: none;
  overflow: auto;
}
.container {
  max-height: 186px;
  overflow: auto;
  max-width: -webkit-fill-available;
}
.container::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

/* Cambiamos el fondo y agregamos una sombra cuando esté en hover */
.container::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
}

/* Cambiamos el fondo cuando esté en active */
.container::-webkit-scrollbar-thumb:active {
    background-color: #999999;
}
.sf-scrollable__content {
  max-height: var(--scrollable-max-height, var(--_scrollable-max-height, 15rem));
}
.form__element--half-even {
  padding: 0;
}
</style>

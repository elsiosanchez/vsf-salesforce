<template>
  <div v-if="load" class="checkout">
    <div class="checkout__main" style="padding: 0px">
      <SfHeading
        title="Orden"
        :level="3"
        class="sf-heading--left sf-heading--no-underline title"
        style="padding: 0px"
      />
      <SfTable class="sf-table--bordered table desktop-only">
        <SfTableHeading class="table__row">
          <SfTableHeader class="table__header table__image">
            {{ $t('Thumbnail') }}
          </SfTableHeader>
          <SfTableHeader
            v-for="tableHeader in tableHeaders"
            :key="tableHeader"
            class="table__header"
          >
            {{ tableHeader }}
          </SfTableHeader>
          <SfTableHeader class="table__action" />
        </SfTableHeading>
        <SfTableRow
          v-for="product in productsInCart"
          :key="product.id"
          class="table__row"
        >
          <SfTableData class="table__image">
            <SfImage :src="getThumbnailForProduct(product)" />
          </SfTableData>
          <SfTableData class="table__description">
            <div class="product-title">
              {{ product.name | htmlDecode }}
            </div>
            <div class="product-sku">
              {{ product.sku }}
            </div>
          </SfTableData>
          <SfTableData class="table__data">
            <div
              style="display: flex;"
            >
              <SfButton
                class="sf-button--underlined"
                :disabled="product.qty === 1 ? true : false"
                @click="changeQuantity(product, product.qty - 1)"
              >
                <SfIcon
                  icon="arrow_left" class="sf-arrow__icon" size="14px" view-box="0 0 24 12"
                />
              </SfButton>
              <span
                style="padding-top: 10px"
              >
                {{ product.qty }}
              </span>
              <SfButton
                class="sf-button--underlined"
                @click="changeQuantity(product, product.qty + 1)"
              >
                <SfIcon
                  icon="arrow_right" class="sf-arrow__icon" size="14px" view-box="0 0 24 12"
                />
              </SfButton>
            </div>
          </SfTableData>
          <SfTableData class="table__data">
            <SfPrice
              :regular="getProductRegularPrice(product)"
              :special="getProductSpecialPrice(product)"
              class="product-price"
            />
          </SfTableData>
          <SfTableData class="table__action">
            <SfIcon
              icon="cross"
              size="xxs"
              color="#BEBFC4"
              role="button"
              class="button"
              @click="removeProduct(product)"
            />
          </SfTableData>
        </SfTableRow>
      </SfTable>
      <div class="form" style="display: flex;">
        <SfCheckbox
          style="padding-right: 100px;padding-left: 20px;"
          v-model="formData.checked"
          name="payment-has-attachments"
          label="Datos De cliente Actual"
          @change="loadClient"
        />
      </div>
      <br>
      <SfButton
        :disabled="!formData.checked"
        @click="placeOrder"
      >
        {{ $t("Place the order") }}
      </SfButton>
    </div>
    <div class="checkout__aside desktop-only">
      <OOrderSummary class="checkout__aside-order" />
    </div>
  </div>
  <SfLoader v-else :loading="true" style="width: 236px; height: 366px; border: 1px solid #F2F2F2"/>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import OOrderSummary from 'theme/components/organisms/o-order-summary';
import { registerModule } from '@vue-storefront/core/lib/modules';
import { OrderModule } from '@vue-storefront/core/modules/order';
import {
  SfIcon,
  SfImage,
  SfPrice,
  SfTable,
  SfCheckbox,
  SfLoader,
  SfButton,
  SfHeading
} from '@storefront-ui/vue';
import { onlineHelper } from '@vue-storefront/core/helpers';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import { getProductPrice, getProductPriceFromTotals } from 'theme/helpers';
import store from '@vue-storefront/core/store'
// import OOrderReview from 'theme/components/organisms/o-order-review';
// import GmailAccount from './GmailAccount.vue'

export default {
  name: 'TakerOrder',
  components: {
    SfIcon,
    SfImage,
    SfPrice,
    SfTable,
    SfCheckbox,
    SfLoader,
    SfButton,
    SfHeading,
    // OOrderReview,
    // GmailAccount,
    OOrderSummary
  },
  data () {
    return {
      formData: {
        attachments: '',
        checked: false
      },
      tableHeaders: [
        this.$t('Description'),
        this.$t('Quantity'),
        this.$t('Price')
      ],
      order: {}
    }
  },
  computed: {
    ...mapGetters({
      productsInCart: 'cart/getCartItems',
      isVirtualCart: 'cart/isVirtualCart',
      shippingDetails: 'checkout/getShippingDetails',
      shippingMethods: 'checkout/getShippingMethods',
      paymentDetails: 'checkout/getPaymentDetails',
      paymentMethods: 'checkout/getPaymentMethods',
      personalDetails: 'checkout/getPersonalDetails'
    }),
    banks () {
      return store.getters['getBank']
    },
    shippingMethod () {
      const shippingMethod = this.shippingMethods.find(
        method => this.shippingDetails.shippingMethod === method.method_code
      );
      return shippingMethod ? shippingMethod.method_title : '';
    },
    paymentMethod () {
      const paymentMethod = this.paymentMethods.find(
        method => this.paymentDetails.paymentMethod === method.code
      );
      return paymentMethod ? paymentMethod.title : '';
    },
    personalDetails () {
      return store.getters['getPanelDetail']
    },
    shipping () {
      return store.getters['getShipping']
    },
    payment () {
      return store.getters['getPayment']
    },
    load () {
      if (this.productsInCart.length > 0) {
        return true
      }
      return false
    }
  },
  beforeCreate () {
    registerModule(OrderModule);
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    getThumbnailForProduct (product) {
      return getThumbnailForProduct(product);
    },
    getProductRegularPrice (product) {
      const price = product.original_price_incl_tax || product.price_incl_tax;
      return price ? this.$options.filters.price(price) : '';
    },
    getProductSpecialPrice (product) {
      const price = product.special_price ? product.price_incl_tax : false;
      return price ? this.$options.filters.price(price) : '';
    },
    getProductProperty (product, propertyName) {
      const property = product.options
        ? product.options.find(option => option.label === propertyName)
        : false;
      return property ? property.value : '';
    },
    removeProduct (product) {
      this.$store.dispatch('cart/removeItem', { product });
    },
    getThumbnailForProductExtend (product) {
      return getThumbnailForProduct(product);
    },
    getProductPrice (product) {
      return onlineHelper.isOnline && product.totals && product.totals.options
        ? getProductPriceFromTotals(product)
        : getProductPrice(product);
    },
    getProductOptions (product) {
      return onlineHelper.isOnline && product.totals && product.totals.options
        ? product.totals.options
        : product.options || {};
    },
    removeHandler (product) {
      this.$store.dispatch('cart/removeItem', { product: product });
    },
    changeQuantity (product, newQuantity) {
      this.$store.dispatch('cart/updateQuantity', {
        product: product,
        qty: newQuantity
      });
    },
    prepareOrder () {
      this.order = {
        user_id: this.$store.state.user.current ? this.$store.state.user.current.id.toString() : '',
        cart_id: this.$store.state.cart.cartServerToken ? this.$store.state.cart.cartServerToken.toString() : '',
        products: this.$store.state.cart.cartItems,
        addressInformation: {
          billingAddress: {
            ...this.payment
          },
          shipping_method_code: this.shippingMethod.method_code ? this.shippingMethod.method_code : this.shipping.shippingMethod,
          shipping_carrier_code: this.shippingMethod.carrier_code ? this.shippingMethod.carrier_code : this.shipping.shippingCarrier,
          payment_method_code: this.payment.paymentMethod,
          payment_method_additional: {},
          shippingExtraFields: this.shipping.extraFields
        }
      }
      return this.order
    },
    placeOrder () {
      if (true) {
        this.$store.dispatch('checkout/placeOrder', { order: this.prepareOrder() })
      } else {
        this.notifyNotAvailable()
      }
    },
    savePersonalDetails () {
      this.$store.dispatch('checkout/savePersonalDetails', this.personalDetails)
    },
    saveShippingDetails () {
      this.$store.dispatch('checkout/saveShippingDetails', this.shipping)
    },
    savePaymentDetails () {
      this.$store.dispatch('checkout/savePaymentDetails', this.payment)
    },
    clearDataClient() {
      this.$store.dispatch('checkout/savePaymentDetails', {})
      this.$store.dispatch('checkout/saveShippingDetails', {})
      this.$store.dispatch('checkout/savePersonalDetails', {})
    },
    loadClient() {
      if (this.formData.checked) {
        this.savePersonalDetails()
        this.saveShippingDetails()
        this.savePaymentDetails()
      } else {
        this.clearDataClient()
      }
    }
  },
  mounted () {
    this.isMicrocartVisible = true;
    store.dispatch('setListBanck')
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#checkout {
  box-sizing: border-box;
  @include for-desktop {
    padding: 0 var(--spacer-sm);
    max-width: 1272px;
    margin: 0 auto;
  }
}
.checkout {
  --steps-content-padding: 0 var(--spacer-sm);
  @include for-desktop {
    --steps-content-padding: 0;
    display: flex;
  }
  &__main {
    @include for-desktop {
      flex: 1;
    }
  }
  &__aside {
    @include for-desktop {
      flex: 0 0 26.8125rem;
      margin: 0 0 0 var(--spacer-xl);
    }
    &-order {
      box-sizing: border-box;
      width: 100%;
      box-shadow: 0px 4px 11px rgba(var(--c-dark-base), 0.1);
      background: var(--c-light);
      padding: var(--spacer-xl) calc(var(--spacer-lg) * 2);
    }
  }
}
</style>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.title {
  --heading-padding: var(--spacer-base) 0;
  @include for-desktop {
    --heading-title-font-size: var(--h3-font-size);
    --heading-padding: var(--spacer-2xl) 0 var(--spacer-base) 0;
  }
}
.table {
  margin: 0 0 var(--spacer-base) 0;
  &__row {
    justify-content: space-between;
    align-items: center;
  }
  @include for-desktop {
    &__header {
      text-align: center;
      &:last-child {
        text-align: right;
      }
    }
    &__data {
      text-align: center;
    }
    &__description {
      text-align: left;
      flex: 0 0 12rem;
    }
    &__image {
      --image-width: 5.125rem;
      text-align: left;
      margin: 0 var(--spacer-xl) 0 0;
    }
    &__price {
      text-align: right;
    }
    &__action {
      display: flex;
      justify-content: right;
    }
  }
}
.product-price {
  text-align: right;
  display: flex;
  flex-direction: column;
}
.totals {
  display: flex;
  justify-content: space-between;
  &__element {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex: 0 0 18.75rem;
  }
  &__terms {
    &--link {
      margin: 0 0 0 0.4em;
    }
  }
}
.product-sku {
  color: var(--c-text-muted);
}
.button {
  cursor: pointer;
}
.property {
  margin: 0 0 var(--spacer-base) 0;
  --property-value-font-weight: var(--font-semibold);
  --property-value-font-size: var(--font-base);
  @include for-desktop {
    margin: 0 0 var(--spacer-sm) 0;
    &__total {
      padding: var(--spacer-base) 0 0 0;
    }
  }
}
.divider {
  --divider-border-color: var(--c-white);
  --divider-width: 100%;
  --divider-margin: 0 0 var(--spacer-base) 0;
}
.characteristics {
  padding: var(--spacer-sm);
  &__item {
    margin: var(--spacer-base) 0;
  }
}
.summary,
.accordion {
  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  margin-left: -50vw;
  margin-right: -50vw;
}
.accordion {
  --accordion-item-content-padding: 0;
  --collected-product-padding: 0;
  --collected-product-image-background: var(--c-white);
  --heading-padding: 0;
  &__item {
    position: relative;
  }
  &__content {
    flex: 1;
    padding: var(--spacer-sm);
  }
  &__edit {
    flex: unset;
    position: absolute;
    right: var(--spacer-base);
    top: var(--spacer-base);
  }
}
.collected-product {
  padding: var(--spacer-sm) 0;
  &:not(:last-of-type) {
    border: 1px solid var(--_c-light-primary);
    border-width: 0 0 1px 0;
  }
}
.summary {
  background: var(--c-light);
  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacer-base) var(--spacer-lg);
  }
  &__title {
    margin: 0 0 var(--spacer-xs) 0;
  }
  &__terms {
    margin: var(--spacer-xs) 0;
    &--link {
      margin: 0 0 0 0.4em;
    }
  }
  &__total {
    width: 100%;
  }
}
.content {
  margin: 0 0 var(--spacer-base) 0;
  color: var(--c-text);
  &__label {
    font-weight: 400;
  }
}
.actions {
  margin: var(--spacer-base) 0;
  &__button {
    &:first-child {
      --button-height: 4.0625rem;
    }
    &--secondary {
      margin: var(--spacer-base) 0;
    }
  }
  @include for-desktop {
    display: flex;
  }
}
a {
  color: var(--c-text);
  &:hover {
    color: var(--c-primary);
  }
}
.no-flex {
  flex: unset;
}
.promo-code {
  &.mobile-only {
    max-width: 100%;
    width: 20rem;
  }
}
</style>

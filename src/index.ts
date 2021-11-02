import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { customPaymentStore } from './store'
import { loadData } from './clint'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import Payment from './components/Payment.vue'
import Vue from 'vue';

export const CustomCheckoutModule: StorefrontModule = function ({ store, router }) {
  let correctPaymentMethod = false
  const placeOrder = () => {
    if (correctPaymentMethod) {
      let payload = store.getters['getOtherPaymentDetails']
      EventBus.$emit('checkout-do-placeOrder', payload)
    }
  }
  EventBus.$on('checkout-before-placeOrder', placeOrder)
  store.registerModule('customPayment', customPaymentStore)
  store.registerModule('TakerOrder', loadData)

  EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
    let methods = store.getters['checkout/getPaymentMethods']
    if (methods) {
      let method = methods.find(item => (item.code === paymentMethodCode))
      if (method && method.code === 'ACH') {
        correctPaymentMethod = true
        const Component = Vue.extend(Payment)
        const componentInstance = (new Component())
        componentInstance.$mount('#info-payment')
      }
    }
  })
}

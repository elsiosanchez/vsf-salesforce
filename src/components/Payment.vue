<template>
  <div class="form">
    <SfTable v-show="this.paymentsAll.length > 0">
      <SfTableHeading>
        <SfTableHeader v-for="(header, key) in tableHeaders" :key="key">
          {{ header }}
        </SfTableHeader>
        <SfTableHeader>
          <SfButton class="sf-button--text">
            Eliminar
          </SfButton>
        </SfTableHeader>
      </SfTableHeading>
      <SfTableRow v-for="(row, key) in tableData" :key="key">
        <SfTableData v-for="(data, index) in row" :key="index">
          {{ data }}
        </SfTableData>
        <SfTableData>
          <SfButton class="sf-button--text" @click="deletePayment(key)">
            <SfIcon
              icon="cross" class="sf-arrow__icon" size="lg" view-box="0 0 24 24"
            />
          </SfButton>
        </SfTableData>
      </SfTableRow>
    </SfTable>
    <div class="form">
      <SfSelect
        v-model.trim="currency"
        class="form__element form__element--half form__element--half-even form__select sf-select--underlined"
        label="Moneda"
      >
        <SfSelectOption
          v-for="(currency, key) in listCurrencies"
          :key="key"
          :value="currency.currency_code"
        >
          {{ currency.description }}
        </SfSelectOption>
      </SfSelect>
      <SfSelect
        v-model.trim="bank_id"
        class="form__element form__element--half form__element--half-even form__select sf-select--underlined"
        name="countries"
        label="Banco"
      >
        <SfSelectOption
          v-for="(bank, key) in banks"
          :key="key"
          :value="bank.id"
        >
          {{ bank.name }}
        </SfSelectOption>
      </SfSelect>
      <SfInput
        v-model.trim="amount"
        type="number"
        class="form__element form__element--half"
        name="amount"
        label="Monto"
        :disabled="!formData.differentBanks"
      />
      <SfInput
        v-model.trim="reference_no"
        type="text"
        class="form__element form__element--half"
        name="Referencia"
        label="Referencia"
      />
      <SfCheckbox
        v-model.trim="formData.differentBanks"
        class="form__element form__element--half form__element--half-even"
        label="Pay with different banks"
      />
      <br>
      <SfInput
        v-model.trim="description"
        type="text"
        class="form__element form__element--half"
        label="Description"
      />
      <br>
      <SfCheckbox
        v-model.trim="formData.checked"
        name="payment-has-attachments"
        class="form__element form__element--half"
        label="Agregar Imagen de Comprobante?"
      />
      <br>
      <SfInput
        v-show="formData.checked"
        v-if="!isLoaded && formData.checked"
        v-model.trim="formData.attachments"
        class="form__element upload-input"
        name="payment-attachments"
        type="file"
        @change.native="getImage"
      />
      <SfImage
        v-else
        :src="formData.attachments"
      />
    </div>
    <SfButton
      @click="addPayment"
    >
      Agregar
    </SfButton>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SfInput, SfSelect, SfHeading, SfTable, SfImage, SfCheckbox, SfButton, SfIcon } from '@storefront-ui/vue'
import store from '@vue-storefront/core/store'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export default {
  name: 'CustomPayment',
  components: {
    SfInput,
    SfHeading,
    SfImage,
    SfSelect,
    SfCheckbox,
    SfButton,
    SfTable,
    SfIcon
  },
  computed: {
    ...mapGetters({
      totals: 'cart/getTotals',
      paymentsAll: 'checkout/getAddPaymentMethodAdditional',
      shippingDetails: 'checkout/getShippingDetails',
    }),
    banks () {
      return store.getters['getBank']
    },
    listCurrencies() {
      return store.getters['getListCurrencies']
    },
    getAddPaymentSkd() {
      return store.getters['getAddPaymentSkd']
    },
    grandTotal () {
      return store.getters['cart/getTotals'].find(item => item.code === 'grand_total').value
    },
    currencyCode () {
      const { i18n = config.i18n } = currentStoreView();
      return `${i18n.currencyCode}`;
    },
    tableData() {
      if (this.paymentsAll.length > 0) {
        return this.paymentsAll.map(data => {
          return {
            reference_no: data.reference_no,
            payment_date: data.payment_date,
            bank_id: data.bank_id,
            amount: data.amount
          }
        })
      }
      return []
    }
  },
  data () {
    return {
      bank_id: '',
      reference_no: '',
      description: '',
      amount: 0,
      payment_date: {},
      payment_method_code: 'ACH',
      billing_address: this.billing_address,
      currency: '',
      formData: {
        attachments: '',
        description: '',
        checked: false,
        differentBanks: false
      },
      message: 'Agregar: Nombre, Cédula, Referencia y Nro. de Contacto',
      tableHeaders: [
        "reference_no",
        "date",
        "Banck",
        "Amount",
      ],
      isLoaded: false,
      pay: []
    }
  },
  methods: {
    setData () {
      store.dispatch('setDetails', {
        description: this.formData.description,
        attachments: this.formData.attachments
      })
    },
    getImage (event) {
      const file = event.path[0].files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = e => {
        this.formData.attachments = e.target.result
        this.setData()
        this.isLoaded = true
      }
    },
    addPayment() {
      this.pay = this.tableData
      const addPay = {
        bank_id: this.bank_id,
        reference_no: this.reference_no,
        amount: this.amount,
        description: this.description,
        payment_date: this.payment_date,
        payment_method_code: this.payment_method_code,
        billing_address: this.billing_address,
        currency: this.currency
      }
      this.pay.push(addPay)
      store.dispatch('checkout/saveAddPaymentMethodAdditional', this.pay)
    },
    deletePayment(key) {
      const deletePay = this.tableData
      deletePay.splice(key, 1)
      store.dispatch('checkout/saveAddPaymentMethodAdditional', deletePay)
    }
  },
  created () {
    this.amount = this.grandTotal
    this.currency = this.currencyCode
    this.payment_date = new Date()
    store.dispatch('setListBanck')
    store.dispatch('setListCurrencies')
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
</style>

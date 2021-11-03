import { listAddressBusinessPartners, generateBusinessPartners } from './listBanks.js'
export const customPaymentStore = {
  state: {
    listAddress: [],
    listBusinessPartners: {},
    otherPaymentDetails: {},
    currentCustomerAddress: {}
  },
  mutations: {
    setTransferDetails: (state, payload) => {
      state.otherPaymentDetails = payload
    },
    setListAddress: (state, payload) => {
      state.listAddress = payload
    },
    setListBusinessPartners: (state, list) => {
      state.listBusinessPartners = list
    },
    setCustomerAddress: (state, address) => {
      state.currentCustomerAddress = address
    }
  },
  actions: {
    setDetails ({ commit }, transferDetails) {
      commit('setTransferDetails', transferDetails)
    },
    listAddressCustomer ({ commit }, searchValue) {
      return listAddressBusinessPartners(searchValue)
        .then(response => {
          commit('setListAddress', response.addresses)
          return response
        })
        .catch(error => {
          console.warn(`Error getting banks: ${error.message}. Code: ${error.code}.`)
        })
    },
    listBusinessPartners ({ commit }, searchValue) {
      return generateBusinessPartners(searchValue)
        .then(response => {
          commit('setListBusinessPartners', response.records)
          return response.records
        })
        .catch(error => {
          console.warn(`Error getting banks: ${error.message}. Code: ${error.code}.`)
        })
    }
  },
  getters: {
    getListAddress: (state) => {
      return state.listAddress
    },
    getCustomerAddress: (state) => {
      return state.currentCustomerAddress
    },
    getListBusinessPartners: (state) => {
      return state.listBusinessPartners
    },
    getOtherPaymentDetail: (state) => {
      return state.otherPaymentDetails
    }
  }
}

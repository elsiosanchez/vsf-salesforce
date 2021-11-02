import { generateListBank, generateListCurrencies } from './listBanks.js'
// import { generateListCurrencies } from './listBanks.js'
export const customPaymentStore = {
  state: {
    listBanks: {},
    listCurrencies: {},
    otherPaymentDetails: {}
  },
  mutations: {
    setTransferDetails: (state, payload) => {
      state.otherPaymentDetails = payload
    },
    listBanks: (state, payload) => {
      state.listBanks = payload
    },
    listCurrencies: (state, payload) => {
      state.listCurrencies = payload
    }
  },
  actions: {
    setDetails ({ commit }, transferDetails) {
      commit('setTransferDetails', transferDetails)
    },
    setListBanck ({ commit }) {
      return generateListBank()
        .then(response => {
          commit('listBanks', response.banks)
          return response
        })
        .catch(error => {
          console.warn(`Error getting banks: ${error.message}. Code: ${error.code}.`)
        })
    },
    setListCurrencies ({ commit }) {
      return generateListCurrencies()
        .then(response => {
          commit('listCurrencies', response.currencies)
          return response
        })
        .catch(error => {
          console.warn(`Error getting list currencies: ${error.message}. Code: ${error.code}.`)
        })
    }
  },
  getters: {
    getBank: (state) => {
      return state.listBanks
    },
    getListCurrencies: (state) => {
      return state.listCurrencies
    },
    getOtherPaymentDetail: (state) => {
      return state.otherPaymentDetails
    }
  }
}

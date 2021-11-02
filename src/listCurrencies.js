import {
  ApiRest as requestRest,
  evaluateResponse
} from './api/index.js'
export function generateListCurrencies () {
  return requestRest({
    url: '/list-currencies',
    method: 'post',
    data: {
      table_name: 'C_Bank'
    },
    params: {
      token: 'ae9cf607-d591-4094-9379-e04a2d48695b'
    }
  })
    .then(evaluateResponse)
    .then(response => {
      return {
        recordCount: response.record_count,
        currencies: response.currencies,
        nextPageToken: response.next_page_token
      }
    })
}

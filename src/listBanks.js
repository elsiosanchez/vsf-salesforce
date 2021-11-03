import {
  ApiRest as requestRest,
  evaluateResponse
} from './api/index.js'
import config from 'config'

export function listAddressBusinessPartners (searchValue) {
  return requestRest({
    endPoint: config.shipping.sales_force.endpoint,
    url: 'customer',
    method: 'get',
    params: {
      search_value: searchValue,
      token: '2071434c-8425-4f7f-ac12-bb94f1f174e1'
    }
  })
    .then(evaluateResponse)
    .then(response => {
      return response
    })
}
export function generateBusinessPartners (searchValue) {
  return requestRest({
    url: 'business-partners',
    endPoint: config.shipping.sales_force.list_business_partners,
    method: 'get',
    params: {
      search_value: searchValue,
      token: '2071434c-8425-4f7f-ac12-bb94f1f174e1'
    }
  })
    .then(evaluateResponse)
    .then(response => {
      return response
    })
}

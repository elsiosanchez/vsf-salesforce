import config from 'config'
const axios = require('axios').default

/**
* Instance for connection to API RESTful with axios
* @author Elsio15 <elsiosanches@gmial.com>
* @param {string} url to resource request
* @param {string} method rest, 'get' and 'post' (as default)
* @param {object} data body to send post request
* @param {object} params to send get uri
* @param {string} responseType default is 'json'
* @returns {function}
*/

export function ApiRest ({
  url = '',
  method = 'post',
  data = {},
  params = {},
  responseType = 'json',
  endPoint
}) {
  const setInterceptor = (request) => {
    request.interceptors.response.use(response => {
      return response.data
    }, error => {
      return Promise.reject(error)
    })
    return request.interceptors
  }
  const baseURL = endPoint
  const request = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    responseType
  })
  request.interceptors = setInterceptor(request)

  return request({
    url,
    method,
    data,
    params
  })
}

/**
* Evaluate the response if is a success or error
* @author Elsio15 <elsiosanches@gmial.com>
* @param {object} response
* @returns {mixed}
*/
export const evaluateResponse = (response) => {
  if (response.code >= 400) {
    const error = {
      code: response.code,
      message: response.result
    }
    throw error
  }

  return response.result
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { add, find } from './mongo'

const URL_BASE = 'https://veiculos.fipe.org.br/api/veiculos/'
const dataTable = process.env.FIPE_TABLE || 295 // Março/2023;
const dataTableUpdate = new Date('2023-03')
const cacheEnabled = Boolean(process.env.CACHE_ENABLED === 'true') || false
const DEBUG = Boolean(process.env.DEBUG === 'true' || false) || false

export function getTypes(vehicleType: any) {
  let ret
  if (vehicleType) {
    ret = vehicleType == 1 ? 'carros' : vehicleType == 2 ? 'motos' : 'caminhões'
  } else {
    ret = {
      success: true,
      data: [
        { Value: 1, Label: 'carros' },
        { Value: 2, Label: 'motos' },
        { Value: 3, Label: 'caminhões' },
      ],
    }
  }
  return ret
}
// Get brands
export async function getBrands(vehicleType: any) {
  // Define table name
  const tableName = 'brands'

  try {
    // Check paramenters
    if (!vehicleType) {
      const ret = { success: false, error: 'Vehicle type is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }

    // Payload
    const payload = {
      codigoTabelaReferencia: dataTable,
      codigoTipoVeiculo: vehicleType,
    }

    // Data and dataCached
    let dataCached: Array<any> = [],
      data: any = {}

    if (cacheEnabled) {
      // Cache enabled - Try to find data in database
      if (DEBUG) console.log('Cache enabled')
      dataCached = await find(tableName, payload)
    } else {
      // Cache disabled
      if (DEBUG) console.log('Cache disabled')
    }

    if (dataCached && dataCached?.length > 0 && cacheEnabled) {
      // Return data from local database
      data = dataCached
    } else {
      // Return data from FIPE API
      // Post request using axios with error handling
      const resp = await axios.post(URL_BASE + 'ConsultarMarcas', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      data = resp.data

      // If cache enabled, save data in database
      if (data.length > 0) {
        // Save data in database
        // Add payload properties to array data
        data.forEach(function (element: any) {
          Object.assign(element, { ...payload, updatedAt: new Date() })
        })
        if (cacheEnabled) await add(tableName, data)
      }
    }
    // Return data
    const ret = {
      success: true,
      updatedAt: dataTableUpdate,
      type: vehicleType,
      type_label: getTypes(vehicleType),
      data,
    }
    return ret
  } catch (error) {
    const ret = { success: false, error }
    return ret
  }
}
// Get models
export async function getModels(vehicleType: any, brandCode: any) {
  // Define table name
  const tableName = 'models'

  try {
    // Check paramenters
    if (!vehicleType) {
      const ret = { success: false, error: 'Vehicle type is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!brandCode) {
      const ret = { success: false, error: 'Brand code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }

    // Payload
    const payload = {
      codigoTabelaReferencia: dataTable,
      codigoTipoVeiculo: vehicleType,
      codigoMarca: brandCode,
    }

    // Data and dataCached
    let dataCached: Array<any> = [],
      data: any = {}

    if (cacheEnabled) {
      // Cache enabled - Try to find data in database
      if (DEBUG) console.log('Cache enabled')
      dataCached = await find(tableName, payload)
    } else {
      // Cache disabled
      if (DEBUG) console.log('Cache disabled')
    }

    if (dataCached?.length > 0 && cacheEnabled) {
      // Return data from local database
      if (DEBUG) console.log('Data returned from local database.')
      data.Modelos = dataCached
    } else {
      // Return data from FIPE API
      // Post request using axios with error handling
      const resp = await axios.post(URL_BASE + 'ConsultarModelos', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      data = resp.data

      // If cache enabled, save data in database
      if (data?.Modelos?.length > 0) {
        // Save data in database
        // Add payload properties to array data
        data?.Modelos.forEach(function (element: any) {
          Object.assign(element, { ...payload, updatedAt: new Date() })
        })
        // Cache on DB
        if (cacheEnabled) await add(tableName, data?.Modelos)
      }
    }

    // Return data
    const ret = {
      success: true,
      updatedAt: dataTableUpdate,
      type: vehicleType,
      type_label: getTypes(vehicleType),
      brand: brandCode,
      data: data?.Modelos || [],
    }
    return ret
  } catch (error) {
    const ret = { success: false, error }
    if (DEBUG) console.log(ret)
    return ret
  }
}
// Get years
export async function getYears(
  vehicleType: any,
  brandCode: any,
  modelCode: any,
) {
  // Define table name
  const tableName = 'years'

  try {
    // Check paramenters
    if (!vehicleType) {
      const ret = { success: false, error: 'Vehicle type is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!brandCode) {
      const ret = { success: false, error: 'Brand code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!modelCode) {
      const ret = { success: false, error: 'Model code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }

    // Payload
    const payload = {
      codigoTabelaReferencia: dataTable,
      codigoTipoVeiculo: vehicleType,
      codigoMarca: brandCode,
      codigoModelo: modelCode,
    }

    // Data and dataCached
    let dataCached: Array<any> = [],
      data: any = {}

    if (cacheEnabled) {
      // Cache enabled - Try to find data in database
      if (DEBUG) console.log('Cache enabled')
      dataCached = await find(tableName, payload)
    } else {
      // Cache disabled
      if (DEBUG) console.log('Cache disabled')
    }

    if (dataCached?.length > 0 && cacheEnabled) {
      // Return data from local database
      if (DEBUG) console.log('Data returned from local database.')
      data = dataCached
    } else {
      // Return data from FIPE API
      // Post request using axios with error handling
      const resp = await axios.post(URL_BASE + 'ConsultarAnoModelo', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      data = resp.data

      // If cache enabled, save data in database
      if (data?.length > 0) {
        // Save data in database
        // Add payload properties to array data
        data.forEach(function (element: any) {
          Object.assign(element, { ...payload, updatedAt: new Date() })
        })
        // Cache on DB
        if (cacheEnabled) await add(tableName, data)
      }
    }

    // Return data
    const ret = {
      success: true,
      updatedAt: dataTableUpdate,
      type: vehicleType,
      type_label: getTypes(vehicleType),
      brand: brandCode,
      model: modelCode,
      data,
    }
    return ret
  } catch (error) {
    const ret = { success: false, error }
    if (DEBUG) console.log(ret)
    return ret
  }
}
// Get details
export async function getDetails(
  vehicleType: any,
  brandCode: any,
  modelCode: any,
  yearCode: any,
  typeGas: any = 1,
  typeSearch: any = 'tradicional',
) {
  // Define table name
  const tableName = 'details'

  try {
    // Check paramenters
    if (!vehicleType) {
      const ret = { success: false, error: 'Vehicle type is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!brandCode) {
      const ret = { success: false, error: 'Brand code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!modelCode) {
      const ret = { success: false, error: 'Model code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }
    if (!yearCode) {
      const ret = { success: false, error: 'Year code is required!' }
      if (DEBUG) console.log(ret)
      return ret
    }

    // Payload
    const payload = {
      codigoTabelaReferencia: dataTable,
      codigoTipoVeiculo: vehicleType,
      codigoMarca: brandCode,
      codigoModelo: modelCode,
      anoModelo: yearCode,
      codigoTipoCombustivel: typeGas || 1,
      tipoConsulta: typeSearch || 'tradicional',
    }

    // Data and dataCached
    let dataCached: Array<any> = [],
      data: any = {}

    if (cacheEnabled) {
      // Cache enabled - Try to find data in database
      if (DEBUG) console.log('Cache enabled')
      dataCached = await find(tableName, payload)
    } else {
      // Cache disabled
      if (DEBUG) console.log('Cache disabled')
    }

    if (dataCached?.length > 0 && cacheEnabled) {
      // Return data from local database
      if (DEBUG) console.log('Data returned from local database.')
      data = dataCached
    } else {
      // Return data from FIPE API
      // Post request using axios with error handling
      const resp = await axios.post(
        URL_BASE + 'ConsultarValorComTodosParametros',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      data = resp.data

      // If cache enabled, save data in database
      if (data) {
        // Save data in database
        // Add payload properties to array data
        Object.assign(data, { ...payload, updatedAt: new Date() })
        // Cache on DB
        if (cacheEnabled) await add(tableName, [data])
      }
    }

    // Return data
    const ret = {
      success: true,
      updatedAt: dataTableUpdate,
      type: vehicleType,
      type_label: getTypes(vehicleType),
      brand: brandCode,
      model: modelCode,
      year: yearCode,
      data,
    }
    return ret
  } catch (error) {
    const ret = { success: false, error }
    if (DEBUG) console.log(ret)
    return ret
  }
}

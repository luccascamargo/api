import { Request, Response } from 'express'
import {
  getBrands,
  getDetails,
  getModels,
  getTypes,
  getYears,
} from '../utils/fipe'

export class FipeController {
  async types(req: Request, res: Response) {
    // Paramenter
    const vehicleType = req.query.vehicleType || 0
    // Return
    res.json(getTypes(vehicleType))
  }
  // API brands
  async brands(req: Request, res: Response) {
    // Paramenter
    const vehicleType = req.params.type || 0
    // Return
    await getBrands(vehicleType).then((ret) => res.json(ret))
  }
  // API models
  async models(req: Request, res: Response) {
    // Paramenter
    const vehicleType = req.params.type || 0
    const brandCode = req.params.brand || 0
    // Return
    await getModels(vehicleType, brandCode).then((ret) => res.json(ret))
  }
  // API years
  async years(req: Request, res: Response) {
    // Paramenter
    const vehicleType = req.params.type || 0
    const brandCode = req.params.brand || 0
    const modelCode = req.params.model || 0
    // Return
    await getYears(vehicleType, brandCode, modelCode).then((ret) =>
      res.json(ret),
    )
  }
  // API details
  async details(req: Request, res: Response) {
    // Paramenter
    const vehicleType = req.params.type || 0
    const brandCode = req.params.brand || 0
    const modelCode = req.params.model || 0
    const yearCode = req.params.year || 0
    const typeGas = req.query.typeGas || 1
    const typeSearch = req.query.typeSearch || ''
    // Return
    await getDetails(
      vehicleType,
      brandCode,
      modelCode,
      yearCode,
      typeGas,
      typeSearch,
    ).then((ret) => res.json(ret))
  }
}

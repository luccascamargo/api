import { NextFunction, Request, Response } from 'express'
import axios from 'axios'

export async function getCep(req: Request, res: Response, next: NextFunction) {
  try {
    const { cep } = req.body
    const result = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`)

    req.body.estado = result.data.state
    req.body.cidade = result.data.city

    next()
  } catch (err) {
    console.log(err)
    return res.status(404).json({ message: 'Há algum problema com o seu cep' })
  }
}

import { NextFunction, Request, Response } from 'express'
import axios from 'axios'

export async function getCep(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body
    const { data: dataBr } = await axios.get(
      `https://viacep.com.br/ws/${data.cep}/json/`,
    )

    req.body.estado = dataBr.uf
    req.body.cidade = dataBr.localidade

    next()
  } catch (err) {
    console.log(err)
    return res.status(404).json({ message: 'Há algum problema com o seu cep' })
  }
}

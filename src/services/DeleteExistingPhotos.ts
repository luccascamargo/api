import { deleteFiles } from '../middlewares/cloudS3'

interface iPhotos {
  key: string
}

interface iArrayKey {
  Key: string
}

export async function DeleteExistingPhotos(images: iPhotos[]) {
  const arrayPhotos: iArrayKey[] = []

  try {
    if (images.length < 0) {
      throw new Error('Lista de imagens vazia')
    }

    images.map((photo) => {
      arrayPhotos.push({
        Key: photo.key,
      })
    })

    const params = {
      Bucket: process.env.BUCKET || '',
      Delete: {
        Objects: arrayPhotos,
      },
    }

    const { success } = await deleteFiles({
      Bucket: params.Bucket,
      Delete: params.Delete,
    })

    if (!success) {
      throw new Error('Erro ao deletar imagens do S3')
    }
  } catch (error) {
    console.log(error)
  }
}

import { deleteFiles } from '../middlewares/cloudS3'

interface iPhotos {
  key: string | null
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
        Key: photo.key!,
      })
    })

    const { success } = await deleteFiles(arrayPhotos)

    if (!success) {
      throw new Error('Erro ao deletar imagens do S3')
    }
  } catch (error) {
    console.log(error)
  }
}

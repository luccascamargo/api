import {
  DeleteObjectsRequest,
  S3Client,
  DeleteObjectsCommand,
  ObjectIdentifier,
} from '@aws-sdk/client-s3'

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
})

export const deleteFiles = async (object: ObjectIdentifier[] | undefined) => {
  try {
    const input: DeleteObjectsRequest = {
      Bucket: process.env.BUCKET,
      Delete: {
        Objects: object,
      },
    }
    const commands = new DeleteObjectsCommand(input)
    await client.send(commands)
    return { success: true, data: 'Arquivos deletados com sucesso' }
  } catch (error) {
    console.log(error)
    return { success: false, data: { message: 'Falha na exclusão' } }
  }
}

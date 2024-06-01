/* eslint-disable @typescript-eslint/no-explicit-any */
// USE THIS FILE TO CONNECT TO YOUR DATABASE AND SAVE DATA ( MONGODB )

import { MongoClient } from 'mongodb'

// Configs
const dbURI = process.env.DB_URI || ''
const dbName = process.env.DB_NAME || ''
const DEBUG = Boolean(process.env.DEBUG === 'true' || false) || false

const client = new MongoClient(dbURI)

// Add
export async function add(collectionName: string, data: any) {
  // Return
  if (!collectionName || !data) return false

  try {
    // select the database
    await client.connect()
    const db = client.db(dbName)
    // select the collection
    const collection = db.collection(collectionName)

    try {
      // Insert data
      await collection.insertMany(JSON.parse(JSON.stringify(data)), {
        ordered: true,
      })
    } catch (error) {
      if (DEBUG) console.warn(new Date(), 'DB save data error', error)
    }
    // Closed DB
    await client.close()
  } catch (error) {
    if (DEBUG) console.warn(new Date(), 'Erro de conexao com o mongo', error)
  }
}
// Drop
export async function drop(collectionName: string) {
  // Return
  if (!collectionName) return false

  try {
    // create a new MongoDB client
    // select the database
    await client.connect()
    const db = client.db(dbName)
    // select the collection
    const collection = db.collection(collectionName)
    try {
      // Insert data
      await collection.drop()
    } catch (error) {
      if (DEBUG) console.warn(new Date(), 'DB drop data error', error)
    }
    // Closed DB
    await client.close()
  } catch (error) {
    if (DEBUG) console.warn(new Date(), 'DB connection error', error)
  }
}
// Find
export async function find(collectionName: string, query: any) {
  // Return
  if (!collectionName) return false

  try {
    // create a new MongoDB client
    // select the database
    await client.connect()
    const db = client.db(dbName)
    // select the collection
    const collection = db.collection(collectionName)
    try {
      // Select data
      const ret = await collection.find(query).toArray()

      // Remove _id from array to uniformize data
      if (ret.length > 0) {
        ret.forEach((item: any) => {
          delete item._id
        })
      }

      return ret
    } catch (error) {
      if (DEBUG) console.warn(new Date(), 'DB select data error', error)
    }
    // Closed DB
    await client.close()
  } catch (error) {
    if (DEBUG) console.warn(new Date(), 'DB connection error', error)
  }
}

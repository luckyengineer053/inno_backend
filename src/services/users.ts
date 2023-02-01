import { Users, IUsers } from '../models/users'

const findOneByID = async (_id: any) => {
  const result: IUsers = await Users.findOne({
    _id: _id
  })
  return result
}

const findByFilter = async (filter: any) => {
  const total = await Users.count({
    $or: [
      { uri: { $regex: `.*${filter.searchValue}.*` } },
      { imageUrl: { $regex: `.*${filter.searchValue}.*` } }
    ]
  })

  const rows: IUsers[] = await Users.find({
    $or: [
      { uri: { $regex: `.*${filter.searchValue}.*` } },
      { imageUrl: { $regex: `.*${filter.searchValue}.*` } }
    ]
  })
    .sort({
      [filter.column as string]: filter.direction === "asc" ? 1 : -1
    })
    .limit(filter.rowsPerPage)
    .skip((filter.currentPage - 1) * filter.rowsPerPage)
  return { rows, total }

}

const findAll = async () => {
  const result: IUsers[] = await Users.find({})
  return result
}

const createOne = async (data: any) => {
  const result: IUsers = await Users.create(data)
  return result
}

const updateOne = async (data: any) => {
  const filter = { _id: data._id }
  delete data._id
  const result: IUsers = await Users.findOneAndUpdate(filter, data, { new: true })
  return result
}

const createOrUpdate = async (data: any) => {
  const filter = { discordId: data.discordId }
  const result1: IUsers = await Users.findOne(filter)
  if (result1) {
    const result: IUsers = await Users.findOneAndUpdate(filter, data)
    return result
  } else {
    const result: IUsers = await Users.create(data)
    return result
  }
}

const deleteAll = async () => {
  const result = await Users.deleteMany({})
  return result
}

const deleteOne = async (_id: any) => {
  const result = await Users.deleteOne({
    _id: _id
  })
  return result
}

const findOneByCondition = async (condition: any) => {
  const result = await Users.findOne(condition)
  return result
}

export default {
  findOneByID,
  findByFilter,
  findAll,
  createOne,
  updateOne,
  deleteOne,
  deleteAll,
  findOneByCondition,
  createOrUpdate
}
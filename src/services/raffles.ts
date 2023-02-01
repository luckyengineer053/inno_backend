import { Raffles, IRaffles } from '../models/raffles'

const findOneByID = async (_id: any) => {
  const result: IRaffles = await Raffles.findOne({
    _id: _id
  })
  return result
}

const findByFilter = async (filter: any) => {
  const total = await Raffles.count({
    $and: [
      { hostedProjectId: filter.hostedProjectId },
      {
        $or: [
          { raffleName: { $regex: `.*${filter.searchValue}.*` } },
        ]
      }
    ]
  })

  const rows: IRaffles[] = await Raffles.find({
    $and: [
      { hostedProjectId: filter.hostedProjectId },
      {
        $or: [
          { raffleName: { $regex: `.*${filter.searchValue}.*` } },
        ]
      }
    ]
  })
    .sort({
      [filter.column as string]: filter.direction === "asc" ? 1 : -1
    })
    .limit(filter.rowsPerPage)
    .skip((filter.currentPage - 1) * filter.rowsPerPage)
  return { rows, total }
}

const findByFilterAndDiscordName = async (filter: any, discordName: string) => {
  const total = await Raffles.count({
    $and: [
      { submittedUser: discordName },
      {
        $or: [
          { projectName: { $regex: `.*${filter.searchValue}.*` } },
        ]
      }
    ]
  })

  const rows: IRaffles[] = await Raffles.find({
    $and: [
      { submittedUser: discordName },
      {
        $or: [
          { projectName: { $regex: `.*${filter.searchValue}.*` } },
        ]
      }
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
  const result: IRaffles[] = await Raffles.find({})
  return result
}

const createOne = async (data: any) => {
  const result: IRaffles = await Raffles.create(data)
  return result
}

const updateOne = async (data: any) => {
  const filter = { _id: data._id }
  delete data._id
  const result: IRaffles = await Raffles.findOneAndUpdate(filter, data, { new: true })
  return result
}

const deleteAll = async () => {
  const result = await Raffles.deleteMany({})
  return result
}

const deleteOne = async (_id: any) => {
  const result = await Raffles.deleteOne({
    _id: _id
  })
  return result
}

// custom
const findOneByCondition = async (condition: any) => {
  const result = await Raffles.findOne(condition)
  return result
}

// const findByStatus = async (hostedProject: string) => {
//     const result = await Raffles.find({
//         hostedProjectId: hostedProject
//     })

//     return result
// }

const findByCondition = async (condition: any) => {
  const result = await Raffles.find(condition)
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
  // findByStatus,
  findOneByCondition,
  findByFilterAndDiscordName,
  findByCondition
}
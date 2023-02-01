import { DaoVoting, IDaoVoting } from '../models/daoVoting'

const findOneByID = async (_id: any) => {
  const result: IDaoVoting = await DaoVoting.findOne({
    _id: _id
  })
  return result
}

const findByFilter = async (filter: any) => {
  const total = await DaoVoting.count({
    $and: [
      { hostedProjectId: filter.hostedProjectId },
      {
        $or: [
          { agenda: { $regex: `.*${filter.searchValue}.*` } },
          { submittedUser: { $regex: `.*${filter.searchValue}.*` } }
        ]
      }
    ]
  })

  const rows: IDaoVoting[] = await DaoVoting.find({
    $and: [
      { hostedProjectId: filter.hostedProjectId },
      {
        $or: [
          { agenda: { $regex: `.*${filter.searchValue}.*` } },
          { submittedUser: { $regex: `.*${filter.searchValue}.*` } }
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
  const result: IDaoVoting[] = await DaoVoting.find({})
  return result
}

const createOne = async (data: any) => {
  const result: IDaoVoting = await DaoVoting.create(data)
  return result
}

const updateOne = async (data: any) => {
  const filter = { _id: data._id }
  delete data._id
  const result: IDaoVoting = await DaoVoting.findOneAndUpdate(filter, data, { new: true })
  return result
}

const deleteAll = async () => {
  const result = await DaoVoting.deleteMany({})
  return result
}

const deleteOne = async (_id: any) => {
  const result = await DaoVoting.deleteOne({
    _id: _id
  })
  return result
}

// custom
const vote = async (id: string, discordId: string, option: any) => {
  const selectedVote = await findOneByID(id)

  const options = [...selectedVote.options]
  let number = 0

  options.map((item: any, index: number) => {
    if (item.option === option) {
      number = index
    }
  })

  selectedVote.options[number].voteNumber.push(discordId)
  const res = await updateOne(selectedVote)
  return res
}

const findByCondition = async (condition: any) => {
  // const { key, value } = condition
  const result = await DaoVoting.find(condition)

  return result
}

// const findByFilterAndDiscordName = async (filter: any, discordName: string) => {
//   const total = await DaoVoting.count({
//     $or: [
//       //   { submittedUser: discordName },
//       { agenda: { $regex: `.*${filter.searchValue}.*` } },
//       { lastName: { $regex: `.*${filter.searchValue}.*` } }
//     ]
//   })

//   const rows: IDaoVoting[] = await DaoVoting.find({
//     $or: [
//       //   { submittedUser: discordName },
//       { agenda: { $regex: `.*${filter.searchValue}.*` } },
//       { lastName: { $regex: `.*${filter.searchValue}.*` } }
//     ]
//   })
//     .sort({
//       [filter.column]: filter.direction === "asc" ? 1 : -1
//     })
//     .limit(filter.rowsPerPage)
//     .skip((filter.currentPage - 1) * filter.rowsPerPage)
//   return { rows, total }
// }

export default {
  findOneByID,
  findByFilter,
  findAll,
  createOne,
  updateOne,
  deleteOne,
  deleteAll,
  vote,
  findByCondition
  // findByFilterAndDiscordName
}
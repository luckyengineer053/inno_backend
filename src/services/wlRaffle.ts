import { WlRaffle, IWlRaffle } from '../models/wlRaffle'

const findOneByID = async (_id: any) => {
    const result: IWlRaffle = await WlRaffle.findOne({
        _id: _id
    })
    return result
}

const findByFilter = async (filter: any) => {
    const total = await WlRaffle.count({
        $and: [
            { hostedProjectId: filter.hostedProjectId },
            {
                $or: [
                    { projectName: { $regex: `.*${filter.searchValue}.*` } },
                ]
            }
        ]
    })

    const rows: IWlRaffle[] = await WlRaffle.find({
        $and: [
            { hostedProjectId: filter.hostedProjectId },
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

const findByFilterAndDiscordName = async (filter: any, discordName: string) => {
    const total = await WlRaffle.count({
        $and: [
            { submittedUser: discordName },
            {
                $or: [
                    { projectName: { $regex: `.*${filter.searchValue}.*` } },
                ]
            }
        ]
    })

    const rows: IWlRaffle[] = await WlRaffle.find({
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
    const result: IWlRaffle[] = await WlRaffle.find({})
    return result
}

const createOne = async (data: any) => {
    const result: IWlRaffle = await WlRaffle.create(data)
    return result
}

const updateOne = async (data: any) => {
    const filter = { _id: data._id }
    delete data._id
    const result: IWlRaffle = await WlRaffle.findOneAndUpdate(filter, data, { new: true })
    return result
}

const deleteAll = async () => {
    const result = await WlRaffle.deleteMany({})
    return result
}

const deleteOne = async (_id: any) => {
    const result = await WlRaffle.deleteOne({
        _id: _id
    })
    return result
}

// custom
const findOneByCondition = async (condition: any) => {
    const result = await WlRaffle.findOne(condition)
    return result
}

// const findByStatus = async (hostedProject: string) => {
//     const result = await WlRaffle.find({
//         hostedProjectId: hostedProject
//     })

//     return result
// }

const findByCondition = async (condition: any) => {
    const result = await WlRaffle.find(condition)
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
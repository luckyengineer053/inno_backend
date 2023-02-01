import { NFT, INFT } from '../models/nft'

const findOneByID = async (_id: any) => {
    const result: INFT = await NFT.findOne({
        _id: _id
    })
    return result
}

const findByFilter = async (filter: any) => {
    const total = await NFT.count({
        $or: [
            { uri: { $regex: `.*${filter.searchValue}.*` } },
            { imageUrl: { $regex: `.*${filter.searchValue}.*` } }
        ]
    })

    const rows: INFT[] = await NFT.find({
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
    const result: INFT[] = await NFT.find({})
    return result
}

const createOne = async (data: any) => {
    const result: INFT = await NFT.create(data)
    return result
}

const updateOne = async (data: any) => {
    const filter = { _id: data._id }
    delete data._id
    const result: INFT = await NFT.findOneAndUpdate(filter, data, { new: true })
    return result
}

const deleteAll = async () => {
    const result = await NFT.deleteMany({})
    return result
}

const deleteOne = async (_id: any) => {
    const result = await NFT.deleteOne({
        _id: _id
    })
    return result
}

export default {
    findOneByID,
    findByFilter,
    findAll,
    createOne,
    updateOne,
    deleteOne,
    deleteAll
}
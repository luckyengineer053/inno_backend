import { Setting, ISetting } from '../models/setting'

const findOneByID = async (_id: any) => {
    const result: ISetting = await Setting.findOne({
        _id: _id
    })
    return result
}

const findByFilter = async (filter: any) => {
    const total = await Setting.count({
        $or: [
            { key: { $regex: `.*${filter.searchValue}.*` } },
            { value: { $regex: `.*${filter.searchValue}.*` } }
        ]
    })

    const rows: ISetting[] = await Setting.find({
        $or: [
            { key: { $regex: `.*${filter.searchValue}.*` } },
            { value: { $regex: `.*${filter.searchValue}.*` } }
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
    const result: ISetting[] = await Setting.find({})
    return result
}

const createOne = async (data: any) => {
    const result: ISetting = await Setting.create(data)
    return result
}

const updateOne = async (data: any) => {
    const filter = { _id: data._id }
    delete data._id
    const result: ISetting = await Setting.findOneAndUpdate(filter, data, { new: true })
    return result
}

const deleteAll = async () => {
    const result = await Setting.deleteMany({})
    return result
}

const deleteOne = async (_id: any) => {
    const result = await Setting.deleteOne({
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
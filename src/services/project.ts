import { Project, IProject } from '../models/project'

const findOneByID = async (_id: any) => {
    const result: IProject = await Project.findOne({
        _id: _id
    })
    return result
}

const findByFilter = async (filter: any) => {
    const total = await Project.count({
        $or: [
            { name: { $regex: `.*${filter.searchValue}.*` } },
            { subscriber: { $regex: `.*${filter.searchValue}.*` } }
        ]
    })

    const rows: IProject[] = await Project.find({
        $or: [
            { name: { $regex: `.*${filter.searchValue}.*` } },
            { subscriber: { $regex: `.*${filter.searchValue}.*` } }
        ]
    })
        .sort({
            [filter.column as string]: filter.direction === "ASC" ? 1 : -1
        })
        .limit(filter.rowsPerPage)
        .skip((filter.currentPage - 1) * filter.rowsPerPage)
    return { rows, total }

}

const findAll = async () => {
    const result: IProject[] = await Project.find({})
    return result
}

const createOne = async (data: any) => {
    const result: IProject = await Project.create(data)
    return result
}

const updateOne = async (data: any) => {
    const filter = { _id: data._id }
    delete data._id
    const result: IProject = await Project.findOneAndUpdate(filter, data, { new: true })
    return result
}

const deleteAll = async () => {
    const result = await Project.deleteMany({})
    return result
}

const deleteOne = async (_id: any) => {
    const result = await Project.deleteOne({
        _id: _id
    })
    return result
}

const findByCondition = async (condition: any) => {
    const result = await Project.find(condition)
    return result
}

const findOneByCondition = async (condition: any) => {
    const result = await Project.findOne(condition)
    return result
}

const upvote = async (id: string, newVote: string[]) => {
    await Project.findOneAndUpdate({ _id: id }, { upvote: newVote })
}

export default {
    findOneByID,
    findByFilter,
    findAll,
    createOne,
    updateOne,
    deleteOne,
    deleteAll,
    findByCondition,
    upvote,
    findOneByCondition
}
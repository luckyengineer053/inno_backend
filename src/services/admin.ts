import { Admin, IAdmin } from '../models/admin'

const findOne = async (filter: any) => {
    try {
        const result: IAdmin = await Admin.findOne(filter)
        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

const findByFilter = async (filter: any) => {
    try {
        const total = await Admin.count({
            $or: [
                { username: { $regex: `.*${filter.searchValue}.*` } },
                { discordName: { $regex: `.*${filter.searchValue}.*` } },
            ]
        })

        const rows: IAdmin[] = await Admin.find({
            $or: [
                { username: { $regex: `.*${filter.searchValue}.*` } },
                { discordName: { $regex: `.*${filter.searchValue}.*` } },
            ]
        })
            .sort({
                [filter.column as string]: filter.direction === "asc" ? 1 : -1
            })
            .limit(filter.rowsPerPage)
            .skip((filter.currentPage - 1) * filter.rowsPerPage)

        return {
            success: true,
            data: { rows, total },
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }

}

const findMany = async (filter: any) => {
    try {
        const result: IAdmin[] = await Admin.find(filter)
        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

const createOne = async (data: any) => {
    try {
        const result: IAdmin = await Admin.create(data)
        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

const updateOne = async (data: any) => {
    try {
        const filter = { _id: data._id }
        delete data._id
        const result: IAdmin = await Admin.findOneAndUpdate(filter, data, { new: true })

        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

const deleteMany = async (filter: any) => {
    try {
        const result = await Admin.deleteMany(filter)

        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

const deleteOne = async (filter: any) => {
    try {
        const result = await Admin.deleteOne(filter)

        return {
            success: true,
            data: result,
            message: 'Success'
        }
    } catch (err) {
        return {
            success: false,
            data: err,
            message: 'Failed'
        }
    }
}

export default {
    findOne,
    findByFilter,
    findMany,
    createOne,
    updateOne,
    deleteOne,
    deleteMany
}
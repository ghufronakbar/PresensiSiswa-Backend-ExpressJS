const prisma = require('../../db/prisma')

const getInformasi = async (req, res) => {
    try {
        const getData = await prisma.informasi.findMany()
        const oneData = getData[0]
        return res.status(200).json({ status: 200, message: 'Data Informasi', data: oneData })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

const editInformasi = async (req, res) => {
    const { tahunAjaran, semester } = req.body
    try {
        const editData = await prisma.informasi.updateMany({
            data: {
                tahunAjaran,
                semester
            }
        })
        return res.status(200).json({ status: 200, message: 'Edit berhasil', data: editData })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

module.exports = { getInformasi, editInformasi }
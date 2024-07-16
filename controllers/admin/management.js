const primsa = require('../../db/prisma')
const md5 = require('md5')

const showAdmin = async (req, res) => {
    const { page } = req.query
    try {
        let qPage = 1

        if (page) {
            qPage = page
        }

        const getAdmin = await primsa.admin.findMany({
            skip: (qPage - 1) * 10,
            take: 10,
            orderBy: {
                idAdmin: 'desc'
            }
        })

        const pagination = { total_page: Math.ceil(await primsa.admin.count() / 10), current_page: parseInt(qPage), total_data: await primsa.admin.count() }

        return res.status(200).json({ status: 200, message: 'Data Admin', data: getAdmin, pagination })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const showAdminId = async (req, res) => {
    const { id } = req.params
    try {
        const getAdmin = await primsa.admin.findFirst({
            where: {
                idAdmin: parseInt(id)
            }
        })

        if (!getAdmin) { return res.status(404).json({ status: 404, message: 'Admin tidak ditemukan' }) }

        return res.status(200).json({ status: 200, message: 'Data Admin', data: getAdmin })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const createAdmin = async (req, res) => {
    const { email } = req.body
    try {
        if (!email) { return res.status(400).json({ status: 400, message: 'Email harus diisi' }) }
        const validateAdmin = await primsa.admin.findFirst({
            where: {
                email
            }
        })

        if (validateAdmin) { return res.status(400).json({ status: 400, message: 'Email sudah terdaftar' }) }

        const createAdmin = await primsa.admin.create({
            data: {
                email,
                password: md5('12345678'),                
            }
        })

        return res.status(200).json({ status: 200, message: 'Admin berhasil dibuat', email, password: '12345678' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const deleteAdmin = async (req, res) => {
    const { id } = req.params
    try {
        const validateAdmin = await primsa.admin.findFirst({
            where: {
                idAdmin: parseInt(id)
            }
        })

        if (!validateAdmin) { return res.status(404).json({ status: 404, message: 'Admin tidak ditemukan' }) }
        if (validateAdmin.isSuperAdmin) { return res.status(400).json({ status: 400, message: 'Super admin tidak bisa di hapus' }) }

        const deleteAdmin = await primsa.admin.delete({
            where: {
                idAdmin: parseInt(id)
            }
        })

        return res.status(200).json({ status: 200, message: `Admin dengan email ${validateAdmin.email} berhasil di hapus` })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { showAdmin, showAdminId, createAdmin, deleteAdmin }
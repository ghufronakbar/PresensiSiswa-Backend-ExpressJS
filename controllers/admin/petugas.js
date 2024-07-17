const prisma = require('../../db/prisma')
const md5 = require('md5')

const createPetugas = async (req, res) => {
    const { nama, email, password } = req.body
    try {
        if (!email || !nama || !password) { return res.status(400).json({ status: 400, message: 'Email, nama, dan password harus diisi' }) }
        const validatePetugas = await prisma.petugas.findMany({
            where: {
                email
            }
        })
        if (validatePetugas.length > 0) { return res.status(400).json({ status: 400, message: 'Email sudah terdaftar' }) }

        const validatePetugasInAdmin = await prisma.admin.findMany({
            where: {
                email
            }
        })

        if (validatePetugasInAdmin.length > 0) { return res.status(400).json({ status: 400, message: 'Email sudah terdaftar sebagai admin' }) }

        const createPetugas = await prisma.petugas.create({
            data: {
                email,
                password: md5(password),
                nama
            }
        })

        return res.status(200).json({ status: 200, message: 'Petugas berhasil dibuat', email, password })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const deletePetugas = async (req, res) => {
    const { id } = req.params
    try {
        const validatePetugas = await prisma.petugas.findFirst({
            where: {
                idPetugas: parseInt(id)
            }
        })
        if (!validatePetugas) { return res.status(400).json({ status: 400, message: 'Petugas tidak ditemukan' }) }
        const deletePetugas = await prisma.petugas.delete({
            where: {
                idPetugas: parseInt(id)
            }
        })
        return res.status(200).json({ status: 200, message: `Petugas ${validatePetugas.nama} berhasil di hapus` })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const showPetugas = async (req, res) => {
    const { page } = req.query
    try {
        let qPage = 1

        if (page) {
            qPage = page
        }

        const getPetugas = await prisma.petugas.findMany({
            skip: (qPage - 1) * 10,
            take: 10,
            orderBy: {
                idPetugas: 'desc'
            }
        })

        const pagination = { total_page: Math.ceil(await prisma.petugas.count() / 10), current_page: parseInt(qPage), total_data: await prisma.petugas.count() }


        return res.status(200).json({ status: 200, message: 'Data Petugas', data: getPetugas, pagination })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const showPetugasId = async (req, res) => {
    const { id } = req.params
    try {
        const getPetugas = await prisma.petugas.findFirst({
            where: {
                idPetugas: parseInt(id)
            }
        })

        if (!getPetugas) { return res.status(400).json({ status: 400, message: 'Petugas tidak ditemukan' }) }

        return res.status(200).json({ status: 200, message: 'Data Petugas', data: getPetugas })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { createPetugas, deletePetugas, showPetugas, showPetugasId }

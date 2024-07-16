const primsa = require('../../db/prisma')

const showSiswa = async (req, res) => {
    const { page } = req.query
    try {
        let qPage = 1

        if (page) {
            qPage = page
        }

        const getSiswa = await primsa.siswa.findMany({
            skip: (qPage - 1) * 10,
            take: 10,
            orderBy: {
                idSiswa: 'desc'
            },
            where: {
                isDeleted: false
            }
        })

        const pagination = { total_page: Math.ceil(await primsa.siswa.count() / 10), current_page: parseInt(qPage), total_data: await primsa.siswa.count() }

        return res.status(200).json({ status: 200, message: 'Data Siswa', data: getSiswa, pagination })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const createSiswa = async (req, res) => {
    const { idSiswa, nama, kelas } = req.body
    try {
        if (!idSiswa) { return res.status(400).json({ status: 400, message: 'ID siswa harus diisi' }) }
        if (!nama) { return res.status(400).json({ status: 400, message: 'Nama harus diisi' }) }
        if (!kelas) { return res.status(400).json({ status: 400, message: 'Kelas harus diisi' }) }

        const validateSiswa = await primsa.siswa.findFirst({
            where: {
                idSiswa: idSiswa
            }
        })

        if(validateSiswa && validateSiswa.isDeleted) { return res.status(400).json({ status: 400, message: 'ID siswa pernah terdaftar' }) }

        if (validateSiswa) { return res.status(400).json({ status: 400, message: 'ID siswa sudah terdaftar' }) }

        const createData = await primsa.siswa.create({
            data: {
                idSiswa: idSiswa,
                nama,
                kelas
            }
        })

        return res.status(200).json({ status: 200, message: 'Data siswa berhasil ditambahkan', data: createData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const showSiswaId = async (req, res) => {
    const { id } = req.params
    try {
        const getSiswa = await primsa.siswa.findFirst({
            where: {
                idSiswa: id,
                isDeleted: false
            }
        })

        if (!getSiswa) { return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' }) }

        return res.status(200).json({ status: 200, message: 'Data Siswa', data: getSiswa })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const deleteSiswa = async (req, res) => {
    const { id } = req.params
    try {
        const getSiswa = await primsa.siswa.findFirst({
            where: {
                idSiswa: id
            }
        })

        if (getSiswa && getSiswa.isDeleted === true) { return res.status(404).json({ status: 404, message: 'Siswa sudah dihapus' }) }
        if (!getSiswa) { return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' }) }

        await primsa.siswa.update({
            where: {
                idSiswa: id
            },
            data: {
                isDeleted: true
            }
        })

        return res.status(200).json({ status: 200, message: 'Siswa berhasil dihapus' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const editSiswa = async (req, res) => {
    const { id } = req.params
    const { updatedId, nama, kelas } = req.body
    try {
        if (!updatedId) { return res.status(400).json({ status: 400, message: 'ID siswa harus diisi' }) }
        if (!nama) { return res.status(400).json({ status: 400, message: 'Nama harus diisi' }) }
        if (!kelas) { return res.status(400).json({ status: 400, message: 'Kelas harus diisi' }) }

        
        const getSiswa = await primsa.siswa.findFirst({
            where: {
                idSiswa: id
            }
        })

        if (!getSiswa) { return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' }) }

        const validateId = await primsa.siswa.findFirst({
            where: {
                idSiswa: updatedId,                
                NOT: {
                    idSiswa: id
                }
            } 
        })
        console.log(validateId)
        
        if(validateId && validateId.isDeleted === true){return res.status(400).json({ status: 400, message: 'ID siswa pernah terdaftar' })}
        if(validateId){return res.status(400).json({ status: 400, message: 'ID siswa sudah terdaftar' })}

        await primsa.siswa.update({
            where: {
                idSiswa: id
            },
            data: {
                idSiswa: updatedId,
                nama,
                kelas
            }
        })

        return res.status(200).json({ status: 200, message: 'Siswa berhasil diupdate' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { showSiswa, createSiswa, showSiswaId, deleteSiswa, editSiswa }
const prisma = require('../../db/prisma')

const showSiswa = async (req, res) => {
    const { page, kelas } = req.query
    try {
        const where = { isDeleted: false }

        if (kelas) {
            where.kelas = kelas
        }
        let qPage = 1

        if (page) {
            qPage = page
        }

        const getSiswa = await prisma.siswa.findMany({
            skip: (qPage - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            where
        })

        const pagination = { total_page: Math.ceil(await prisma.siswa.count({ where }) / 10), current_page: parseInt(qPage), total_data: await prisma.siswa.count({ where }) }

        return res.status(200).json({ status: 200, message: 'Data Siswa', data: getSiswa, pagination })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const createSiswa = async (req, res) => {
    const { idSiswa, nama, kelas, noOrangTua } = req.body
    try {
        if (!idSiswa) { return res.status(400).json({ status: 400, message: 'ID siswa harus diisi' }) }
        if (!nama) { return res.status(400).json({ status: 400, message: 'Nama harus diisi' }) }
        if (!kelas) { return res.status(400).json({ status: 400, message: 'Kelas harus diisi' }) }
        if (!noOrangTua) { return res.status(400).json({ status: 400, message: 'No. Orang Tua harus diisi' }) }

        // VALIDASI NOMOR TIDAK BOLEH ADA 0 DI DEPAN
        if (noOrangTua[0] === '0') { return res.status(400).json({ status: 400, message: 'No. Orang Tua tidak boleh ada 0 di depan' }) }

        const validateSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa: idSiswa,
            }
        })

        if (validateSiswa && validateSiswa.isDeleted) { return res.status(400).json({ status: 400, message: 'ID siswa pernah terdaftar' }) }

        if (validateSiswa) { return res.status(400).json({ status: 400, message: 'ID siswa sudah terdaftar' }) }

        const createData = await prisma.siswa.create({
            data: {
                idSiswa: idSiswa,
                nama,
                kelas,
                noOrangtua: noOrangTua
            }
        })

        return res.status(200).json({ status: 200, message: 'Data siswa berhasil ditambahkan', data: createData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const showSiswaId = async (req, res) => {
    const { id } = req.params;
    const { tipe } = req.query;
    try {
        let queryTipe = '';

        if (tipe) {
            queryTipe = tipe.toUpperCase();
        }

        const getSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa: id,
                isDeleted: false,
            },
            include: {
                kehadiran: {
                    where: {
                        tipe: {
                            contains: queryTipe,
                        },
                    },
                    orderBy: {
                        waktu: 'desc',
                    },
                },
            },
        });

        if (!getSiswa) {
            return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' });
        }

        // Menghitung total kehadiran berdasarkan tipe
        const totalKehadiran = getSiswa.kehadiran.reduce((acc, curr) => {
            acc[curr.kehadiran] = (acc[curr.kehadiran] || 0) + 1;
            return acc;
        }, {});

        // Menambahkan default 0 jika tipe kehadiran tidak ada dalam data
        ['H', 'I', 'S', 'A'].forEach((key) => {
            if (!totalKehadiran[key]) {
                totalKehadiran[key] = 0;
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'Data Siswa',
            data: {
                ...getSiswa,
                totalKehadiran,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};


const deleteSiswa = async (req, res) => {
    const { id } = req.params
    try {
        const getSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa: id                
            }
        })

        if (getSiswa && getSiswa.isDeleted === true) { return res.status(404).json({ status: 404, message: 'Siswa sudah dihapus' }) }
        if (!getSiswa) { return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' }) }

        await prisma.siswa.update({
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
    const { updatedId, nama, kelas, noOrangTua } = req.body
    try {
        if (!updatedId) { return res.status(400).json({ status: 400, message: 'ID siswa harus diisi' }) }
        if (!nama) { return res.status(400).json({ status: 400, message: 'Nama harus diisi' }) }
        if (!kelas) { return res.status(400).json({ status: 400, message: 'Kelas harus diisi' }) }


        const getSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa: id
            }
        })

        if (!getSiswa) { return res.status(404).json({ status: 404, message: 'Siswa tidak ditemukan' }) }

        const validateId = await prisma.siswa.findFirst({
            where: {
                idSiswa: updatedId,
                NOT: {
                    idSiswa: id
                }
            }
        })
        console.log(validateId)

        if (validateId && validateId.isDeleted === true) { return res.status(400).json({ status: 400, message: 'ID siswa pernah terdaftar' }) }
        if (validateId) { return res.status(400).json({ status: 400, message: 'ID siswa sudah terdaftar' }) }

        await prisma.siswa.update({
            where: {
                idSiswa: id
            },
            data: {
                idSiswa: updatedId,
                nama,
                kelas,
                noOrangtua: noOrangTua
            }
        })

        return res.status(200).json({ status: 200, message: 'Siswa berhasil diupdate' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { showSiswa, createSiswa, showSiswaId, deleteSiswa, editSiswa }
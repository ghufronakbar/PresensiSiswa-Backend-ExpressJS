const prisma = require('../../db/prisma')

const showKelas = async (req, res) => {
    try {
        const findKelas = await prisma.siswa.findMany({
            select: {
                kelas: true
            },where:{
                isDeleted: false
            }

        })

        // FILTER UNIQUE KELAS
        const uniqueKelas = findKelas
            .map((item) => item.kelas)
            .filter((value, index, self) => self.indexOf(value) === index)

        // UPDATE KELAS MENJADI STATIC

        const listKelas = ["1", "2", "3", "4", "5", "6"]

        return res.status(200).json({ status: 200, message: 'Data Kelas', data: listKelas })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { showKelas }
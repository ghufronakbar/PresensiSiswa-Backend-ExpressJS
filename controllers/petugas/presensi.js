const prisma = require('../../db/prisma')

const presensi = async (req, res) => {
    const { idSiswa } = req.body
    try {
        const now = new Date()

        // TESTING
        // const now = new Date('2023-05-05T07:00:00.000Z') WAKTU KELUAR -7 DARI WAKTU INDONESIA
        // const now = new Date('2023-05-05T00:00:00.000Z') WAKTU MASUK -7 DARI WAKTU INDONESIA
      

        // 06:00 = 09:00 MASUK || 12:00 = 3:00 KELUAR

        let tipe = ''

        if (now.getHours() >= 6 && now.getHours() < 9) {
            tipe = 'MASUK'
        } else if (now.getHours() >= 12 && now.getHours() < 15) {
            tipe = 'KELUAR'
        } else {
            return res.status(400).json({ status: 400, message: 'Waktu presensi tidak valid!' })
        }

        const validateSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa
            }
        })

        if (!validateSiswa) { return res.status(400).json({ status: 400, message: 'Siswa tidak ditemukan!' }) }

        const validatePresensi = await prisma.kehadiran.findFirst({
            where: {
                idSiswa,
                tipe
            }
        })

        if (validatePresensi) { return res.status(400).json({ status: 400, message: `Siswa sudah melakukan presensi ${tipe.toLowerCase()} !` }) }

        const informasiAjaran = await prisma.informasi.findFirst()
        const semester = informasiAjaran.semester
        const tahunAjaran = informasiAjaran.tahunAjaran

        const presensi = await prisma.kehadiran.create({
            data: {
                idSiswa,
                tipe: tipe.toUpperCase(),
                semester: semester.toUpperCase(),
                tahunAjaran
            }
        })

        return res.status(200).json({ status: 200, message: 'Presensi berhasil dilakukan', data: presensi })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { presensi }
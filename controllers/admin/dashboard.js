const prisma = require('../../db/prisma')

const dashboard = async (req, res) => {
    try {
        const countSiswa = await prisma.siswa.count({
            where: {
                isDeleted: false
            }
        })

        const findKelas = await prisma.siswa.findMany({
            select: {
                kelas: true
            }
        })

        // FILTER UNIQUE KELAS
        const uniqueKelas = findKelas
            .map((item) => item.kelas)
            .filter((value, index, self) => self.indexOf(value) === index)

        const countKelas = uniqueKelas.length

        const countPetugas = await prisma.petugas.count()

        const summary = { H: 0, A: 0, I: 0, S: 0, TK: 0 };

        const now = new Date();
        const startOfDay = now.setUTCHours(0, 0, 0, 0)
        const endOfDay = now.setUTCHours(24, 0, 0, 0)

        const startISO = new Date(startOfDay).toISOString();
        const endISO = new Date(endOfDay).toISOString();

        const whereKehadiran = {
            waktu: {
                gte: startISO,
                lt: endISO
            }
        };

        const siswaData = await prisma.siswa.findMany({
            where: { isDeleted: false },
            include: {
                kehadiran: {
                    where: whereKehadiran
                }
            }
        });

        const data = siswaData.map((siswa, index) => {
            const kehadiran = siswa.kehadiran.find(k => !queryTipe || k.tipe === queryTipe); // Asumsikan satu presensi per hari dengan tipe yang sesuai
            if (kehadiran) {
                summary[kehadiran.kehadiran]++;
            } else {
                summary.TK++;
            }
            return {
                index: index + 1,
                kehadiran: kehadiran ? kehadiran.kehadiran : 'TK',
                tipe: kehadiran ? kehadiran.tipe : null,
                waktu: kehadiran ? kehadiran.waktu : null,
                tahunAjaran: kehadiran ? kehadiran.tahunAjaran : null,
                semester: kehadiran ? kehadiran.semester : null,
                siswa: {
                    idSiswa: siswa.idSiswa,
                    nama: siswa.nama,
                    kelas: siswa.kelas
                }
            };
        });

        return res.status(200).json({
            status: 200,
            message: 'Data Dashboard',
            data: {
                totalSiswa: countSiswa,
                totalKelas: countKelas,
                totalPetugas: countPetugas,
                kehadiranHariIni: summary
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { dashboard }
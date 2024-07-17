const prisma = require('../../db/prisma')

const showPresensi = async (req, res) => {
    const { date, kelas, tipe } = req.query;
    const queryTipe = tipe? tipe.toUpperCase() : 'MASUK';
    
    try {
        if(tipe && (queryTipe !== 'MASUK' && queryTipe !== 'KELUAR')) {
            return res.status(400).json({ status: 400, message: "Invalid tipe" });
        }
        // Mendapatkan tanggal hari ini jika tidak ada tanggal yang diberikan
        const today = new Date();
        const queryDate = date ? new Date(date) : today;

        if (isNaN(queryDate)) {
            return res.status(400).json({ status: 400, message: "Invalid date format" });
        }

        const startOfDay = new Date(queryDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setUTCHours(24, 0, 0, 0));

        const whereKehadiran = {
            waktu: {
                gte: startOfDay,
                lt: endOfDay
            }
        };

        if (kelas) {
            whereKehadiran.siswa = { kelas };
        }

        if (queryTipe) {
            whereKehadiran.tipe = queryTipe;
        }

        const siswaData = await prisma.siswa.findMany({
            where: kelas ? { kelas } : {},
            include: {
                kehadiran: {
                    where: whereKehadiran
                }
            }
        });

        const summary = { H: 0, A: 0, I: 0, TK: 0 };
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

        const totalSiswa = data.length;

        return res.status(200).json({
            status: 200,
            message: 'Data Presensi',
            kelas: kelas? kelas : 'Semua Kelas',
            totalSiswa,
            tanggal: startOfDay.toISOString().split('T')[0], // Mengambil tanggal dalam format YYYY-MM-DD
            presensi: summary,
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};




const editPresensi = async (req, res) => {
    const { id } = req.params
    const { kehadiran } = req.body
    try {
        if (!kehadiran) { return res.status(400).json({ status: 400, message: 'Kehadiran harus diisi' }) }
        if (kehadiran !== 'H' && kehadiran !== 'A' && kehadiran !== 'I') { return res.status(400).json({ status: 400, message: 'Kehadiran harus H/A/I' }) }

        const editKehadiran = await prisma.kehadiran.update({
            where: {
                idKehadiran: parseInt(id)
            },
            data: {
                kehadiran
            }
        })

        return res.status(200).json({ status: 200, message: 'Edit kehadiran berhasil', data: editKehadiran })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}


module.exports = { showPresensi, editPresensi }
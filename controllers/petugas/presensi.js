const prisma = require('../../db/prisma')
const moment = require('moment-timezone');

const presensi = async (req, res) => {
    const { idSiswa } = req.body;
    try {
        const validateSiswa = await prisma.siswa.findFirst({
            where: {
                idSiswa
            }
        });

        if (!validateSiswa) {
            return res.status(400).json({ status: 400, message: 'Siswa tidak ditemukan!' });
        }
        if (validateSiswa.isDeleted) {
            return res.status(400).json({ status: 400, message: 'Siswa sudah di hapus!' });
        }

        // Menggunakan moment-timezone untuk mendapatkan waktu sekarang di zona waktu Indonesia
        const now = moment.tz('Asia/Jakarta');
        let tipe = '';        

        if (now.hour() >= 6 && now.hour() < 9) {
            tipe = 'MASUK';
        } else if (now.hour() >= 12 && now.hour() < 15) {
            tipe = 'KELUAR';
        } else {
            return res.status(400).json({ status: 400, message: 'Waktu presensi tidak valid!' });
        }

        const validatePresensi = await prisma.kehadiran.findFirst({
            where: {
                idSiswa,
                tipe,
                // Mengecek presensi di hari yang sama
                waktu: {
                    gte: now.startOf('day').toDate(),
                    lt: now.endOf('day').toDate()
                }
            }
        });

        if (validatePresensi) {
            return res.status(400).json({ status: 400, message: `Siswa sudah melakukan presensi ${tipe.toLowerCase()}!` });
        }

        const informasiAjaran = await prisma.informasi.findFirst();
        if (!informasiAjaran) {
            return res.status(400).json({ status: 400, message: 'Informasi ajaran tidak ditemukan!' });
        }
        const { semester, tahunAjaran } = informasiAjaran;

        const presensi = await prisma.kehadiran.create({
            data: {
                idSiswa,
                kehadiran: "H",
                tipe: tipe.toUpperCase(),
                semester: semester.toUpperCase(),
                tahunAjaran,
                waktu: now.toDate() // Menyimpan waktu presensi dengan zona waktu yang benar
            }
        });

        return res.status(200).json({ status: 200, message: `Presensi ${tipe.toLowerCase()} berhasil dilakukan`, data: presensi });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};


module.exports = { presensi }
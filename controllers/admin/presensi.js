const prisma = require('../../db/prisma')

const showPresensi = async (req, res) => {
    const { date, kelas, tipe } = req.query;
    const queryTipe = tipe ? tipe.toUpperCase() : 'MASUK';

    try {
        if (tipe && (queryTipe !== 'MASUK' && queryTipe !== 'KELUAR')) {
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
            where: kelas ? { kelas, isDeleted: false } : { isDeleted: false },
            include: {
                kehadiran: {
                    where: whereKehadiran
                }
            }
        });

        const summary = { H: 0, A: 0, I: 0, S: 0, TK: 0 };
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
            kelas: kelas ? kelas : 'Semua Kelas',
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
    const { id } = req.params;
    const { kehadiran, tanggal, tipe } = req.body;

    try {
        if (!kehadiran) {
            return res.status(400).json({ status: 400, message: 'Kehadiran harus diisi' });
        }
        if (kehadiran !== 'H' && kehadiran !== 'A' && kehadiran !== 'I' && kehadiran !== 'S') {
            return res.status(400).json({ status: 400, message: 'Kehadiran harus H/A/I/S' });
        }
        if (!tanggal) {
            return res.status(400).json({ status: 400, message: 'Tanggal harus diisi' });
        }
        if (!tipe) {
            return res.status(400).json({ status: 400, message: 'Tipe harus diisi' });
        }
        if (tipe !== 'MASUK' && tipe !== 'KELUAR') {
            return res.status(400).json({ status: 400, message: 'Tipe harus MASUK/KELUAR' });
        }

        const now = new Date()
        const dateNow = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

        if (tanggal > dateNow) {
            return res.status(400).json({ status: 400, message: 'Tidak boleh melebihi tanggal hari ini' });
        }

        const valueTipe = tipe.toUpperCase();
        let dateObject;

        // Tentukan waktu berdasarkan tipe
        if (valueTipe === 'MASUK') {
            dateObject = new Date(`${tanggal}T07:00:00Z`);
        } else if (valueTipe === 'KELUAR') {
            dateObject = new Date(`${tanggal}T14:00:00Z`);
        }

        const startOfDay = new Date(new Date(tanggal).setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(tanggal).setUTCHours(23, 59, 59, 999));

        const validateKehadiran = await prisma.kehadiran.findFirst({
            where: {
                idSiswa: id,
                waktu: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                tipe: valueTipe
            }
        });

        const informasiAjaran = await prisma.informasi.findFirst();
        if (!informasiAjaran) {
            return res.status(404).json({ status: 404, message: 'Informasi tidak ditemukan' });
        }

        const { semester, tahunAjaran } = informasiAjaran;

        if (!validateKehadiran) {
            // Jika tidak ada data kehadiran, buat baru
            await prisma.kehadiran.create({
                data: {
                    idSiswa: id,
                    kehadiran,
                    tipe: valueTipe,
                    tahunAjaran,
                    semester,
                    waktu: dateObject
                }
            });
            return res.status(200).json({ status: 200, message: `Data presensi ${tipe} berhasil ditambah` });
        } else {
            // Jika ada data kehadiran, edit data kehadiran
            await prisma.kehadiran.update({
                where: {
                    idKehadiran: validateKehadiran.idKehadiran
                },
                data: {
                    kehadiran
                }
            });
            return res.status(200).json({ status: 200, message: `Data presensi ${tipe} berhasil diedit` });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

const makeAllPresensiHadir = async (req, res) => {
    const { tipe, tanggal } = req.body;
    try {
        if (!tipe) {
            return res.status(400).json({ status: 400, message: 'Tipe harus diisi' });
        }
        if (tipe !== 'MASUK' && tipe !== 'KELUAR') {
            return res.status(400).json({ status: 400, message: 'Tipe harus MASUK/KELUAR' });
        }

        if (!tanggal) {
            return res.status(400).json({ status: 400, message: 'Date harus diisi' });
        }

        const now = new Date()
        const dateNow = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

        if (tanggal > dateNow) {
            return res.status(400).json({ status: 400, message: 'Tidak boleh melebihi tanggal hari ini' });
        }


        const valueTipe = tipe.toUpperCase();
        const today = new Date();

        // Tentukan waktu berdasarkan tipe
        let waktu;
        if (valueTipe === 'MASUK') {
            waktu = new Date(`${tanggal}T07:00:00Z`);
        } else if (valueTipe === 'KELUAR') {
            waktu = new Date(`${tanggal}T14:00:00Z`);
        }

        const startOfDay = new Date(new Date(tanggal).setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(tanggal).setUTCHours(23, 59, 59, 999));

        const siswaList = await prisma.siswa.findMany({
            select: { idSiswa: true }
        });

        const informasiAjaran = await prisma.informasi.findFirst();
        if (!informasiAjaran) {
            return res.status(404).json({ status: 404, message: 'Informasi tidak ditemukan' });
        }

        const { semester, tahunAjaran } = informasiAjaran;

        for (const siswa of siswaList) {
            const validateKehadiran = await prisma.kehadiran.findFirst({
                where: {
                    idSiswa: siswa.idSiswa,
                    waktu: {
                        gte: startOfDay,
                        lt: endOfDay
                    },
                    tipe: valueTipe
                }
            });

            if (!validateKehadiran) {
                // Jika tidak ada data kehadiran, buat baru
                await prisma.kehadiran.create({
                    data: {
                        idSiswa: siswa.idSiswa,
                        kehadiran: 'H',
                        tipe: valueTipe,
                        tahunAjaran,
                        semester,
                        waktu
                    }
                });
            }
        }

        return res.status(200).json({ status: 200, message: "Semua siswa yang belum melakukan presensi telah ditandai hadir" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};





module.exports = { showPresensi, editPresensi, makeAllPresensiHadir }
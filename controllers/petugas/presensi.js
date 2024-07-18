const prisma = require('../../db/prisma')
const axios = require('axios');


const doPresensi = async (req, res) => {
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
            return res.status(400).json({ status: 400, message: 'Siswa sudah dihapus!' });
        }

        // Mendapatkan waktu sekarang di zona waktu Indonesia tanpa library tambahan
        const now = new Date();
        now.setHours(now.getHours() + 7);  // Menambahkan 7 jam untuk Waktu Indonesia Barat (WIB)
        const now2 = new Date();
        
        const startOfDay = new Date(now2);
        startOfDay.setHours(7,0,0,0); // Awal hari di WIB

        const endOfDay = new Date(now2);
        endOfDay.setHours(30, 59, 0, 0); // Akhir hari di WIB

        console.log({now});
        console.log({startOfDay});
        console.log({endOfDay});

        let tipe = '';


        const hour = now2.getHours();

        console.log(hour)

        if (hour >= 6 && hour < 9) {
            tipe = 'MASUK';
        } else if (hour >= 12 && hour < 15) {
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
                    gte: startOfDay,
                    lt: endOfDay
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

        const isoDate = now.toISOString();

        const presensi = await prisma.kehadiran.create({
            data: {
                idSiswa,
                kehadiran: "H",
                tipe: tipe.toUpperCase(),
                semester: semester.toUpperCase(),
                tahunAjaran,
                waktu: isoDate
            }
        });

        const getContact = await prisma.siswa.findFirst({
            where: {
                idSiswa
            },
            select: {
                idSiswa: true,
                noOrangtua: true,
                nama: true,
            }
        });

        if (getContact && getContact.noOrangtua) {
            const whatsappMessage = `Halo, Orang Tua/Wali dari ${validateSiswa.nama},\n\nAnak Anda telah melakukan presensi *${tipe.toLowerCase()}* pada tanggal *${now.toISOString().split('T')[0]}* jam *${now.toTimeString().split(' ')[0]}*.`;
            await sendWhatsappMessage(getContact.noOrangtua, whatsappMessage);
        }

        return res.status(200).json({ status: 200, message: `Presensi ${tipe.toLowerCase()} berhasil dilakukan`, data: getContact });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};


const sendWhatsappMessage = async (phone, message) => {
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: phone,
            message: message,
            countryCode: '62' // Country code for Indonesia
        }, {
            headers: {
                'Authorization': process.env.FONNTE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('WhatsApp message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
    }
};


module.exports = { doPresensi }
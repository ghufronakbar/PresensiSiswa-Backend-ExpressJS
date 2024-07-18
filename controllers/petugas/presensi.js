const prisma = require('../../db/prisma')
const moment = require('moment-timezone');
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

        // Menggunakan moment-timezone untuk mendapatkan waktu sekarang di zona waktu Indonesia
        const now = moment.tz('Asia/Jakarta');
        let tipe = '';

        if (now.hour() >= 6 && now.hour() < 9) {
            tipe = 'MASUK';
        } else if (now.hour() >= 12 && now.hour() < 23) {
            tipe = 'KELUAR';
        } else {
            return res.status(400).json({ status: 400, message: 'Waktu presensi tidak valid!' });
        }

        const startOfDay = now.clone().startOf('day').toDate();
        const endOfDay = now.clone().endOf('day').toDate();

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

        const nowDate = new Date()
        nowDate.setHours(nowDate.getHours() + 7)
        const isoDate = nowDate.toISOString()     

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
            const whatsappMessage = `Halo, Orang Tua/Wali dari ${validateSiswa.nama},\n\nAnak Anda telah melakukan presensi *${tipe.toLowerCase()}* pada tanggal *${now.format('YYYY-MM-DD')}* jam *${now.format('HH:mm')}*.`;
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
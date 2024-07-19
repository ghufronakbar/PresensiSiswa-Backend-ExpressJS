const prisma = require('../../db/prisma')
const axios = require('axios');

function getNowISO() {
    const date = new Date();
    date.setHours(date.getHours() + 7); // Menambahkan offset +7 jam
    return date.toISOString(); // Mengembalikan tanggal saat ini dalam ISO string dengan offset +7 jam
}

function getStartOfDayISO() {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Set jam, menit, detik, dan milidetik menjadi 00:00:00
    date.setHours(date.getHours() + 7); // Menambahkan offset +7 jam
    return date.toISOString(); // Mengembalikan awal hari ini dalam ISO string dengan offset +7 jam
}

function getEndOfDayISO() {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // Set jam, menit, detik, dan milidetik menjadi 23:59:59.999
    date.setHours(date.getHours() + 7); // Menambahkan offset +7 jam
    return date.toISOString(); // Mengembalikan akhir hari ini dalam ISO string dengan offset +7 jam
}

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

        const nowISO = getNowISO();
        const startOfDayISO = getStartOfDayISO();
        const endOfDayISO = getEndOfDayISO();
        const hour = nowISO.slice(11, 13)


        let tipe = '';
        console.log(hour)
        console.log(nowISO)
        console.log(startOfDayISO)
        console.log(endOfDayISO)

        if (hour >= 0 && hour < 12) {
            tipe = 'MASUK';
        } else if (hour >= 12 && hour < 24) {
            tipe = 'KELUAR';
        } else {
            return res.status(400).json({ status: 400, message: 'Waktu presensi tidak valid!' });
        }

        const validatePresensi = await prisma.kehadiran.findFirst({
            where: {
                idSiswa,
                tipe,                
                waktu: {
                    gte: startOfDayISO,
                    lt: endOfDayISO
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
                waktu: nowISO
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
            const whatsappMessage = `Halo, Orang Tua/Wali dari ${validateSiswa.nama},\n\nAnak Anda telah melakukan presensi *${tipe.toLowerCase()}* pada tanggal *${nowISO.split('T')[0]}* jam *${nowISO.slice(11, 16)}*.`;
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
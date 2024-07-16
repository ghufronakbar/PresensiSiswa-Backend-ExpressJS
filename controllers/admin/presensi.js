const prisma = require('../../db/prisma')

const showPresensi = async (req, res) => {
    const { page, date, kelas } = req.query;
    try {
        let qPage = parseInt(page) || 1;

        const where = {};

        if (date) {
            const dateObject = new Date(date);
            if (!isNaN(dateObject)) {
                // Assuming you want to filter by specific day, ignoring time part
                where.waktu = {
                    gte: new Date(dateObject.setUTCHours(0, 0, 0, 0)),
                    lt: new Date(dateObject.setUTCHours(24, 0, 0, 0))
                };
            } else {
                return res.status(400).json({ status: 400, message: "Invalid date format" });
            }
        }

        if (kelas) {
            where.siswa = {
                kelas: kelas
            };
        }

        const getPresensi = await prisma.kehadiran.findMany({
            skip: (qPage - 1) * 10,
            take: 10,
            orderBy: {
                idKehadiran: 'desc'
            },
            where,
            include: {
                siswa: {
                    select: {
                        nama: true,
                        kelas: true
                    }
                }
            }
        });

        const totalData = await prisma.kehadiran.count({ where });
        const pagination = {
            total_page: Math.ceil(totalData / 10),
            current_page: qPage,
            total_data: totalData
        };

        return res.status(200).json({ status: 200, message: 'Data Presensi', data: getPresensi, pagination });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};


module.exports = { showPresensi }
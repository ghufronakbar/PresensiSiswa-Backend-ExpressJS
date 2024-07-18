const prisma = require('../../db/prisma')

const getInformasi = async (req, res) => {
    try {
        const getData = await prisma.informasi.findMany()
        const oneData = getData[0]
        return res.status(200).json({ status: 200, message: 'Data Informasi', data: oneData })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

const editInformasi = async (req, res) => {
    const { tahunAjaran, semester } = req.body
    try {
        if(!tahunAjaran || !semester) { return res.status(400).json({ status: 400, message: 'Tahun Ajaran dan semester harus diisi' }) }
        if(semester!= "GANJIL" && semester!= "GENAP") { return res.status(400).json({ status: 400, message: 'Semester harus ganjil atau genap' }) }

        const splitTahunAjaran = tahunAjaran.split('/')
        if(parseInt(splitTahunAjaran[1]) !== parseInt(splitTahunAjaran[0])+1){
            return res.status(400).json({ status: 400, message: 'Tahun Ajaran harus sesuai format' })
        }
        
        const editData = await prisma.informasi.updateMany({
            data: {
                tahunAjaran,
                semester
            }
        })
        return res.status(200).json({ status: 200, message: 'Edit berhasil', data: editData })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

module.exports = { getInformasi, editInformasi }
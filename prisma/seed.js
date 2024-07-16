const prisma = require('../db/prisma')
const md5 = require("md5");

const seedAdmin = async () => {
  try {
    const validateAdmin = await prisma.admin.findMany();

    if (validateAdmin.length === 0) {
      const createSuperAdmin = await prisma.admin.create({
        data: {
          email: "admin@example.com",
          password: md5("12345678"),
          isSuperAdmin: true,
        },
      });
      console.log("Admin created successfully", createSuperAdmin);
    } else {
      console.log("Admin already exists")
    }
  } catch (error) {
    console.log(error);
  }
}

const seedInformasi = async () => {
  try {
    const validateInformasi = await prisma.informasi.findMany();

    if (validateInformasi.length === 0) {
      const createInformasi = await prisma.informasi.create({
        data: {
          semester: "GANJIL",
          tahunAjaran: "2023/2043",
        }
      })
      console.log("Informasi created successfully", createInformasi)
    } else {
      console.log("Informasi already exists")
    }
  } catch (error) {
    console.log(error)
  }
}

const seeds = async () => {
  try {
    await seedAdmin();
    await seedInformasi();
  } catch (error) {
    console.log(error)
  }
};

seeds()
  .then(() => prisma.$disconnect()).then(() => console.log("Seeded successfully"))
  .catch((e) => console.log(e));

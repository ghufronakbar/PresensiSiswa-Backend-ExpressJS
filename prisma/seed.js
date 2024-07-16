const prisma = require('../db/prisma')
const md5 = require("md5");

const seeds = async () => {
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
    }
  } catch (error) {
    console.log(error);
  }
};

seeds()
  .then(() => prisma.$disconnect())
  .catch((e) => console.log(e));

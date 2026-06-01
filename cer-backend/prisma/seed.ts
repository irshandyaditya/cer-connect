import prisma from "../src/config/prisma.ts";
import bcrypt from "bcrypt";

async function main() {
  // roles
  const teacherRole = await prisma.role.upsert({
    where: { name: "TEACHER" },
    update: {},
    create: { name: "TEACHER" },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: { name: "STUDENT" },
  });

  // teacher user
  const teacherPassword = await bcrypt.hash("123456", 12);

  await prisma.user.upsert({
    where: { username: "teacher1" },
    update: {},
    create: {
      username: "teacher1",
      password: teacherPassword,
      fullName: "Teacher One",
      roleId: teacherRole.id,
    },
  });

  // student user
  const studentPassword = await bcrypt.hash("123456", 12);

  await prisma.user.upsert({
    where: { username: "student1" },
    update: {},
    create: {
      username: "student1",
      password: studentPassword,
      fullName: "Student One",
      roleId: studentRole.id,
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
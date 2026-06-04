import prisma from "../src/config/prisma.ts";
import bcrypt from "bcrypt";

// ── Student data ──────────────────────────────────────────────────────

const students = [
  // TI3C
  { nim: "2341720130", nama: "ABDILLAH AGIL ARBIANSYAH", kelas: "TI3C" },
  { nim: "2341720199", nama: "ADHAM BASKARA", kelas: "TI3C" },
  { nim: "2341720047", nama: "AHMAD NAUFAL ILHAM", kelas: "TI3C" },
  { nim: "2341720070", nama: "ANNISA KURNIAWATI", kelas: "TI3C" },
  { nim: "2341720200", nama: "DAMAR GALIH FITRIANTO", kelas: "TI3C" },
  { nim: "2341720100", nama: "DEWITA ANGGRAINI", kelas: "TI3C" },
  { nim: "2341720232", nama: "DIKA ARIE ARRIFKY", kelas: "TI3C" },
  { nim: "2341720202", nama: "ERICHA RIZKI WARDANI", kelas: "TI3C" },
  { nim: "2341720089", nama: "FAHMI YAHYA", kelas: "TI3C" },
  { nim: "2341720165", nama: "FANDY WAHYU HANZURA", kelas: "TI3C" },
  { nim: "2341720003", nama: "FATIKAH SALSABILLA", kelas: "TI3C" },
  { nim: "2341720220", nama: "FIERA ZIADATTUN NISA'", kelas: "TI3C" },
  { nim: "2341720057", nama: "KHOIROTUN NISA'", kelas: "TI3C" },
  { nim: "2341720077", nama: "LUQMAN ANANTA ABDUL HAKIM", kelas: "TI3C" },
  { nim: "2341720119", nama: "MUHAMMAD AL-FATIH ULIMA ROBBY", kelas: "TI3C" },
  { nim: "2341720009", nama: "MUHAMMAD NASIH", kelas: "TI3C" },
  { nim: "2341720091", nama: "MUHAMMAD RIFQI RIZQULLAH", kelas: "TI3C" },
  { nim: "2341720181", nama: "NAKITA GAYUH CAKRAWALA", kelas: "TI3C" },
  { nim: "2341720214", nama: "RAFIQO ADIB DESTARACHMAD", kelas: "TI3C" },
  { nim: "2341720122", nama: "RAHMAD DWI FERDYAN", kelas: "TI3C" },
  { nim: "2341720147", nama: "SADIYA MARITZA", kelas: "TI3C" },
  { nim: "2341720245", nama: "TOMI MARTINO AFFANDI", kelas: "TI3C" },
  { nim: "2341720243", nama: "VARIZKY NALDIBA RIMRA", kelas: "TI3C" },
  { nim: "244107023004", nama: "FABIAN ANANDA MERDANA", kelas: "TI3C" },
  { nim: "244107023008", nama: "NADITYA PRASTIA ANDINO", kelas: "TI3C" },
  // TI3D
  { nim: "2341720134", nama: "AHMAD RIFQI HENDRIANSYAH", kelas: "TI3D" },
  { nim: "2341720071", nama: "AKHMAD AAKHIF ATHALLAH", kelas: "TI3D" },
  { nim: "2341720132", nama: "ANANDA SATRIA PUTRA NUGRAHA", kelas: "TI3D" },
  { nim: "2341720131", nama: "ANNISA EKA PUSPITA", kelas: "TI3D" },
  { nim: "2341720022", nama: "ARYAN SAPUTRA RAHMAD", kelas: "TI3D" },
  { nim: "2341720196", nama: "BILLY MAULANA FERDINAN", kelas: "TI3D" },
  { nim: "2341720187", nama: "CANDRA AHMAD DANI", kelas: "TI3D" },
  { nim: "2341720061", nama: "ESA PRATAMA PUTRI", kelas: "TI3D" },
  { nim: "2341720104", nama: "FAHRI ZANUAR PRADIAN", kelas: "TI3D" },
  { nim: "2341720004", nama: "GHETSA RAMADHANI RISKA ARRYANTI", kelas: "TI3D" },
  { nim: "2341720254", nama: "HANIFAH KURNIASARI", kelas: "TI3D" },
  { nim: "2341720126", nama: "IVANSYAH EKA OKTAVIADI SANTOSO", kelas: "TI3D" },
  { nim: "2341720043", nama: "JIHA RAMDHAN", kelas: "TI3D" },
  { nim: "2341720175", nama: "KAMILA HABIBA PUTRI ANANTA", kelas: "TI3D" },
  { nim: "2341720186", nama: "KEY FIRDAUSI ALFAREL", kelas: "TI3D" },
  { nim: "2341720208", nama: "LUTHFI TRIASWANGGA", kelas: "TI3D" },
  { nim: "2341720099", nama: "M. FIRMANSYAH", kelas: "TI3D" },
  { nim: "2341720015", nama: "NAHDIA PUTRI SAFIRA", kelas: "TI3D" },
  { nim: "2341720252", nama: "NOVA ELIZA MAHARANI", kelas: "TI3D" },
  { nim: "2341720227", nama: "PETRUS TYANG AGUNG ROSARIO", kelas: "TI3D" },
  { nim: "2341720197", nama: "ROCKY ALESSANDRO KRISTANTO", kelas: "TI3D" },
  { nim: "2341720161", nama: "TORA DIGDA KRISTIAWAN", kelas: "TI3D" },
  { nim: "2341720149", nama: "VINCENTIUS LEONANDA PRABOWO", kelas: "TI3D" },
  { nim: "244107023011", nama: "DANENDRA ADHIPRAMANA", kelas: "TI3D" },
  { nim: "244107023010", nama: "FAJRUL SANTOSO", kelas: "TI3D" },
  // SIB3G
  { nim: "2341760199", nama: "AHMAD HAYYIN BAIHAKI", kelas: "SIB3G" },
  { nim: "2341760156", nama: "AHMAD YAZID ILHAM ZHULFIQOR", kelas: "SIB3G" },
  { nim: "2341760170", nama: "AMILIL", kelas: "SIB3G" },
  { nim: "2341760171", nama: "AMIRIL", kelas: "SIB3G" },
  { nim: "2341760166", nama: "ARDHIO FATRA REVANGGA", kelas: "SIB3G" },
  { nim: "2341760173", nama: "DIMAS ARYA SADEWA", kelas: "SIB3G" },
  { nim: "2341760172", nama: "FAKHIRA ZAHRANY NARDIN", kelas: "SIB3G" },
  { nim: "2341760198", nama: "FITRI CAHYANIATI", kelas: "SIB3G" },
  { nim: "2341760159", nama: "MUHAMMAD AFIF KHOSYIDZAKI", kelas: "SIB3G" },
  { nim: "2341760197", nama: "MUHAMMAD FARUQ BURHANUDIN NAHARI", kelas: "SIB3G" },
  { nim: "2341760174", nama: "MUHAMMAD NAZRIL NUR RAHMAN", kelas: "SIB3G" },
  { nim: "2341760155", nama: "SABRINA RAHMADINI", kelas: "SIB3G" },
  { nim: "2341760157", nama: "SATRIYA VIAR CITTA PURNAMA", kelas: "SIB3G" },
  { nim: "2341760160", nama: "SHABRINA QOTTRUNNADA", kelas: "SIB3G" },
];

const uniqueKelas = [...new Set(students.map((s) => s.kelas))];

async function main() {
  console.log("🌱 Starting seed...");

  // ── Roles ──────────────────────────────────────────────────────────
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

  // ── Groups (one per kelas) ─────────────────────────────────────────
  const groupMap: Record<string, string> = {};

  for (const kelas of uniqueKelas) {
    const group = await prisma.group.upsert({
      where: { name: kelas },
      update: {},
      create: { name: kelas },
    });
    groupMap[kelas] = group.id;
    console.log(`  ✅ Group: ${kelas}`);
  }

  // ── Teacher account ────────────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("123456", 12);
  await prisma.user.upsert({
    where: { username: "teacher1" },
    update: {},
    create: {
      username: "teacher1",
      password: teacherPassword,
      fullName: "RIDWAN RISMANTO",
      roleId: teacherRole.id,
    },
  });
  console.log("  ✅ Teacher: teacher1 / 123456");

  // ── Demo student account ───────────────────────────────────────────
  const student1Password = await bcrypt.hash("123456", 12);
  await prisma.user.upsert({
    where: { username: "student1" },
    update: {},
    create: {
      username: "student1",
      password: student1Password,
      fullName: "Demo Student",
      roleId: studentRole.id,
    },
  });
  console.log("  ✅ Demo Student: student1 / 123456");

  // ── Students ───────────────────────────────────────────────────────
  let count = 0;
  for (const student of students) {
    const hashedPassword = await bcrypt.hash(student.nim, 12);
    await prisma.user.upsert({
      where: { username: student.nim },
      update: {
        fullName: student.nama,
        groupId: groupMap[student.kelas],
      },
      create: {
        username: student.nim,
        password: hashedPassword,
        fullName: student.nama,
        roleId: studentRole.id,
        groupId: groupMap[student.kelas],
      },
    });
    count++;
  }

  console.log(`  ✅ Seeded ${count} students`);
  console.log("");
  console.log("🎉 Seed completed!");
  console.log("");
  console.log("📋 Login info:");
  console.log("  Teacher      → username: teacher1   | password: 123456");
  console.log("  Demo Student → username: student1   | password: 123456");
  console.log("  Students     → username: NIM         | password: NIM");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
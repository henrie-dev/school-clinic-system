import { registerUser } from "./modules/auth.js";

// testing creation of accs
const accounts = [
  { email: "student1@example.com", password: "test1234", role: "student", id_num: "S2025000123" },
  { email: "personnel1@example.com", password: "test1234", role: "personnel", id_num: "P2025000123" },
  { email: "admin1@example.com", password: "test1234", role: "admin", id_num: "A2025000123" }
];

async function main() {
  for (const acc of accounts) {
    await registerUser(acc.email, acc.password, acc.role, acc.id_num);
  }
}

main();

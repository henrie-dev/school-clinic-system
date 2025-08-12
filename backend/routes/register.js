import express from "express";  //api route framework
import { db, auth } from "../firebaseAdmin.js";

const router = express.Router();

// changing the birthdate format
function parseBirthDate(birthDateString) {
  if (!birthDateString) return { birth_day: 0, birth_month: 0, birth_year: 0 };
  const date = new Date(birthDateString);
  if (isNaN(date.getTime())) return { birth_day: 0, birth_month: 0, birth_year: 0 };
  return {
    birth_day: date.getUTCDate(),
    birth_month: date.getUTCMonth() + 1,
    birth_year: date.getUTCFullYear(),
  };
}
//main
router.post("/", async (req, res) => {  
  try {
    console.log("Received registration data:", req.body);

    const {     //basically variableName (from the server) : the variable from the website
      accountType,
      "id-number": idNumber,
      email,
      password,

      "first-name": firstName = "",
      "middle-name": middleName = "",
      "last-name": lastName = "",
      "date-of-birth": dateOfBirth = "",
      sex = "",
      religion = "",
      nationality = "",
      "living-with": livingWith = [],
      "others-input": othersInput = "",

      allergy = "",
      asthma = "",
      diabetes = "",
      heart_disease = "",
      hypertension = "",
      personal_data_id = "",

      "city-address": cityAddress = "",
      "tel-no": telNo = "",
      "phone-no": phoneNo = "",

      "father-name": fatherName = "",
      "father-occupation": fatherOccupation = "",
      "mother-name": motherName = "",
      "mother-occupation": motherOccupation = "",

      department = "",
      level = "",
      "section-program": sectionProgram = "",
      id_num = "",

      "personnel-type": personnelType = "",
      "personnel-dept-office": personnelDeptOffice = "",
      "personnel-department": personnelDepartment = "",
    } = req.body;

    // if false, show a message
    if (!accountType || !idNumber || !email || !password) {
      return res.status(400).json({ message: "Missing required fields: accountType, id-number, email or password." });
    }

    // save to firebase auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`.trim(),
      disabled: false,
    });

    // firebase database 'account'
    await db.collection("account").doc(userRecord.uid).set({
      "id-number": idNumber,
      email,
      role: accountType,
      firebase_uid: userRecord.uid,
      created_uid: new Date(),
    });

    // convert birthdate
    const { birth_day, birth_month, birth_year } = parseBirthDate(dateOfBirth);

    // firebase database 'personal data'
    await db.collection("personal_data").doc(userRecord.uid).set({
      allergy,
      asthma,
      diabetes,
      heart_disease,
      hypertension,
      birth_day,
      birth_month,
      birth_year,
      city_address: cityAddress,
      father: fatherName,
      father_job: fatherOccupation,
      first_name: firstName,
      hypertension,
      id_num: idNumber,
      landline_num: telNo || "",
      last_name: lastName,
      living_with: Array.isArray(livingWith) ? livingWith.join(", ") : livingWith || "",
      middle_name: middleName,
      mother: motherName,
      mother_job: motherOccupation,
      nationality,
      personal_data_id,
      phone_num: phoneNo || "",
      religion,
      sex,
      others_input: othersInput,
      //createdAt: new Date(),  //comment out since i dont need it
    });

    // student or personnel
    if (accountType === "student") {
      await db.collection("student").doc(userRecord.uid).set({
        department,
        id_num: id_num || idNumber,
        level,
        sec_or_prog: sectionProgram,
      });
    } else if (accountType === "personnel") {
      await db.collection("personnel").doc(userRecord.uid).set({
        personnel_type: personnelType,
        personnel_dept_office: personnelDeptOffice,
        personnel_department: personnelDepartment, // add if teaching
      });
    }

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});

export default router;

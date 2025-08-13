import express from "express";
import { db } from "../firebaseAdmin.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ success: false, message: "No ID number provided." });
    }

    console.log("Searching ID:", search);

    // Fetch all documents from the relevant collections
    const [accountSnapshot, personalDataSnapshot, studentDataSnapshot] = await Promise.all([
      db.collection("account").where("id_num", "==", search).get(),
      db.collection("personal_data").where("id_num", "==", search).get(),
      db.collection("student").where("id_num", "==", search).get()
    ]);
    
    // Get the data from each snapshot, if it exists
    const accountData = accountSnapshot.empty ? {} : accountSnapshot.docs[0].data();
    const personalData = personalDataSnapshot.empty ? {} : personalDataSnapshot.docs[0].data();
    const studentData = studentDataSnapshot.empty ? {} : studentDataSnapshot.docs[0].data();

    // Check if any data was found
    if (Object.keys(accountData).length === 0 && Object.keys(personalData).length === 0 && Object.keys(studentData).length === 0) {
      console.log("ID not found in any collection");
      return res.json({ success: false, message: "ID not found." });
    }

    // Combine all the data into a single object, prioritizing 'personalData'
    const combinedData = {
      ...accountData,
      ...studentData,
      ...personalData,
    };
    
    console.log("Combined Data:", combinedData);

    // Build the personal_data object from combinedData
    const personal_data = {
      id_num: combinedData.id_num || "-",
      last_name: combinedData.last_name || "-",
      first_name: combinedData.first_name || "-",
      middle_name: combinedData.middle_name || "-",
      date_of_birth: `${combinedData.birth_month || "-"} - ${combinedData.birth_day || "-"} - ${combinedData.birth_year || "-"}`,
      sex: combinedData.sex || "-",
      landline_num: combinedData.landline_num || "-",
      phone_num: combinedData.phone_num || "-",
      email: combinedData.email || "-",
      city_address: combinedData.city_address || "-",
      department: combinedData.department || "-",
      level: combinedData.level || "-",
      sec_or_prog: combinedData.sec_or_prog || "-",
      father: combinedData.father || "-",
      father_job: combinedData.father_job || "-",
      mother: combinedData.mother || "-",
      mother_job: combinedData.mother_job || "-",
      living_with: combinedData.living_with || "-",
      religion: combinedData.religion || "-",
      nationality: combinedData.nationality || "-",
      type: combinedData.type || "-",
      dept_or_office: combinedData.dept_or_office || "-"
    };

    // Build the medical_history object from combinedData
    const medical_history = {
        allergy: combinedData.allergy || "-",
        asthma: combinedData.asthma || "-",
        diabetes: combinedData.diabetes || "-",
        heart_disease: combinedData.heart_disease || "-",
        hypertension: combinedData.hypertension || "-",
    };

    return res.json({
      success: true,
      personal_data,
      medical_history
    });

  } catch (err) {
    console.error("Error searching ID:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

export default router;
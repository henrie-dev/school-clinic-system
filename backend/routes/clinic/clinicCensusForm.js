// backend/routes/clinicCensusForm.js
import express from "express";
import { db } from "../../firebaseAdmin.js";
import admin from "firebase-admin";

const router = express.Router();

// This route now correctly fetches all necessary fields for both students and personnel
router.get("/:id_num", async (req, res) => {
    try {
        const id_num = req.params.id_num;
        if (!id_num) {
            return res.status(400).json({ success: false, message: "ID number is required." });
        }

        const [personalDataSnapshot, studentDataSnapshot, personnelDataSnapshot] = await Promise.all([
            db.collection("personal_data").where("id_num", "==", id_num).limit(1).get(),
            db.collection("student").where("id_num", "==", id_num).limit(1).get(),
            db.collection("personnel").where("id_num", "==", id_num).limit(1).get()
        ]);

        if (personalDataSnapshot.empty) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const personalData = personalDataSnapshot.docs[0].data();
        const studentData = studentDataSnapshot.empty ? {} : studentDataSnapshot.docs[0].data();
        const personnelData = personnelDataSnapshot.empty ? {} : personnelDataSnapshot.docs[0].data();

        const birthYear = parseInt(personalData.birth_year, 10);
        let age = null;
        if (!isNaN(birthYear)) {
            const currentYear = new Date().getFullYear();
            age = currentYear - birthYear;
        }

        // Combine data into a single object
        const userDetails = {
            id_num: id_num,
            first_name: personalData.first_name,
            middle_name: personalData.middle_name,
            last_name: personalData.last_name,
            sex: personalData.sex,
            age: age,
            // Student specific
            level: studentData.level,
            section: studentData.sec_or_prog,
            section_sed: studentData.section_sed,
            department: studentData.department,
            // Personnel specific
            type: personnelData.type,
            dep_or_office: personnelData.dep_or_office,
        };

        res.json({ success: true, student: userDetails });
    } catch (error) {
        console.error("Error fetching user data for census:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post("/", async (req, res) => {
    try {
        const censusData = req.body;

        if (!censusData.id_num || !censusData.date || !censusData.first_name || !censusData.last_name || !censusData.purpose_visit) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const dataToSave = {
            id_num: censusData.id_num,
            first_name: censusData.first_name,
            middle_name: censusData.middle_name,
            last_name: censusData.last_name,
            age: censusData.age,
            sex: censusData.sex,
            level: censusData.level ? Number(censusData.level) : null, // Convert level to number
            department: censusData.department,
            personnel_type: censusData.personnel_type,
            dep_or_office: censusData.dep_or_office,
            section: censusData.section,
            section_sed: censusData.section_sed,
            date: censusData.date,
            time_in: censusData.time_in,
            time_out: censusData.time_out,
            purpose_visit: censusData.purpose_visit,
            purpose_other: censusData.purpose_other,
            vital_signs: censusData.vital_signs,
            treatment: censusData.treatment,
            // REMOVED: The timestamp field has been removed
        };

        const newCensusDoc = await db.collection("clinic_daily_census").add(dataToSave);

        res.json({ success: true, message: "Daily census logged successfully.", census_id: newCensusDoc.id });
    } catch (error) {
        console.error("Error logging daily census:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

export default router;
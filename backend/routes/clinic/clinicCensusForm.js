// backend/routes/clinicCensusForm.js
import express from "express";
import { db } from "../../firebaseAdmin.js";
import admin from "firebase-admin";

const router = express.Router();

router.get("/:id_num", async (req, res) => {
    try {
        const id_num = req.params.id_num;

        if (!id_num) {
            return res.status(400).json({ success: false, message: "ID number is required." });
        }

        const [personalDataSnapshot, studentDataSnapshot] = await Promise.all([
            db.collection("personal_data").where("id_num", "==", id_num).limit(1).get(),
            db.collection("student").where("id_num", "==", id_num).limit(1).get()
        ]);

        if (personalDataSnapshot.empty) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        const personalData = personalDataSnapshot.docs[0].data();
        const studentData = studentDataSnapshot.empty ? {} : studentDataSnapshot.docs[0].data();

        // Corrected age calculation to handle string birth_year
        const birthYear = parseInt(personalData.birth_year, 10);
        let age = null;
        if (!isNaN(birthYear)) {
            const currentYear = new Date().getFullYear();
            age = currentYear - birthYear;
        }

        const student = {
            id_num: id_num,
            first_name: personalData.first_name,
            middle_name: personalData.middle_name,
            last_name: personalData.last_name,
            sex: personalData.sex,
            age: age,
            level: studentData.level,
            section: studentData.sec_or_prog,
        };

        res.json({ success: true, student: student });
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post("/", async (req, res) => {
    try {
        const censusData = req.body;

        if (!censusData.id_num || !censusData.date || !censusData.first_name || !censusData.last_name || !censusData.purpose_visit) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newCensusDoc = await db.collection("clinic_daily_census").add({
            ...censusData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ success: true, message: "Daily census logged successfully.", census_id: newCensusDoc.id });
    } catch (error) {
        console.error("Error logging daily census:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.post("/", async (req, res) => {
    try {
        const censusData = req.body;

        if (!censusData.id_num || !censusData.date || !censusData.first_name || !censusData.last_name || !censusData.purpose_visit) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newCensusDoc = await db.collection("clinic_daily_census").add({
            ...censusData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ success: true, message: "Daily census logged successfully.", census_id: newCensusDoc.id });
    } catch (error) {
        console.error("Error logging daily census:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

export default router;
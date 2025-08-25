// backend/routes/register.js
import express from 'express';
import { db, auth } from '../firebaseAdmin.js';

const router = express.Router();

// This helper function now correctly handles empty strings and specific uppercase fields
const prepareDataForFirestore = (dataObject, fieldsToUppercase = []) => {
    const newObj = {};
    for (const key in dataObject) {
        // Ensure the key belongs to the object
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
            const value = dataObject[key];
            if (fieldsToUppercase.includes(key) && typeof value === 'string') {
                newObj[key] = value.toUpperCase();
            } else {
                // Save the original value, or an empty string if it's null/undefined
                newObj[key] = value || '';
            }
        }
    }
    return newObj;
};

router.post('/create', async (req, res) => {
    const { accountData, personalData, studentData, personnelData, clinicData } = req.body;

    if (!accountData || !accountData.email || !accountData.password || !accountData.role) {
        return res.status(400).json({ success: false, message: 'Missing required account data.' });
    }

    try {
        const userRecord = await auth.createUser({
            email: accountData.email.toLowerCase(), // Always use lowercase for Auth
            password: accountData.password,
            emailVerified: false,
            disabled: false,
        });

        const batch = db.batch();
        const id_num = accountData.id_num.toUpperCase();

        // --- Account Collection ---
        const { password, ...accountDataForDb } = accountData;
        const accountRef = db.collection('account').doc();
        batch.set(accountRef, {
            ...prepareDataForFirestore(accountDataForDb, ['role']),
            id_num: id_num, // Ensure ID is uppercase
            email: accountData.email.toLowerCase(), // Ensure email is lowercase
            firebase_uid: userRecord.uid,
            // REMOVED: The created_uid field has been removed
        });

        // --- Role-Specific Collections ---
        const personalFieldsToUpper = ['last_name', 'first_name', 'middle_name', 'city_address', 'father', 'father_job', 'mother', 'mother_job', 'nationality', 'religion', 'sex', 'living_with', 'others_input'];

        if (accountData.role === 'student' && personalData && studentData) {
            const personalRef = db.collection('personal_data').doc();
            batch.set(personalRef, { ...prepareDataForFirestore(personalData, personalFieldsToUpper), id_num });

            const studentRef = db.collection('student').doc();
            batch.set(studentRef, { ...prepareDataForFirestore(studentData, ['department', 'level', 'sec_or_prog', 'section_sed']), id_num });

        } else if (accountData.role === 'personnel' && personalData && personnelData) {
            const personalRef = db.collection('personal_data').doc();
            batch.set(personalRef, { ...prepareDataForFirestore(personalData, personalFieldsToUpper), id_num });
            
            const personnelRef = db.collection('personnel').doc();
            batch.set(personnelRef, { ...prepareDataForFirestore(personnelData, ['type', 'dep_or_office']), id_num });

        } else if (accountData.role === 'clinic' && clinicData) {
            const clinicRef = db.collection('clinic').doc();
            batch.set(clinicRef, { ...prepareDataForFirestore(clinicData, ['last_name', 'first_name', 'middle_name', 'position', 'sex']), id_num, verify: false });
        
        } else if (accountData.role === 'admin') {
            const adminRef = db.collection('admin').doc();
            batch.set(adminRef, { id_num });
        }

        await batch.commit();
        res.status(201).json({ success: true, message: 'Account created successfully!', uid: userRecord.uid });

    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ success: false, message: 'Failed to create account', error: error.message });
    }
});

export default router;
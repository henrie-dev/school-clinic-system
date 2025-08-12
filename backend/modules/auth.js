import admin from "firebase-admin";
import { db } from "../../firebaseConfig.js"; // This will now use Admin SDK's Firestore

export async function registerUser(email, password, role, id_num) {
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Store role & id_num in Firestore (but NOT password)
    await db.collection("account").doc(userRecord.uid).set({
      email,
      role,
      id_num,
    });

    console.log(`${role} account created for ${email}`);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

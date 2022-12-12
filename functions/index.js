const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

exports.setupUserDocument = functions.auth.user().onCreate(async (user) => {
    await db.collection('users').doc(user.uid).create({
        tasks: [],
        completedTasks: []
    });
});
// Types
import type { Data } from '../types/main';

import './main.css';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, updateDoc, doc, getDoc } from 'firebase/firestore';

import isSafari from '@humanfriend22/is-safari';

// Firebase
const app = initializeApp({
    apiKey: "AIzaSyA5ymGNOYKrxeLXwul1LtuQzG-zMhxYfYc",
    authDomain: "todo-7a5ef.firebaseapp.com",
    projectId: "todo-7a5ef",
    storageBucket: "todo-7a5ef.appspot.com",
    messagingSenderId: "37940877658",
    appId: "1:37940877658:web:bf38a1322399033afcfb63"
});

const auth = getAuth(app);
const db = getFirestore(app);

// Variables
const authButton = document.getElementById('auth-button')!;

let data: Data = {
    tasks: [],
    completedTasks: []
};

const input = document.querySelector('input')!,
    todoList = document.getElementById('todo-list')!,
    completedTodoList = document.getElementById('completed-todo-list')!;

// Functions
const updateDOM = () => {
    todoList.innerHTML = '';
    completedTodoList.innerHTML = ''

    for (const task of data.tasks) {
        const li = document.createElement('li');
        li.innerText = task;
        todoList.appendChild(li);
    };

    const hideDivider = data.completedTasks.length === 0;

    document.querySelector<HTMLElement>('.divider')!.style.display = hideDivider ? 'none' : '';


    for (const completedTask of data.completedTasks) {
        const li = document.createElement('li');
        li.innerText = completedTask;
        completedTodoList.appendChild(li);
    };
};

const save = async () => {
    window.localStorage.setItem('tasks', JSON.stringify(data));

    if (auth.currentUser) {
        await updateDoc(
            doc(db, 'users', auth.currentUser.uid),
            data
        )
    }
};

const download = async () => {
    const snapshot = await getDoc(
        doc(db, 'users', auth.currentUser!.uid)
    );

    data = snapshot.data() as Data;
    window.localStorage.setItem('tasks', JSON.stringify(data));

    updateDOM();
};

// Listeners
document.querySelector('form')!.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (input.value !== '') {
        const li = document.createElement('li');
        li.innerText = input.value;
        todoList.appendChild(li);

        data.tasks.push(input.value);
        input.value = '';
        await save();
    }
});

todoList.addEventListener('click', async (event) => {
    if (event.target !== todoList) {
        const i: number = Array.prototype.indexOf.call(todoList.children, event.target);

        data.tasks.splice(i, 1);
        // @ts-ignore
        data.completedTasks.push(event.target.innerText);

        // @ts-ignore
        event.target!.remove();

        updateDOM();

        await save();
    }
});

completedTodoList.addEventListener('click', async (event) => {
    if (event.target !== completedTodoList) {
        const i: number = Array.prototype.indexOf.call(completedTodoList.children, event.target);

        data.completedTasks.splice(i, 1);
        // @ts-ignore
        data.tasks.push(event.target.innerText);

        // @ts-ignore
        event.target!.remove();

        updateDOM();

        await save();
    }
});

document.getElementById('empty-completed-button')!.addEventListener('click', () => {
    data.completedTasks = [];

    updateDOM();

    return save();
});

authButton.addEventListener('click', async () => {
    if (auth.currentUser) {
        auth.signOut();
    } else {
        const provider = new GoogleAuthProvider();

        // Popup on Safari
        await (isSafari() ? signInWithPopup : signInWithRedirect)(auth, provider);
        await download(); // Only runs on Safari
    }
});

// Auth
onAuthStateChanged(auth, async user => {
    try {
        const stored = JSON.parse(window.localStorage.getItem('tasks') || 'this shall throw');

        if (Array.isArray(stored.tasks) && Array.isArray(stored.completedTasks)) data = stored;

        updateDOM();
    } catch (err) { }

    if (user) {
        await download();
        authButton.parentElement!.dataset.tip = 'Log out';
        authButton.dataset.ariaLabel = 'Log out';
    }

    authButton.querySelector('svg:not(.hidden)')?.classList.add('hidden');
    authButton.children[user ? 0 : 1].classList.remove('hidden');
});

input.focus();
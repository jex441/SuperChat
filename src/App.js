import "./App.css";
import React, { useRef, useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import "tailwindcss/tailwind.css";

firebase.initializeApp({
  apiKey: "AIzaSyCDH2xysIHGBJ1QQEntV65qtpt8ReB0d3Y",
  authDomain: "superchat-1cd79.firebaseapp.com",
  projectId: "superchat-1cd79",
  storageBucket: "superchat-1cd79.appspot.com",
  messagingSenderId: "570227916680",
  appId: "1:570227916680:web:6e7d6d098c529c8afb843d",
});

const firestore = firebase.firestore();
const auth = firebase.auth();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  return (
    <div className="p-6 flex max-w-md mx-auto bg-white rounded-xl shadow-md">
      <div className="mx-3 text-gray-600">
        Hello! Sign in with Google to enter the chat!
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 m-3 rounded"
          onClick={signInWithGoogle}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <div className="flex justify-between p-3 bg-white">
        <span className="text-gray-600">
          Hello
          <span className="text-indigo-700">
            {" "}
            {auth.currentUser.displayName.split(" ")[0]}{" "}
          </span>
        </span>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold p-1 rounded"
          onClick={() => auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt", "desc").limit(15);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="p-6 my-5 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <SignOut />
      <div className="block overflow-scroll bg-white h-64">
        {messages &&
          messages
            .slice(0)
            .reverse()
            .map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>

      <form className="" onSubmit={sendMessage}>
        <div className="flex">
          <textarea
            className="m-4 border-2 w-full border-gray-300"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Say something nice"
          />
        </div>

        <button
          className="bg-green-500 hover:bg-green-600 mx-4 inlineblock text-white font-bold px-4 rounded"
          type="submit"
          disabled={!formValue}
        >
          Post
        </button>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`flex items-center ${messageClass}`}>
      <img
        className="rounded-full h-11 w-11 flex p-2"
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
      />
      <p className="block">{text}</p>
    </div>
  );
}

export default App;

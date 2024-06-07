import React, { useEffect, useRef, useState } from "react";
import firebase from "firebase/compat/app";
import ChatMessage from "@/components/ChatMessage/ChatMessage.jsx";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { firestore } from "@/utils/firebase/firebase";

function ChatRoom({ userID, doctorID, role }) {
  const [currRole, SetCurrRole] = useState("");
  console.log("ini doctor id", doctorID);
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");

  //   const { uid, photoURL } = auth.currentUser;

  const q = messagesRef
    .orderBy("createdAt")
    .where("uid", "in", [doctorID, userID])
    .where("uid_2", "in", [doctorID, userID]);

  const [messages, loading, error] = useCollectionData(q, {
    idField: "id",
  });
  const [formValue, setFormValue] = useState("");

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log("error query:", error);
    return <div>Error loading message</div>;
  }

  const uid = role === "User" ? userID : doctorID;
  const uid_2 = role === "User" ? doctorID : userID;

  const sendMessage = async (e) => {
    e.preventDefault();

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      uid_2: uid_2,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="flex flex-col h-[75vh] w-full max-w-3xl mx-auto bg-slate-500 shadow-lg rounded-lg">
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages &&
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} uid={userID} />
            ))}
          <span ref={dummy}></span>
        </main>
        <form
          onSubmit={sendMessage}
          className="flex items-center p-4 border-t bg-slate-600"
        >
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Say something nice"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-black"
          />
          <button
            type="submit"
            disabled={!formValue}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            🕊️
          </button>
        </form>
      </div>
    </>
  );
}
export default ChatRoom;

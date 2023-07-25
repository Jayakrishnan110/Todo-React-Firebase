import React from "react";
import { useState, useEffect } from "react";
import { TextField, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCOqBoG65hH5UrXsQj6k69Pz7E-yk0iM68",
  authDomain: "todo-ed96c.firebaseapp.com",
  projectId: "todo-ed96c",
  storageBucket: "todo-ed96c.appspot.com",
  messagingSenderId: "146540929903",
  appId: "1:146540929903:web:f42635d981fc389a2f7e9a"
};


function TodoApp() {
  const [todoList, setTodoList] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [updatedCount, setUpdatedCount] = useState(0);
  const [updateMode, setUpdateMode] = useState(-1);
  const [updatedItemText, setUpdatedItemText] = useState("");
  const [completedCount, setCompletedCount] = useState(0);


  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "todos"));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTodoList(data);

        setTodoList((prevTodoList) =>
          prevTodoList.map((item) => ({
            ...item,
            updated: false,
          }))
        );

        const completedItems = data.filter((item) => item.completed);
        setCompletedCount(completedItems.length);
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };
    fetchData();
  }, [db]);

  const handleAddItem = async () => {
    if (newItem.trim() !== "") {
      try {
        const newItemData = { item: newItem, completed: false };
        const docRef = await addDoc(collection(db, "todos"), newItemData);
        setTodoList([...todoList, { id: docRef.id, ...newItemData }]);
        setNewItem("");
      } catch (error) {
        console.error("Error adding item to Firestore: ", error);
      }
    }
  };

  const handleUpdateItem = async (index, updatedItem) => {
    const itemToUpdate = todoList[index];
    if (!itemToUpdate.updated) {
      const updatedList = [...todoList];
      updatedList[index].item = updatedItem;
      updatedList[index].updated = true;

      setTodoList(updatedList);
      setUpdatedCount(updatedCount + 1);


      try {
        const todoItemRef = doc(db, "todos", updatedList[index].id);
        await updateDoc(todoItemRef, { item: updatedItem });
        setUpdateMode(-1);
      } catch (error) {
        console.error("Error updating item in Firestore: ", error);
      }
    }
  };


  const handleMarkCompleted = async (index) => {
    const updatedList = [...todoList];
    updatedList[index].completed = !updatedList[index].completed;
    setTodoList(updatedList);


    const completedItems = updatedList.filter((item) => item.completed);
    setCompletedCount(completedItems.length);

    try {
      const todoItemRef = doc(db, "todos", updatedList[index].id);
      await updateDoc(todoItemRef, { completed: updatedList[index].completed });
    } catch (error) {
      console.error("Error updating item in Firestore: ", error);
    }
  };

  const handleDeleteItem = async (index) => {
    const updatedList = todoList.filter((_, i) => i !== index);
    setTodoList(updatedList);

    try {
      const deletedItemId = todoList[index].id;
      const todoItemRef = doc(db, "todos", deletedItemId);
      await deleteDoc(todoItemRef);
    } catch (error) {
      console.error("Error deleting item from Firestore: ", error);
    }
  };


  const handleUpdateMode = (index) => {
    setUpdateMode(index);
    setUpdatedItemText(todoList[index].item);
  };

  const handleCancelUpdate = () => {
    setUpdateMode(-1);
  };

  // const completedCount = todoList.filter((item) => item.completed).length;
  const totalCount = todoList.length;

  return (
    <div className="App">
      <h1>Todo List</h1>
      <div className="todo-box">
        <div className="add-todo">
          <IconButton className="plus-btn" onClick={handleAddItem}>
            <AddIcon />
          </IconButton>
          <TextField
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter a new task"
          />
        </div>
        {totalCount === 0 ? (
          <p className="message">No items in the list.</p>
        ) : (
          <>
            <CompletedCounter completed={completedCount} total={totalCount} />
            <UpdatedCounter updated={updatedCount} total={totalCount} />
            <ul className="todo-container">
              {todoList.map((item, index) => (
                <li key={index} className={item.completed ? "completed" : ""}>
                  <div className="todo-item">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleMarkCompleted(index)}
                    />
                    <div className="input-container">
                      {/* <IconButton className="update-btn" onClick={() => handleUpdateMode(index)}>
                      <EditIcon />
                    </IconButton> */}
                      {updateMode === index ? (
                        <TextField
                          type="text"
                          value={updatedItemText}
                          onChange={(e) => setUpdatedItemText(e.target.value)}
                        />
                      ) : (
                        <span>{item.item}</span>
                      )}
                    </div>
                    {updateMode === index ? (
                      <>
                        <IconButton
                          className="update-btn"
                          onClick={() => handleUpdateItem(index, updatedItemText)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton className="update-btn" onClick={handleCancelUpdate}>
                          <CloseIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        className="update-btn"
                        onClick={() => handleUpdateMode(index)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton className="update-btn red-button" onClick={() => handleDeleteItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function CompletedCounter({ completed, total }) {
  return <p>Completed {completed}/{total}</p>;
}

function UpdatedCounter({ updated, total }) {
  return <p>Updated {updated}/{total}</p>;
}

export default TodoApp;

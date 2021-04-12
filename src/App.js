import React, { useEffect, useRef, useState } from "react";
import { DataStore } from "@aws-amplify/datastore";
import { Todo } from "./models";

import "./App.css";

const initialFormData = { name: "", description: "" };

function App() {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [editFormData, setEditFormData] = useState({ ...initialFormData });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [toDos, setToDos] = useState([]);
  const editID = useRef(null);

  const queryToDos = async () => {
    console.log("querying...");
    const result = await DataStore.query(Todo);
    setToDos([...result]);
  };

  const closeModal = () => {
    setEditFormData({ ...initialFormData });
    setModalIsOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("are you sure you want to delete this record?")) {
      const modelToDelete = await DataStore.query(Todo, id);
      DataStore.delete(modelToDelete);
      queryToDos();
    }
  };

  const openModal = async (id) => {
    const original = await DataStore.query(Todo, id);
    editID.current = original;
    setEditFormData({ name: original.name, description: original.description });
    setModalIsOpen(true);
  };

  const onChange = (event) => {
    const { name, value } = event.currentTarget;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditOnChange = (event) => {
    const { name, value } = event.currentTarget;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditOnSubmit = async (event) => {
    event.preventDefault();
    const { name, description } = editFormData;
    await DataStore.save(
      Todo.copyOf(editID.current, (updated) => {
        updated.name = name;
        updated.description = description;
      }),
    );
    closeModal();
    editID.current = null;
    setEditFormData({ ...initialFormData });
    queryToDos();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const { name, description } = formData;
    await DataStore.save(
      new Todo({
        name,
        description,
      }),
    );
    setFormData({ ...initialFormData });
    queryToDos();
  };

  useEffect(() => {
    queryToDos();
    console.log("f ekt");
  }, []);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Add a new item:</label>
        <input
          placeholder="name"
          name="name"
          value={formData.name}
          onChange={onChange}
        />
        <input
          placeholder="description"
          name="description"
          value={formData.description}
          onChange={onChange}
        />
        <button onClick={onSubmit} title="add new">
          <span class="material-icons">add</span>
        </button>
      </form>
      <table className="dataTable">
        <caption>AWS Amplify To-Do List</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {toDos.map(({ id, name, description }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>{description}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  title="delete"
                >
                  <span class="material-icons">delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => openModal(id)}
                  title="edit"
                >
                  <span class="material-icons">edit</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="modal"
        style={{ display: modalIsOpen ? "initial" : "none" }}
      >
        <div className="modalBody">
          <form className="modalForm" onSubmit={handleEditOnSubmit}>
            <input
              name="name"
              value={editFormData.name}
              onChange={handleEditOnChange}
            />
            <input
              name="description"
              value={editFormData.description}
              onChange={handleEditOnChange}
            />
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <button>Update</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;

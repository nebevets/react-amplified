import React, { useEffect, useState } from "react";
import { DataStore } from "@aws-amplify/datastore";
import { Todo } from "./models";

import "./App.css";

const initialFormData = { name: "", description: "" };

function App() {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [toDos, setToDos] = useState([]);

  const handleDelete = async (id) => {
    if (window.confirm("are you sure you want to delete this record?")) {
      const modelToDelete = await DataStore.query(Todo, id);
      DataStore.delete(modelToDelete);
    }
  };

  const handleUpdate = async (id) => {
    const original = await DataStore.query(Todo, id);
    // await Todo.copyOf(original, updated => {
    //   console.log(updated.name, updated.description);
    // });
  };

  const onChange = (event) => {
    const { name, value } = event.currentTarget;
    setFormData({ ...formData, [name]: value });
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
  };

  useEffect(() => {
    const queryToDos = async () => {
      const result = await DataStore.query(Todo);
      setToDos([...result]);
    };
    queryToDos();
  }, [toDos]);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input name="name" value={formData.name} onChange={onChange} />
        <input
          name="description"
          value={formData.description}
          onChange={onChange}
        />
        <button onClick={onSubmit}>
          <span class="material-icons">add</span>
        </button>
      </form>
      <table>
        <caption>AWS Amplify To-Do List</caption>
        <thead>
          <tr>
            <td>Name</td>
            <td>Description</td>
            <td>Delete</td>
            <td>Update</td>
          </tr>
        </thead>
        <tbody>
          {toDos.map(({ id, name, description }) => (
            <tr>
              <td>{name}</td>
              <td>{description}</td>
              <td>
                <button type="button" onClick={() => handleDelete(id)}>
                  <span class="material-icons">delete</span>
                </button>
              </td>
              <td>
                <button type="button" onClick={() => handleUpdate(id)}>
                  <span class="material-icons">edit</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

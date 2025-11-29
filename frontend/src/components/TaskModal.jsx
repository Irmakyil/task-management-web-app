import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TaskModal.module.css';

// O anki tarihi YYYY-MM-DD formatında alır 
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// O anki saati HH:MM formatında alır 
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const TaskModal = ({ onClose, taskToEdit, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Job');
  
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [dueTime, setDueTime] = useState(getCurrentTime()); 
  
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      if (taskToEdit.dueDate) {
        setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
      }
      if (taskToEdit.dueTime) { 
        setDueTime(taskToEdit.dueTime);
      }
    }
  }, [taskToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Geçmiş tarih/saat kontrolü
    if (dueDate && dueTime) {
      const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
      const now = new Date();
      
      if (selectedDateTime < new Date(now.getTime() - 60000)) { 
        setError('You cannot set a deadline in the past.');
        return; 
      }
    }
    
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const taskStatus = taskToEdit ? taskToEdit.status : 'Incomplete';
    const taskData = { 
      title, 
      description, 
      category, 
      dueDate, 
      dueTime, 
      status: taskStatus 
    };

    try {
      if (taskToEdit) {
        await axios.put(
          `http://localhost:5050/api/tasks/${taskToEdit._id}`,
          taskData,
          config
        );
      } else {
        await axios.post('http://localhost:5050/api/tasks', taskData, config);
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the task.');
      console.error(err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
        
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Görev Adı (Title) */}
          <div className={styles.formGroup}>
            <label htmlFor="title">Task Name</label>
            <input
              type="text"
              id="title"
              placeholder="Exp: Prepare the project report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Açıklama (Description) */}
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="A detailed description of your mission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Tarih/Saat ve Kategori için yatay (row) yerleşim */}
          <div className={styles.row}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label htmlFor="dueDate">Deadline</label>
              <div className={styles.dateTimeContainer}>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.dateInput}
                  min={getTodayDate()} 
                />
                <input
                  type="time"
                  id="dueTime"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
            </div>
            
            {/* Kategori (Category) */}
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-category={category} 
              >
                <option value="Job">Job</option>
                <option value="Personal">Personal</option>
                <option value="Hobby">Hobby</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Form Eylemleri (Butonlar) */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {taskToEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
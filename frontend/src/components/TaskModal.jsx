import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TaskModal.module.css';

// Bu, geçmiş tarih/saat seçilmesini engelleyen yardımcı fonksiyondur
const getMinDateTime = () => {
  const now = new Date();
  // Saat dilimi (timezone) farkını hesaba kat
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  // ISO formatına çevir (YYYY-MM-DDTHH:MM)
  return now.toISOString().slice(0, 16);
};

const TaskModal = ({ onClose, taskToEdit, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Job');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [error, setError] = useState(null);

  // (isDateInputFocused state'i artık gerekli değil, 
  //  tarayıcı dilini İngilizce yaptığınız için placeholder düzeldi)

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      // (status state'i kaldırıldı)
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

    // 1. Geçmiş tarih kontrolü
    const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
    const now = new Date();

    if (dueDate && selectedDateTime < now) {
      setError('Deadline cannot be in the past.');
      return;
    }

    // --- HATA DÜZELTMESİ BURADA ---
    // 2. Gönderilecek 'status'ü belirle
    // Eğer düzenleme modundaysak (taskToEdit varsa), mevcut statüyü koru.
    // Eğer yeni görev oluşturuyorsak (taskToEdit null ise), 'Incomplete' olarak ayarla.
    const taskStatus = taskToEdit ? taskToEdit.status : 'Incomplete';

    // 3. 'status'ü taskData objesine ekle
    const taskData = { 
      title, 
      description, 
      category, 
      dueDate, 
      dueTime, 
      status: taskStatus // <-- EKSİK ALAN BURAYA EKLENDİ
    };
    // --- DÜZELTME BİTTİ ---

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (taskToEdit) {
        // Düzenleme (PUT)
        await axios.put(
          `http://localhost:5000/api/tasks/${taskToEdit._id}`,
          taskData,
          config
        );
      } else {
        // Yeni Görev (POST)
        await axios.post('http://localhost:5000/api/tasks', taskData, config);
      }
      onTaskSaved(); // Listeyi yenile
      onClose(); // Modalı kapat
    } catch (err) {
      // Backend'den gelen asıl hatayı göster (daha bilgilendirici)
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

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="A detailed description of your mission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

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
                  min={getMinDateTime().split('T')[0]} // Geçmiş tarihleri engelle
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

          {/* "Mark as completed" checkbox'ı buradan kaldırıldı */}

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


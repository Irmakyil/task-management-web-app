import React from 'react';
import styles from './TaskItem.module.css';
import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

// --- DÜZELTİLDİ: "Invalid Date" hatasını çözen fonksiyon ---
const formatDisplayDate = (dateString) => {
  if (!dateString) return null;
  // MongoDB'den gelen ISO 8601 formatındaki tarihi doğrudan işle
  const date = new Date(dateString); 
  
  // new Date() başarısız olursa (örn: "Invalid Date")
  if (isNaN(date.getTime())) {
    console.error("Invalid date value received:", dateString);
    return "Invalid Date";
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Saati sıfırlayarak sadece gün bazlı karşılaştırma yap
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

const TaskItem = ({ task, onDelete, onEdit, onToggleStatus }) => {
  
  // 1. KATEGORİ KENARLIK SINIFI
  const getCategoryBorderClass = (category) => {
    switch (category.toLowerCase()) {
      case 'job': return styles.borderJob;
      case 'personal': return styles.borderPersonal;
      case 'hobby': return styles.borderHobby;
      case 'other': return styles.borderOther;
      default: return styles.borderOther;
    }
  };
  
  // 2. KATEGORİ ETİKET (TAG) SINIFI
  const getCategoryTagClass = (category) => {
    switch (category.toLowerCase()) {
      case 'job': return styles.tagJob;
      case 'personal': return styles.tagPersonal;
      case 'hobby': return styles.tagHobby;
      case 'other': return styles.tagOther;
      default: return styles.tagOther;
    }
  };

  // 3. SON TARİH / UYARI BİLGİSİ
  let isUrgent = false;
  let urgentMessage = null;
  if (task.status !== 'Completed' && task.dueDate) {
    const dueDateTimeString = `${task.dueDate.split('T')[0]}T${task.dueTime || '00:00:00'}`;
    const dueDate = new Date(dueDateTimeString);
    const now = new Date();
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      isUrgent = true;
      urgentMessage = "Overdue";
    } else if (hoursRemaining <= 24) {
      isUrgent = true;
      urgentMessage = `Last ${Math.ceil(hoursRemaining)} hour!`;
    }
  }

  // 4. KART SINIFLARINI AYARLA (Kenarlık Rengi)
  // --- DÜZELTİLDİ: Hatalı fonksiyon çağrısını düzelttik ---
  const cardClasses = [
    styles.taskCard,
    task.status === 'Completed' ? styles.borderCompleted : (isUrgent ? styles.borderUrgent : getCategoryBorderClass(task.category))
  ];

  // --- İKON TIKLAMALARINI YÖNETME ---
  const handleEdit = (e) => {
    e.stopPropagation(); 
    onEdit(task);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id);
  };
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleStatus(task);
  };
  
  return (
    <div className={cardClasses.join(' ')} onClick={handleEdit}>
      
      <div className={styles.cardHeader}>
        <h3>{task.title}</h3>
        <div className={styles.actions}>
          <button onClick={handleEdit} className={styles.iconButton}>
            <FaEdit />
          </button>
          <button onClick={handleDelete} className={`${styles.iconButton} ${styles.deleteButton}`}>
            <FaTrash />
          </button>
        </div>
      </div>

      <div className={styles.cardMiddle}>
        {task.dueDate ? (
          <>
            <span className={styles.dateTime}>
              <FaCalendarAlt /> {formatDisplayDate(task.dueDate)}
            </span>
            {task.dueTime && (
              <span className={styles.dateTime}>
                <FaClock /> {task.dueTime}
              </span>
            )}
          </>
        ) : (
          <span className={styles.dateTime}>&nbsp;</span>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.footerLeft}>
          <span className={`${styles.categoryTag} ${getCategoryTagClass(task.category)}`}>
            {task.category}
          </span>
          {isUrgent && (
            <span className={styles.urgentText}>
              <FaExclamationTriangle /> {urgentMessage}
            </span>
          )}
        </div>
        
        <button className={styles.checkButton} onClick={handleToggle}>
          {task.status === 'Completed' ? (
            <FaCheckCircle className={styles.checkCompleted} />
          ) : (
            <FaRegCheckCircle className={styles.checkPending} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;


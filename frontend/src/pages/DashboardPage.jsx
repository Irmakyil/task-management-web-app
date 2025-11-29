import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  //STATE'ler
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTasks();
    }
  }, [navigate]);

  // API FONKSİYONLARI (CRUD)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5050/api/tasks', config);
      setTasks(data);
      setLoading(false);
    } catch (err) { setError('Could not load tasks.'); setLoading(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5050/api/tasks/${taskId}`, config);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (err) { setError('Could not delete task.'); }
    }
  };
  
  const handleToggleTaskStatus = async (taskToToggle) => {
    const originalTasks = [...tasks];
    const newStatus = taskToToggle.status === 'Completed' ? 'Incomplete' : 'Completed';
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskToToggle._id ? { ...task, status: newStatus } : task
      )
    );
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `http://localhost:5050/api/tasks/${taskToToggle._id}`,
        { status: newStatus },
        config
      );
    } catch (err) {
      setError('Could not update task status. Please try again.');
      setTasks(originalTasks);
    }
  };

  const handleOpenModal = () => { setIsModalOpen(true); setTaskToEdit(null); };
  const handleOpenEditModal = (task) => { setIsModalOpen(true); setTaskToEdit(task); };
  const handleCloseModal = () => { setIsModalOpen(false); setTaskToEdit(null); };
  const handleTaskSaved = () => { fetchTasks(); };

  //FİLTRELEME
  const categories = ['All', 'Job', 'Personal', 'Hobby', 'Other'];
  const statuses = ['All', 'Incomplete', 'Completed'];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const categoryMatch = categoryFilter === 'All' || task.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [tasks, statusFilter, categoryFilter]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
    {/* Başlık ve "Yeni Görev" butonu */}
      <div className={styles.tasksHeader}>
        <h1>Tasks</h1>
        {error && <p className={styles.pageError}>{error}</p>}
        <button className={styles.addButton} onClick={handleOpenModal}>
          + Create New Task
        </button>
      </div>

    {/* Filtreleme Dropdown'ları */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroupWrapper}>
          <div className={styles.filterWrapper}>
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-category={statusFilter === 'All' ? 'All' : 'Other'}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterWrapper}>
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              data-category={categoryFilter}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Görev Listesi */}
      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <p>No tasks found for these filters.</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onDelete={handleDeleteTask} 
              onEdit={handleOpenEditModal}
              onToggleStatus={handleToggleTaskStatus}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <TaskModal 
          onClose={handleCloseModal} 
          taskToEdit={taskToEdit} 
          onTaskSaved={handleTaskSaved} 
        />
      )}
    </>
  );
};

export default DashboardPage;
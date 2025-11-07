import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StatisticsPage.module.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const chartRef = useRef(null);
  
  // --- YENİ EKLENDİ: Tema bazlı metin rengi state'i ---
  const [chartTextColor, setChartTextColor] = useState('#F0F0FF'); // Varsayılan (koyu mod)

  // --- YENİ EKLENDİ: Temayı kontrol eden useEffect ---
  useEffect(() => {
    // index.css'ten gelen renkleri oku
    const lightModeColor = '#212529'; // Açık mod metin rengi (koyu gri)
    const darkModeColor = '#F0F0FF';  // Koyu mod metin rengi (açık beyaz)

    // O anki temayı localStorage'dan veya HTML etiketinden al
    const currentTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';

    setChartTextColor(currentTheme === 'light' ? lightModeColor : darkModeColor);
  }, []); // Sayfa yüklendiğinde bir kez çalışır

  const processDataForChart = (stats) => {
    const categories = stats.map(s => s.category);
    const completedData = stats.map(s => {
      const completed = s.statuses.find(status => status.status === 'Completed');
      return completed ? completed.count : 0;
    });
    const incompleteData = stats.map(s => {
      const incomplete = s.statuses.find(status => status.status === 'Incomplete');
      return incomplete ? incomplete.count : 0;
    });
    return {
      labels: categories,
      datasets: [
        // DÜZELTME: Renkler sabit kodlu (Chart.js CSS değişkenlerini okuyamaz)
        { label: 'Completed', data: completedData, backgroundColor: '#3DCC91' },
        { label: 'Incomplete', data: incompleteData, backgroundColor: '#FBBF24' },
      ],
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/tasks/stats', config);
        setChartData(processDataForChart(data));
        setLoading(false);
      } catch (err) {
        setError('Could not load stats.');
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const handleExportAsPNG = () => {
    if (!chartRef.current) { return; }
    const base64Image = chartRef.current.toBase64Image('image/png');
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'task-analysis-chart.png';
    link.click();
  };

  // --- GÜNCELLENMİŞ GRAFİK OPSİYONLARI ---
  // Yazı renkleri artık dinamik 'chartTextColor' state'inden geliyor
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartTextColor, // Dinamik renk
        },
      },
      title: {
        display: true,
        text: 'Task Distribution by Category',
        color: chartTextColor, // Dinamik renk
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: chartTextColor, // Dinamik renk
        },
        grid: {
          color: 'rgba(160, 160, 184, 0.2)', // Kılavuz çizgileri (soluk)
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: chartTextColor, // Dinamik renk
        },
        grid: {
          color: 'rgba(160, 160, 184, 0.2)', // Kılavuz çizgileri (soluk)
        },
      },
    },
  };
  // --- GÜNCELLEME BİTTİ ---

  if (loading) return <div>Loading Stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Task Analysis</h1>
        <button className={styles.exportButton} onClick={handleExportAsPNG}>
          Export Graph
        </button>
      </div>
      <div className={styles.chartContainer}>
        {chartData && chartData.labels.length > 0 ? (
          <Bar ref={chartRef} options={options} data={chartData} />
        ) : (
          <p>No statistics found. Add some tasks first.</p>
        )}
      </div>
    </>
  );
};

export default StatisticsPage;
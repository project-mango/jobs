"use client";
// import Image from 'next/image'
import React, { useState } from 'react';
// import styles from './page.module.css'

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleApplyToJobs = async () => {
      setLoading(true);
      try {
          const response = await fetch('http://localhost:3000/api', { method: 'POST' });
          const data = await response.json();
          alert(data.message); // Displaying the message
      } catch (error) {
          console.error('Error applying to jobs:', error);
          alert('Error applying to jobs');
      }
      setLoading(false);
  };

  return (
      <div>
          <button onClick={handleApplyToJobs} disabled={loading}>
              {loading ? 'Applying...' : 'Apply to Jobs'}
          </button>
      </div>
  );
}
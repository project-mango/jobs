"use client";
// import Image from 'next/image'
import React, { useState, useEffect } from 'react';
// import styles from './page.module.css'
import styles from './styles/projectMangoStyle.module.css';
import supabase from './data/supabase';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

    // Effect to check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { data: session } = await supabase.auth.getSession();
            setAuthenticated(session.session != null && session.session.access_token != null);
        };

        checkAuth();
    }, []);

    // Handlers for form events
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
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
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
        try {
            let { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            else{
                setAuthenticated(true);
            }
        } catch (error) {
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
  };
  return (
        <>{authenticated? <><nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
            <a className={`navbar-brand ${styles.homeTabStyle}`} href="#">Project Mango</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
                <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li className="nav-item">
                <a className="nav-link" href="#">Something else eventually</a>
                </li>
            </ul>
            </div>
        </div>
      </nav>
      <div className="container-fluid">
      
      <div className="col-2">
      <div className="row">
        <div className="col">
            <div className="mb-3">
                <label htmlFor="applicantName" className="form-label">Applicant Name</label>
                <select className="form-select" id="applicantName" aria-label="Applicant Name dropdown">
                    <option value>Please select</option>
                    <option value="1">Applicant One</option>
                    <option value="2">Applicant Two</option>
                    <option value="3">Applicant Three</option>
                </select>
            </div>
        </div>
      </div>
        <div className="row">
        <button className={styles.applyButton} onClick={handleApplyToJobs} disabled={loading}>
              {loading ? 
            <><span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span><span>Applying...</span></>
          : <span className={styles.buttonStyle}>Start Application Process</span>}
          </button>
        </div>
      </div>

          
          
      </div></>
      :<>
      <div className="d-flex justify-content-center align-items-center h-100">
      <div className="card" style={{ width: '18rem' }}>
        <div className="card-body">
          <h5 className="card-title">Sign Up for Updates</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="emailInput" className="form-label">
                Email address
                </label>
                <input
                type="email"
                className="form-control"
                id="emailInput"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange} 
                required
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : 'Sign Up'}
            </button>
            </form>

        </div>
      </div>
    </div>
      </>
      }
          
        </>
  );
}
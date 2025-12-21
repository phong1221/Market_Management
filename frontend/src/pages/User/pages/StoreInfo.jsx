import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import Header from '../components/Header';
import '../css/storeInfo.css';

const StoreInfo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <div className="store-info-container">
        <div className="store-info-content">
          <h1 className="store-info-title">Store Information</h1>
          
          <div className="store-info-section">
            <h2>About HomeMart</h2>
            <p>
              HomeMart is your trusted partner for all your shopping needs. We offer a wide range of 
              high-quality products including groceries, household items, electronics, fashion, and more. 
              Our mission is to provide exceptional service and the best shopping experience for our customers.
            </p>
          </div>

          <div className="store-info-grid">
            <div className="store-info-card">
              <FaMapMarkerAlt className="store-info-icon" />
              <h3>Address</h3>
              <p>123 Shopping Street</p>
              <p>District 1, Ho Chi Minh City</p>
              <p>Vietnam</p>
            </div>

            <div className="store-info-card">
              <FaPhone className="store-info-icon" />
              <h3>Phone</h3>
              <p>Hotline: 1900-1234</p>
              <p>Support: 1900-5678</p>
            </div>

            <div className="store-info-card">
              <FaEnvelope className="store-info-icon" />
              <h3>Email</h3>
              <p>info@homemart.com</p>
              <p>support@homemart.com</p>
            </div>

            <div className="store-info-card">
              <FaClock className="store-info-icon" />
              <h3>Opening Hours</h3>
              <p>Monday - Friday: 8:00 AM - 10:00 PM</p>
              <p>Saturday - Sunday: 9:00 AM - 11:00 PM</p>
            </div>
          </div>

          <div className="store-info-section">
            <h2>Follow Us</h2>
            <div className="store-info-social">
              <a href="#" className="social-link">
                <FaFacebook />
                <span>Facebook</span>
              </a>
              <a href="#" className="social-link">
                <FaInstagram />
                <span>Instagram</span>
              </a>
              <a href="#" className="social-link">
                <FaTwitter />
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreInfo;


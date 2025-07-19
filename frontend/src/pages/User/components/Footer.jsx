import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="footer-user">
    <div className="footer-content">
      <div className="footer-section">
        <h3>MarketMingle</h3>
        <p>Your trusted partner for fresh groceries and quality products delivered right to your doorstep.</p>
        <div className="social-links">
          <a href="#" className="social-link"><FaFacebook /></a>
          <a href="#" className="social-link"><FaTwitter /></a>
          <a href="#" className="social-link"><FaInstagram /></a>
          <a href="#" className="social-link"><FaLinkedin /></a>
        </div>
      </div>
      
      <div className="footer-section">
        <h4>Contact Info</h4>
        <div className="contact-item">
          <FaPhone />
          <span>+1 (555) 123-4567</span>
        </div>
        <div className="contact-item">
          <FaEnvelope />
          <span>info@marketmingle.com</span>
        </div>
        <div className="contact-item">
          <FaMapMarkerAlt />
          <span>123 Market Street, City, State 12345</span>
        </div>
      </div>
      
      <div className="footer-section">
        <h4>Quick Links</h4>
        <ul className="footer-links">
          <li><a href="#">About Us</a></li>
          <li><a href="#">Our Products</a></li>
          <li><a href="#">Delivery Info</a></li>
          <li><a href="#">Customer Support</a></li>
        </ul>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>
        &copy; {new Date().getFullYear()} MarketMingle. All rights reserved. 
        Made with <FaHeart className="heart-icon" /> for our customers.
      </p>
    </div>
  </footer>
);

export default Footer; 
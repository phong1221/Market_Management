import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import '../css/footer.css';

const Footer = () => {
  return (
    <footer className="footer-modern">
      <div className="footer-container">

        {/* Column 1: Brand & About */}
        <div className="footer-col brand-col">
          <h2 className="footer-logo">Market<span className="text-highlight">Mingle</span></h2>
          <p className="footer-desc">
            Your trusted partner for fresh groceries and quality products delivered right to your doorstep. Experience the difference of quality.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className="social-icon" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col links-col">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/user/home">Home</Link></li>
            <li><Link to="/user/about">About Us</Link></li>
            <li><Link to="/user/products">Our Products</Link></li>
            <li><Link to="/user/blog">Blog</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div className="footer-col links-col">
          <h3 className="footer-title">Support</h3>
          <ul className="footer-links">
            <li><Link to="/user/contact">Contact Us</Link></li>
            <li><Link to="/user/faq">FAQs</Link></li>
            <li><Link to="/user/shipping">Delivery Info</Link></li>
            <li><Link to="/user/terms">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact & Newsletter */}
        <div className="footer-col contact-col">
          <h3 className="footer-title">Contact Us</h3>
          <div className="contact-info">
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>123 Market Street, District 1, HCMC</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+84 1900 123 456</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>info@marketmingle.com</span>
            </div>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} MarketMingle. All rights reserved.</p>
          <p className="made-with">
            Made with <FaHeart className="heart-icon" /> for our customers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
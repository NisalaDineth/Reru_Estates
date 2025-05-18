import React from 'react';
import './AboutUs.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About Us</h1>
        <p>Cultivating quality crops for your needs since 2024</p>
      </div>

      {/* Our Story Section */}
      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Established in early 2024, Reru Estates is a modern plantation dedicated to growing and 
          supplying high-quality agricultural products. Though we're new to the market, our team brings 
          combined experience in sustainable farming practices. Our plantation spans over 5 acres 
          of fertile land where we cultivate a variety of crops using environmentally responsible methods.
        </p>
      </section>

      {/* Mission & Values Section */}
      <section className="about-section values-section">
        <h2>Our Mission & Values</h2>
        <div className="values-container">
          <div className="value-card">
            <h3>Quality</h3>
            <p>We are committed to growing premium crops that meet the highest standards of quality and freshness.</p>
          </div>
          <div className="value-card">
            <h3>Sustainability</h3>
            <p>Our farming practices prioritize environmental stewardship and long-term land health.</p>
          </div>
          <div className="value-card">
            <h3>Reliability</h3>
            <p>We ensure timely delivery and consistent supply of products to all our customers.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-section contact-section">
        <h2>Contact Us</h2>
        <div className="contact-container">
          <div className="contact-item">
            <FaPhone className="contact-icon" />
            <h3>Phone</h3>
            <p>+94 (74) 147-6633</p>
            <p>+94 (71) 820-2033</p>
          </div>
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>info@reruestates.com</p>
            <p>orders@reruestates.com</p>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <h3>Address</h3>
            <p>Bangalawaththa,</p>
            <p>Sirigala, Dambadeniya</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

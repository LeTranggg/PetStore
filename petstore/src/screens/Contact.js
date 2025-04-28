import React from 'react';

function About() {
  return (
    <div className="main" style={{ color: '#C8C9CB'}}>
      <h2>About Me</h2>

      <div className="about-main">
        <div className="about-content">
          <p>
            Hello pet lovers! I'm Trang, and like you, I'm a person who is passionate about lovely four-legged friends. My family currently has three playful cats and a loyal dog, who have brought endless joy and laughter to my life.
          </p>
          <p>
            It was my deep passion for cats and dogs that inspired me to create <strong>Meo & Gau</strong>. I understand that finding the best products for your little friends can be a challenging journey.
          </p>
          <p>
            <strong>My philosophy is simple:</strong> I want to bring a trustworthy online shopping space where you can find the best quality and safest products for your pets. I don't have any complicated philosophy, I simply want to share the good things that I believe in.
          </p>
          <p>
            <strong>How I choose products:</strong> I handpick each product based on my personal experience and prioritize brand and quality. I always think of myself as a customer, like everyone else, and I want to share the products that I have experienced and trusted for my own "children". Hopefully, the products I choose will also bring satisfaction to you and your pets.
          </p>
          <p>
            I may not be a pet care expert, but I believe that love and sincere care are the most important foundation. I always learn and research to bring the best choices to the pet-loving community.
          </p>
        </div>
        <div className="about-image">
          <img
            src={`${process.env.PUBLIC_URL}/About.png`}
            alt="About me"
            className="me-image"
          />
        </div>
      </div>

      <div className="vision-section">
        <h3>My Vision</h3>
        <p>
          To become the most trusted destination in Vietnam for all pet care products and information, accompanying you on the journey of raising healthy and happy little companions.
        </p>
      </div>

      <div className="call-to-action">
        <p>
          Join <strong>Meo & Gau</strong> in creating a better life for our amazing companions!
        </p>
        <p>
          If you have any questions or feedback, don’t hesitate to contact us. We’re always ready to listen and assist you.
        </p>
      </div>

      <div className="contact-footer">
        <p><strong>Sincerely,</strong></p>
        <p>Address: Admin Address.</p>
        <p>Phone Number: +123456789.</p>
        <p>
          Email: <a href="mailto:baotranglehuyen25@gmail.com">baotranglehuyen25@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

export default About;
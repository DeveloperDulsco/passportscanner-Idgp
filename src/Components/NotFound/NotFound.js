import React from 'react';
import './NotFound.css'; // Make sure to create this CSS file for styling

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="illustration">
        <img src="https://static-00.iconduck.com/assets.00/404-page-not-found-illustration-2048x998-yjzeuy4v.png" alt="Page Not Found" />
      </div>
      <div className="text-container">
        <h1>Page Not Found</h1>
        <p>The reservation you are looking for does not exist or could not be found.</p>
        {/* <div className="search-box">
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div> */}
        {/* <a href="/" className="home-page-link">Home Page</a> */}
      </div>
    </div>
  );
};

export default NotFound;

import React from 'react';
import { FaCouch, FaBath, FaCar, FaWarehouse } from 'react-icons/fa';

const NamingSuggestion = () => (
  <div className="text-sm text-gray-600 p-4">
    <p>We suggest naming your files using a specific room or area followed by a number, such as:</p>
    <br />
    <ul className="list-none">
      <li><FaCouch className="inline mr-2" /> <strong>livingroom-1.jpg</strong>, <strong>livingroom-2.jpg</strong></li>
      <li><FaBath className="inline mr-2" /> <strong>bathroom-2.jpg</strong>, <strong>bathroom-3.jpg</strong></li>
      <li><FaCar className="inline mr-2" /> <strong>garage-1.jpg</strong>, <strong>garage-2.jpg</strong></li>
      <li><FaWarehouse className="inline mr-2" /> <strong>basement-5.jpg</strong>, <strong>basement-6.jpg</strong></li>
    </ul>
  </div>
);

export default NamingSuggestion;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdPerson, MdCreditCard, MdReport, MdAccountCircle } from 'react-icons/md';
import './Sidebar.css';

// Dashboard.jsx'ten gelen isOpen prop'unu alıyoruz
const Sidebar = ({ isOpen }) => {
    return (
        // isOpen durumuna göre 'collapsed' sınıfını ekle veya kaldır
        <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
            <div className="sidebar-header">
                <h2>Dashboard</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                            <MdDashboard />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/investors" className={({ isActive }) => isActive ? "active" : ""}>
                            <MdPerson />
                            <span>Investor Management</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/transactions" className={({ isActive }) => isActive ? "active" : ""}>
                            <MdCreditCard />
                            <span>Transaction Management</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
                            <MdReport />
                            <span>Reports</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                            <MdAccountCircle />
                            <span>Profile</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
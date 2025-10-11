import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdTrendingUp,
  MdCreditCard,
  MdReport,
  MdAccountCircle,
  MdMenu,
} from "react-icons/md";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Üst kısım (başlık + menü butonu) */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">{isOpen ? "QuantShine" : "QS"}</h2>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <MdMenu />
        </button>
      </div>

      {/* Menü */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/portfoyum"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdDashboard className="icon" />
              {isOpen && <span>Portföyüm</span>}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/yatirim-gecmisim"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdTrendingUp className="icon" />
              {isOpen && <span>Yatırım Geçmişim</span>}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/danisman-bilgileri"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdCreditCard className="icon" />
              {isOpen && <span>Danışman Bilgileri</span>}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/haftalik-rapor"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdReport className="icon" />
              {isOpen && <span>Haftalık Rapor</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

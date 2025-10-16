import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdPersonAdd,
  MdAttachMoney,
  MdBarChart,
  MdAccountCircle,
  MdMenu,
} from "react-icons/md"; // Daha uygun ikonlar
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">{isOpen ? "QuantShine" : "QS"}</h2>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <MdMenu />
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin-anasayfa">
              <MdDashboard className="icon" />
              {isOpen && <span>Ana Sayfa</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/yatirimcilar">
              <MdPeople className="icon" />
              {isOpen && <span>Yatırımcılar</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/yatirimci-ekle-cikar">
              <MdPersonAdd className="icon" />
              {isOpen && <span>Yatırımcı Ekle/Çıkar</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/islem-sayfasi">
              <MdAttachMoney className="icon" />
              {isOpen && <span>İşlem Sayfası</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/raporlama">
              <MdBarChart className="icon" />
              {isOpen && <span>Raporlama</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/profil">
              <MdAccountCircle className="icon" />
              {isOpen && <span>Profil</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

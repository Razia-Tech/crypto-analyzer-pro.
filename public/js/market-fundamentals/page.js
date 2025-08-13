body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* HEADER */
.header {
  background: #1a1a1a;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header .logo {
  height: 40px;
  margin-right: 10px;
}

.header-left {
  display: flex;
  align-items: center;
}

.search-bar {
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  outline: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.icon {
  width: 24px;
  height: 24px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 15px;
}

.profile-menu {
  position: relative;
}

.profile-menu:hover .dropdown {
  display: block;
}

.dropdown {
  display: none;
  position: absolute;
  right: 0;
  background: white;
  color: black;
  border-radius: 4px;
  overflow: hidden;
}

.dropdown a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: black;
}

.dropdown a:hover {
  background: #eee;
}

/* SIDEBAR */
.sidebar {
  width: 220px;
  background: #222;
  color: white;
  padding-top: 20px;
  flex-shrink: 0;
  height: 100%;
  position: fixed;
  top: 60px;
  bottom: 0;
}

.sidebar nav a {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
}

.sidebar nav a.active,
.sidebar nav a:hover {
  background: #444;
}

.sidebar nav img {
  margin-right: 10px;
}

/* MAIN CONTENT */
.main-content {
  margin-left: 220px;
  padding: 20px;
  flex-grow: 1;
}

.card {
  background: white;
  padding: 15px;
  margin: 10px 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

/* FOOTER */
.footer {
  background: #1a1a1a;
  color: white;
  text-align: center;
  padding: 10px;
  margin-top: auto;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -220px;
    transition: left 0.3s;
  }
  .sidebar.active {
    left: 0;
  }
  .main-content {
    margin-left: 0;
  }
}


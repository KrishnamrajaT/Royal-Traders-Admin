import "./Layout.css";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />

      {/* Main Content */}
      <main className="main-content">{children}</main>

    
    </div>
  );
};

export default Layout;

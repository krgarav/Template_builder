/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

import FolderStructure from "views/FolderStructure";

import AdminScanJob from "views/AdminScanJob";
import DesignTemplate from "views/simplex/DesignTemplate";
import EditDesignTemplate from "views/simplex/EditDesignTemplate";
import BookletTemplateModal from "modals/BookletModal/BookletTemplateModal";
import EditBookletDesignTemplate from "views/booklet/EditDesignTemplate";
import DesignBookletTemplate from "views/booklet/DesignTemplate";

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <>
      {/* <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/argon-react.png"),
          imgAlt: "...",
        }}
      /> */}
      <div className="main-content" ref={mainContent}>
        <div style={{ position: "sticky", top: 0, zIndex: 999 }}>
          <AdminNavbar
            {...props}
            brandText={getBrandText(props?.location?.pathname)}
          />
        </div>

        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/admin/index" replace />} />
          <Route
            path="/template/simplex/design-template"
            element={<DesignTemplate />}
          />
          <Route
            path="/template/booklet/design-template"
            element={<DesignBookletTemplate />}
          />
          <Route
            path="/template/booklet/edit-design-template"
            element={<EditBookletDesignTemplate />}
          />
          <Route
            path="/template/edit-template"
            element={<EditDesignTemplate />}
          />
          <Route path="/job-queue/adminscanjob" element={<AdminScanJob />} />
        </Routes>
        {/* <Container fluid >
          <AdminFooter />
        </Container> */}
      </div>
    </>
  );
};

export default Admin;

import { Route, Routes } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Page404 } from "@/pages/Page404";
import { HomeRouter } from "@/router/HomeRouter";
import { PrivateRoute } from "@/router/PrivateRoute";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <HomeRouter />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

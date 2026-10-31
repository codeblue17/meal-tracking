import { Route, Routes } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Page404 } from "@/pages/Page404";
import { SharedMeals } from "@/pages/SharedMeals";
import { HomeRouter } from "@/router/HomeRouter";
import { PrivateRoute } from "@/router/PrivateRoute";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* 共有リンクの閲覧ページはログイン不要のため PrivateRoute の外に置く */}
      <Route path="/share/:token" element={<SharedMeals />} />
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

import { Route, Routes } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Page404 } from "@/pages/Page404";
import { HomeRouter } from "@/router/HomeRouter";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/*" element={<HomeRouter />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

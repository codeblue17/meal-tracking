import { Route, Routes } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { List } from "@/pages/List";
import { Profile } from "@/pages/Profile";
import { Page404 } from "@/pages/Page404";

export const HomeRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/list" element={<List />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

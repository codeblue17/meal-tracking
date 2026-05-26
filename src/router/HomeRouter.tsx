import { Route, Routes } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { List } from "@/pages/List";
import { Profile } from "@/pages/Profile";
import { Page404 } from "@/pages/Page404";
import { Header } from "@/components/ui/layout/Header";

export const HomeRouter = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/list" element={<List />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
};

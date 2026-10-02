import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../features/navabr/Navbar";
import Layout from "../Components/layout/Layout";

const Home: React.FC = () => {
  return (
    <>
      <Layout>
        <div className="flex flex-col h-full w-full relative">
          <div className="shrink-0 z-30 w-full">
            <Navbar />
          </div>
          <main className="flex-1 w-full h-full overflow-hidden relative">
            <Outlet />
          </main>
        </div>
      </Layout>
    </>
  );
};

export default Home;

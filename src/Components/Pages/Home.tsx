import React from "react";
import Navbar from "../features/Navbar/Navbar";

const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#111217] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto p-8 opacity-50">
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <p className="mt-8 text-center text-sm">
            I am Working right now .....
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;

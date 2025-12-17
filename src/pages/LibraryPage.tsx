// import React, { useState, useEffect, useMemo } from "react";
// import { useAppSelector } from "../hooks/useRedux";
// import {
//   FileText,
//   Trash2,
//   ArrowUpDown,
//   Download,
//   UploadCloud,
//   Loader2,
// } from "lucide-react";
// import { cn } from "../lib/utils";
// import { FilesService } from "../api/backendApi";

// // --- HELPERS ---
// const formatDate = (dateStr: string) => {
//   if (!dateStr) return "N/A";
//   return new Date(dateStr).toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     hour: "numeric",
//     minute: "numeric",
//   });
// };

// const formatSize = (bytes: number) => {
//   if (!bytes) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
// };

// const LibraryPage: React.FC = () => {
//   const isDark = useAppSelector((state: any) => state.theme.isDark);
//   const token = useAppSelector((state: any) => state.auth.accessToken);

//   // State
//   const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
//   const [files, setFiles] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   // --- FETCH FILES ---
//   const fetchFiles = async () => {
//     setLoading(true);
//     try {
//       const data = await FilesService.getFiles(token, activeTab);
//       setFiles(data);
//     } catch (error) {
//       console.error("Failed to fetch files", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) fetchFiles();
//   }, [token, activeTab]);

//   // --- HANDLERS ---
//   const handleDelete = async (fileId: string) => {
//     if (confirm("Delete this file permanently?")) {
//       try {
//         setFiles((prev) => prev.filter((f) => f.id !== fileId)); // Optimistic
//         await FilesService.deleteFile(token, fileId);
//       } catch (e) {
//         console.error("Delete failed", e);
//         fetchFiles(); // Revert
//       }
//     }
//   };

//   const handleDownload = (fileId: string) => {
//     // Assuming backend provides a download endpoint
//     const url = FilesService.getFileUrl(fileId);
//     window.open(url, "_blank");
//   };

//   // --- SORTING ---
//   const sortedFiles = useMemo(() => {
//     return [...files].sort((a, b) => {
//       const dateA = new Date(a.created_at || 0).getTime();
//       const dateB = new Date(b.created_at || 0).getTime();
//       return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
//     });
//   }, [files, sortOrder]);

//   return (
//     <div
//       className={cn(
//         "min-h-screen flex flex-col transition-colors duration-300",
//         isDark ? "bg-black text-[#E7E9EA]" : "bg-white text-gray-900"
//       )}
//     >
//       {/* HEADER SECTION */}
//       <div
//         className={cn(
//           "sticky top-0 z-30 border-b backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4",
//           isDark
//             ? "bg-black/80 border-[#2F3336]"
//             : "bg-white/80 border-gray-200"
//         )}
//       >
//         <div>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <UploadCloud className="text-blue-500" /> Library
//           </h1>
//           <p
//             className={cn(
//               "text-sm mt-1",
//               isDark ? "text-gray-400" : "text-gray-500"
//             )}
//           >
//             Manage your uploaded and generated files
//           </p>
//         </div>

//         {/* TABS */}
//         <div
//           className={cn(
//             "flex p-1 rounded-xl w-full md:w-auto",
//             isDark ? "bg-[#16181C]" : "bg-gray-100"
//           )}
//         >
//           <button
//             onClick={() => setActiveTab("sent")}
//             className={cn(
//               "flex-1 md:w-32 py-2 rounded-lg text-sm font-medium transition-all",
//               activeTab === "sent"
//                 ? isDark
//                   ? "bg-[#2F3336] text-white shadow-sm"
//                   : "bg-white text-black shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             )}
//           >
//             Sent
//           </button>
//           <button
//             onClick={() => setActiveTab("received")}
//             className={cn(
//               "flex-1 md:w-32 py-2 rounded-lg text-sm font-medium transition-all",
//               activeTab === "received"
//                 ? isDark
//                   ? "bg-[#2F3336] text-white shadow-sm"
//                   : "bg-white text-black shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             )}
//           >
//             Received
//           </button>
//         </div>
//       </div>

//       {/* TABLE CONTENT */}
//       <div className="flex-1 p-4 md:p-8 overflow-auto">
//         <div
//           className={cn(
//             "max-w-6xl mx-auto rounded-2xl overflow-hidden border shadow-sm",
//             isDark
//               ? "bg-[#16181C] border-[#2F3336]"
//               : "bg-white border-gray-200"
//           )}
//         >
//           {loading ? (
//             <div className="h-64 flex flex-col items-center justify-center opacity-50">
//               <Loader2 className="animate-spin mb-2" size={30} />
//               <p>Loading files...</p>
//             </div>
//           ) : sortedFiles.length === 0 ? (
//             <div className="h-64 flex flex-col items-center justify-center opacity-40">
//               <FileText size={48} className="mb-4" />
//               <p>No files found in {activeTab}</p>
//             </div>
//           ) : (
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr
//                   className={cn(
//                     "border-b text-xs uppercase tracking-wider",
//                     isDark
//                       ? "border-[#2F3336] text-gray-500 bg-[#16181C]"
//                       : "border-gray-100 text-gray-400 bg-gray-50"
//                   )}
//                 >
//                   <th className="p-4 pl-6 font-medium">Name</th>
//                   <th className="p-4 font-medium hidden md:table-cell">Size</th>
//                   <th
//                     className="p-4 font-medium cursor-pointer hover:text-blue-500 flex items-center gap-1"
//                     onClick={() =>
//                       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//                     }
//                   >
//                     Date <ArrowUpDown size={12} />
//                   </th>
//                   <th className="p-4 pr-6 font-medium text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-[#2F3336]">
//                 {sortedFiles.map((file) => (
//                   <tr
//                     key={file.id}
//                     className={cn(
//                       "group transition-colors",
//                       isDark ? "hover:bg-[#1F2225]" : "hover:bg-gray-50"
//                     )}
//                   >
//                     {/* NAME */}
//                     <td className="p-4 pl-6">
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={cn(
//                             "p-2 rounded-lg",
//                             isDark
//                               ? "bg-[#2F3336] text-blue-400"
//                               : "bg-blue-50 text-blue-600"
//                           )}
//                         >
//                           <FileText size={18} />
//                         </div>
//                         <div className="flex flex-col min-w-0">
//                           <span className="font-medium truncate max-w-[200px] md:max-w-xs">
//                             {file.name || "Untitled File"}
//                           </span>
//                           <span className="text-xs text-gray-500 md:hidden">
//                             {formatSize(file.size)}
//                           </span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* SIZE (Desktop) */}
//                     <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
//                       {formatSize(file.size)}
//                     </td>

//                     {/* DATE */}
//                     <td className="p-4 text-sm text-gray-500 font-mono">
//                       {formatDate(file.created_at)}
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="p-4 pr-6 text-right">
//                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button
//                           onClick={() => handleDownload(file.id)}
//                           className={cn(
//                             "p-2 rounded-lg transition-colors",
//                             isDark
//                               ? "hover:bg-blue-500/20 text-blue-400"
//                               : "hover:bg-blue-50 text-blue-600"
//                           )}
//                           title="Download"
//                         >
//                           <Download size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(file.id)}
//                           className={cn(
//                             "p-2 rounded-lg transition-colors",
//                             isDark
//                               ? "hover:bg-red-500/20 text-red-400"
//                               : "hover:bg-red-50 text-red-600"
//                           )}
//                           title="Delete"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LibraryPage;

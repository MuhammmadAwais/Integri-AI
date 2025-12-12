import axios from "axios";


// axios instance custom backend
const backendApi = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API Endpoints
export const getBackendToken = async (userId : any, email: any) => {
  try {
    const response = await backendApi.post("/api/v1/auth/token", {
      user_id: userId,
      email: email,
    });
    // response.data will contain access token
    return response.data;
    console.log("Backend auth successful:", response.data);
  } catch (error : any) {
    console.error(
      "Backend auth failed:",
      error.response?.data || error.message
    );
    throw error; // Re-throw so Redux can handle the failure
  }
};

// Later, you will add chat API calls here too.
// export const sendChatMessage = (message, token) => { ... }

export default backendApi;

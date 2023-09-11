import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();
// export const RefreshTokenContext = createContext(); // Create a context for the refresh token

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);
// export const useRefreshToken = () => useContext(RefreshTokenContext); // Create a hook to access the refresh token

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // const [authTokens, setAuthTokens] = useState({ accessToken: null, refreshToken: null });
  const history = useHistory();

  // Define a function to refresh the access token
  // async function refreshToken() {
  //   try {
  //     const response = await axios.post("/dj-rest-auth/token/refresh/");
  //     const newAccessToken = response.data.access;
  //     setAuthTokens((prevTokens) => ({
  //       ...prevTokens,
  //       accessToken: newAccessToken,
  //     }));
  //     return newAccessToken;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  const handleMount = async () => {
    try {
      // Retrieve the authentication tokens from where they are stored (e.g., localStorage)
      const authToken = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Check if the tokens exist
      if (authToken && refreshToken) {
        setAuthTokens({
          accessToken: authToken,
          refreshToken: refreshToken,
        });
        const { data } = await axiosRes.get("dj-rest-auth/user/", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setCurrentUser(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    axiosReq.interceptors.request.use(
      async (config) => {
        if (shouldRefreshToken()) {
          try {
            await axios.post("/dj-rest-auth/token/refresh/");
          } catch (err) {
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
            return config;
          }
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );


    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          try {
            await axios.post("/dj-rest-auth/token/refresh/");
          } catch (err) {
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
          }
          return axios(err.config);
        }
        return Promise.reject(err);
      }
    );
  }, [history]);

  // useMemo(() => {
  //   // Add a request interceptor to axiosReq
  //   axiosReq.interceptors.request.use(
  //     async (config) => {
  //       try {
  //         // Attempt to refresh the token and update the request config with the new token
  //         const newAccessToken = await refreshToken();
  //         config.headers["Authorization"] = `Bearer ${newAccessToken}`;
  //       } catch (error) {
  //         // Handle token refresh failure here
  //         if (error.response?.status === 401) {
  //           // Redirect to the signin page or perform other actions
  //           history.push("/");
  //         }
  //       }
  //       return config;
  //     },
  //     (error) => {
  //       return Promise.reject(error);
  //     }
  //   );

  //   // Add a response interceptor to axiosRes
  //   axiosRes.interceptors.response.use(
  //     (response) => response,
  //     async (error) => {
  //       if (error.response?.status === 401) {
  //         try {
  //           // Attempt to refresh the token and retry the original request
  //           const newAccessToken = await refreshToken();
  //           error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
  //           return axiosRes(error.config);
  //         } catch (refreshError) {
  //           // Handle token refresh failure here
  //           // Redirect to the signin page or perform other actions
  //           history.push("/signin");
  //         }
  //       }
  //       return Promise.reject(error);
  //     }
  //   );
  // }, [history]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {/* <RefreshTokenContext.Provider value={authTokens.refreshToken}> */}
          {children}
        {/* </RefreshTokenContext.Provider> */}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
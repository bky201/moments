import axios from "axios";

axios.defaults.baseURL = 'https://djangorfapi-517d92cdd717.herokuapp.com/';
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();


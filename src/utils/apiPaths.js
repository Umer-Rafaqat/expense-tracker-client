export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_USER: "/auth/getUser",
    UPLOAD_IMAGE: "/auth/upload-image",
  },
  INCOME: {
    ADD: "/income/add",
    GET_ALL: "/income/getAll",
    DELETE: (id) => `/income/delete/${id}`,
    DOWNLOAD_EXCEL: "/income/downloadExcel",
  },
  EXPENSE: {
    ADD: "/expense/add",
    GET_ALL: "/expense/getAll",
    DELETE: (id) => `/expense/delete/${id}`,
    DOWNLOAD_EXCEL: "/expense/downloadExcel",
  },
  DASHBOARD: {
    GET: "/dashboard",
  },
};

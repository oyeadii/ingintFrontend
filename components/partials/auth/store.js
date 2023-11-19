import { createSlice } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid"
import { toast } from "react-toastify"

const initialUsers = () => {
  if (typeof window !== "undefined") {
    const item = window?.localStorage.getItem("users")
    return item
      ? JSON.parse(item)
      : [
          {
            id: uuidv4(),
            name: "Ingint",
            email: "Ingint@gmail.com",
            password: "Ingint",
          },
        ]
  }
  return [
    {
      id: uuidv4(),
      name: "Ingint",
      email: "Ingint@gmail.com",
      password: "Ingint",
    },
  ]
}
// save users in local storage

const initialIsAuth = () => {
  if (typeof window !== "undefined") {
    const item = window?.localStorage.getItem("isAuth")
    return item ? JSON.parse(item) : false
  }
  return false
}

const initialIsAdmin = () => {
  if (typeof window !== "undefined") {
    const item = window?.localStorage.getItem("isAdmin")
    return item ? JSON.parse(item) : false
  }
  return false
}
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    users: initialUsers(),
    isAuth: initialIsAuth(),
    isAdmin: initialIsAdmin(),
  },
  reducers: {
    handleRegister: (state, action) => {
      const { name, email, password } = action.payload
      const user = state.users.find((user) => user.email === email)
      if (user) {
        toast.error("User already exists", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
      } else {
        state.users.push({
          id: uuidv4(),
          name,
          email,
          password,
        })
        if (typeof window !== "undefined") {
          window?.localStorage.setItem("users", JSON.stringify(state.users))
        }
        toast.success("User registered successfully", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
      }
    },

    handleLogin: (state, action) => {
      state.isAuth = action.payload
      // save isAuth in local storage
      if (typeof window !== "undefined") {
        window?.localStorage.setItem("isAuth", JSON.stringify(state.isAuth))
      }
    },
    handleAdminLogin: (state, action) => {
      state.isAdmin = action.payload
      // save isAuth in local storage
      if (typeof window !== "undefined") {
        window?.localStorage.setItem("isAdmin", JSON.stringify(state.isAdmin))
      }
      toast.success("Admin logged in successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
    },
    handleLogout: (state, action) => {
      state.isAuth = action.payload
      state.isAdmin = action.payload
      // remove isAuth from local storage
      if (typeof window !== "undefined") {
        window?.localStorage.removeItem("isAuth")
        window?.localStorage.removeItem("isAdmin")
        window?.localStorage.clear()
      }
      toast.success("User logged out successfully", {
        position: "top-right",
      })
    },
  },
})

export const { handleRegister, handleLogin, handleLogout, handleAdminLogin } =
  authSlice.actions
export default authSlice.reducer

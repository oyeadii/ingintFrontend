import { ToastContainer, toast } from "react-toastify"

export async function apiCall(url, header = {}, data = {}, method = "GET") {
  let myHeaders = new Headers()

  for (const [key, value] of Object.entries(header)) {
    myHeaders.append(key, value)
  }
  myHeaders.append("Content-Type", "application/json")

  var requestOptions = {
    method: method,
    headers: myHeaders,
  }

  if (
    method.toUpperCase() === "POST" ||
    method.toUpperCase() === "PUT" ||
    method.toUpperCase() === "DELETE"
  ) {
    requestOptions.body = JSON.stringify(data)
  } else if (method.toUpperCase() === "GET") {
    url = url + "?"
    for (const [key, val] of Object.entries(data)) {
      if (val) {
        url += `${key}=${val}&`
      }
    }
    if (url.slice(-1)) {
      url = url.substring(0, url.length - 1)
    }
  }

  try {
    const response = await fetch(url, requestOptions)

    if (response.status === 200) {
      const result = await response.json()

      const data = result?.data

      return { isSuccess: true, data: data }
    } else if (response.status === 401) {
      localStorage.clear()
      toast.error("Session expired. Please log in again.", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
      setTimeout(() => {
        window.location.assign("/")
      }, 2000)
    } else {
      const errorResponse = await response.json()
      const { errorCode, errorMessage } = errorResponse
      throw new Error(errorMessage || "An error occurred. Please try again.")
    }
  } catch (error) {
    console.error(error)

    toast.error(error.message || "An error occurred. Please try again.", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    })

    return {
      isSuccess: false,
      data: { error: error.message || "An error occurred. Please try again." },
    }
  }
}

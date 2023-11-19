import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  handleChatType,
  handleMobileMenu,
  handleToken,
} from "@/store/layoutReducer"

const useToken = () => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.layout.token)

  // ** Toggles Mobile Menu
  const setToken = (val) => dispatch(handleToken(val))

  return [token, setToken]
}

export default useToken

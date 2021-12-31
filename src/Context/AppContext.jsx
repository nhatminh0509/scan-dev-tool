import React, { createContext, useState } from 'react'

const AppContext = createContext([])

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({
    isDarkMode: false
  })

  const toggleDarkMode = () => setData(state => { return { ...state, isDarkMode: !state.isDarkMode } })

  return (
    <AppContext.Provider value={[data, { setData ,toggleDarkMode }]}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext

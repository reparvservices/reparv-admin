import React from 'react'
import { useAuth } from '../store/auth';

function Loader() {
    const { loading } = useAuth();
  return (
    <div className={`${loading ? "block":"hidden"} w-10 h-10 border-4 mx-2 border-gray-300 border-t-[#0BB501] rounded-full animate-spin`}></div>
  )
}

export default Loader
import React, { useState, useEffect } from 'react'
import {axiosInstance} from '../lib/axois'
import Sidebar from '../components/Sidebar'
import NoChateSelected from '../components/NoChateSelected'
import ChatContainer from '../components/ChatContainer'

function Home() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([])
  const [seletedUser, setSelectedUser] = useState(null)
  const [isUseLoading, setUserLoading] = useState(false);
  const [isMessageLoading, setMessageLoading] = useState(false);

  const getUsers = async () => {
    try {
      setUserLoading(true)
      const res = await axiosInstance.get('/get/user')
      setUsers(res.data)
    } catch (err) {
      console.log(err)
    }finally {
      setUserLoading(false)
    }
  }
  const getMessages = async (userId) => {
    try {
      setMessageLoading(true)
      const res = await axiosInstance.get(`/get/messages/${userId}`)
      setMessages(res.data)
    }catch (err) {
      console.log(err)
    }finally {
      setMessageLoading(false)
    }
  }
  useEffect(()=>{
    getUsers()
  },[])

  return (
    <div className='h-screen bg-base-200'>
    <div className='flex items-center justify-center pt-20 px-4'>
      <div className='bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]'>
        <div className='flex h-full rounded-lg overflow-hidden'>
          <Sidebar
            users={users}
            isUserLoading={isUseLoading}
            getUsers={getUsers}
            selectedUser={seletedUser}
            setSelectedUser={setSelectedUser}
            getMessages={()=>getMessages(seletedUser._id)}
            />
            {!seletedUser ? <NoChateSelected/> : <ChatContainer selectedUser={seletedUser} getMessages={getMessages} isMessageLoading={isMessageLoading} messages={messages}/>}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Home

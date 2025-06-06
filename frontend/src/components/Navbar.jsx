import {Link} from "react-router-dom";
import {LogOut, MessageSquare, Settings, User} from "lucide-react";
import {axiosInstance} from "../lib/axois";
import {useNavigate} from "react-router-dom";
import {ConnectionManager as Connection} from "../lib/socket.js";

function Navbar() {
    const navigate = useNavigate();
    const logout = async () => {
        try {
            await axiosInstance.post("/user/signout")
            Connection.disconnect()
            navigate("/login")
            localStorage.removeItem("userId")
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40
    backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary"/>
                            </div>
                            <h1 className="text-lg font-bold">Chatty</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to={"/settings"}
                            className={`
              btn btn-sm gap-2 transition-colors
              
              `}
                        >
                            <Settings className="w-4 h-4"/>
                            <span className="hidden sm:inline">Settings</span>
                        </Link>


                        <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                            <User className="size-5"/>
                            <span className="hidden sm:inline">Profile</span>
                        </Link>

                        <button className="flex gap-2 items-center cursor-pointer" onClick={logout}>
                            <LogOut className="size-5"/>
                            <span className="hidden sm:inline">Logout</span>
                        </button>

                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar

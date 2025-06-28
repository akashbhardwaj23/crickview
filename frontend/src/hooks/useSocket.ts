import { WS_URL } from "@/config/config";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(){
    const [socket, setSocket] = useState<Socket | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
       if(!socket){
        console.log('again again ', WS_URL)
    const newSocket = io({
            path: WS_URL,
            })
       setSocket(newSocket)
       }
 
    }, [])

    return {
        socket,
        loading
    }
}
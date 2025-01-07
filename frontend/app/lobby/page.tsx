"use client"
import { logoutRouteAction } from '@/actions/logout-route-action';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/use-socket-hook';
import { EventTypes } from '@/lib/types/event-types';
import useWebSocketStore from '@/state-management/ws-state';
import { LogOut } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useEffect, useState } from 'react';
import { set } from 'zod';

const LobbyPage: React.FC = () => {
    const [playnow, setPlayNow] = useState(false);
    const { sendMessage,connected,payload} = useWebSocket();
    const [seconds, setSeconds] = useState(10);
    const router = useTransitionRouter();
    const handleCreateGame = () => {
        console.log('Create Game',connected);
        if(connected){
            setPlayNow(true);
            sendMessage({
                event: EventTypes.INIT_GAME,
            });
        } else {
            console.log('Not connected to websocket');
        }
    };
    useEffect(() => {
        if(payload && payload.event === EventTypes.GAME_STARTED){
            setPlayNow(false);
            let timer:any;
            if(seconds > 0){
                timer = setTimeout(() => {
                    setSeconds(seconds - 1);
                }, 1000);
                return ()=> clearTimeout(timer);
            } else {
                router.push(`/game/${payload.payload}`)
                return () => clearTimeout(timer)
            }
        }
    }, [payload, router, seconds])
    
    return (
        <div className='bg-gray-100 min-h-screen '>
            <div className="float-end mt-5 mr-5 ">
                <Button variant={"default"} onClick={async()=>{
                    await logoutRouteAction();
                }}><LogOut/>Logout</Button>
            </div>
            <div className="flex flex-col items-center justify-center  bg-gray-100  h-full">
            <h1 className="text-4xl font-bold mb-8">Snakes & Ladders</h1>
            <div className="flex flex-col items-center space-y-4">
                {!playnow &&<button
                    onClick={handleCreateGame}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Play Now
                </button>}
                {playnow && (

                        <div className="flex flex-col items-center space-y-4">
                            <h2 className="text-2xl font-bold">Waiting for other player...</h2>
                            <button
                                onClick={() => setPlayNow(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                            >
                                Cancel
                            </button>
                        </div>
                    )
                }
                {payload && payload.event === EventTypes.GAME_STARTED && (
                        <div className="flex flex-col items-center space-y-4">
                            <h2 className="text-2xl font-bold">
                            Game Starting in {seconds} second{seconds !== 1 ? "s" : "..."}
                            </h2>
                            <button
                                onClick={() => setPlayNow(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                            >
                                Cancel
                            </button>
                        </div>
                    )
                }

            </div>
        </div>
        </div>
    );
};

export default LobbyPage;
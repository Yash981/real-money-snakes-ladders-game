"use client"
import { useWebSocket } from '@/hooks/use-socket-hook';
import { EventTypes } from '@/lib/types/event-types';
import useWebSocketStore from '@/state-management/ws-state';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useEffect, useState } from 'react';
import { set } from 'zod';

const LobbyPage: React.FC = () => {
    const [playnow, setPlayNow] = useState(false);
    const { sendMessage,connected,payload} = useWebSocket();
    const [seconds, setSeconds] = useState(5);
    const router = useTransitionRouter();
    const handleCreateGame = () => {
        console.log('Create Game',connected);
        if(connected){
            setPlayNow(true);
            sendMessage({
                event: EventTypes.JOIN_GAME,
            });
        } else {
            console.log('Not connected to websocket');
        }
    };
    useEffect(() => {
        if(payload && payload.event === EventTypes.GAME_STARTED){
            setPlayNow(false);
            if(seconds > 0){
                const timer = setTimeout(() => {
                    setSeconds(seconds - 1);
                }, 1000);
                return ()=> clearTimeout(timer);
            } else {
                router.push('/')
            }
        }
    }, [payload, router, seconds])
    
    console.log('Payload',payload);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
    );
};

export default LobbyPage;
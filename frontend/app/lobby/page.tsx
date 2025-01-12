"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, History, Loader2, Users, Trophy, Dice1 } from 'lucide-react';
import { EventTypes } from '@/lib/types/event-types';
import { logoutRouteAction } from '@/actions/logout-route-action';
import { useTransitionRouter } from 'next-view-transitions';
import { useWebSocket } from '@/hooks/use-socket-hook';
import { toast } from 'sonner';

const LobbyPage = () => {
  const [playnow, setPlayNow] = useState<boolean | null>(true);
  const { sendMessage, connected, payload } = useWebSocket();
  const [seconds, setSeconds] = useState(5);
  const router = useTransitionRouter();

  const handleCreateGame = () => {
    if (connected) {
      setPlayNow(false);
      sendMessage({ event: EventTypes.INIT_GAME });
    } else {
      toast.error('Not connected to websocket. Try refreshing the page');
    }
  };

  useEffect(() => {
    if (payload && payload.event === EventTypes.GAME_STARTED) {
      setPlayNow(null);
      let timer: any;
      if (seconds > 0) {
        timer = setTimeout(() => {
          setSeconds(seconds - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        router.push(`/game/${payload.payload}`);
        return () => clearTimeout(timer);
      }
    }
  }, [payload, router, seconds]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="p-6 flex justify-end space-x-4">
        <Button 
          variant="outline" 
          className="border-black hover:bg-gray-100"
          onClick={() => router.push('/history')}
        >
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
        <Button 
          variant="outline" 
          className="border-black hover:bg-gray-100"
          onClick={async () => {
            await logoutRouteAction();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center px-4 pt-10">
        <Card className="max-w-3xl w-full border-2 border-black bg-white shadow-2xl">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-black">Snakes & Ladders</h1>
                  <p className="text-gray-600 text-lg">Ready to roll the dice and climb to victory?</p>
                </div>

                <div className="space-y-6">
                  {playnow === true && (
                    <Button
                      className="bg-black hover:bg-gray-800 text-white text-xl px-8 py-8 w-full"
                      onClick={handleCreateGame}
                    >
                      <Dice1 className="mr-2 h-6 w-6" />
                      Play Now
                    </Button>
                  )}

                  {playnow === false && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3 bg-gray-50 p-6 rounded-lg border-2 border-black">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <h2 className="text-2xl font-semibold">Waiting for opponent...</h2>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-black hover:bg-gray-800 w-full py-6"
                        onClick={() => setPlayNow(true)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {payload && payload.event === EventTypes.GAME_STARTED && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-6 rounded-lg border-2 border-black text-center">
                        <h2 className="text-2xl font-semibold">
                          Game Starting in {seconds} second{seconds !== 1 ? "s" : ""}
                        </h2>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-black hover:bg-gray-800 w-full py-6"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8 border-l-2 border-gray-200 pl-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Two Player Game</h3>
                      <p className="text-gray-600">Challenge your friend in real-time</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Dice1 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Classic Rules</h3>
                      <p className="text-gray-600">Roll dice, climb ladders, avoid snakes</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Track Progress</h3>
                      <p className="text-gray-600">View game history and statistics</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2">How to Play</h3>
                  <p className="text-gray-600">Click &apos;Play Now&apos; to start a new game. Once matched with an opponent, take turns rolling the dice and racing to the top!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LobbyPage;
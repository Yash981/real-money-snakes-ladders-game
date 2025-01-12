"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransitionRouter } from 'next-view-transitions';

const LandingPage = () => {
    const router = useTransitionRouter()
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8 flex items-center justify-center">
      <Card className="max-w-lg w-full border-2 border-black">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-bold text-black mb-4">
            Snakes & Ladders
          </CardTitle>
          <CardDescription className="text-xl text-gray-700">
            Challenge your friend in this classic game of luck!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-800">
              Race to the top while avoiding the sneaky snakes
            </p>
            <p className="text-sm text-gray-600">
              Two Player Game
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6"
              onClick={()=>router.push('/lobby')}
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;
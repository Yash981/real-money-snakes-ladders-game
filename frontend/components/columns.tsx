"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Minus, Plus } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type HistoryType = {
    datetime: string
    gameId: string
    opponent: string
    result: 'WIN' | 'LOSS' | 'DRAW'
    betamount: number
}

export const columns: ColumnDef<HistoryType>[] = [
    {
        accessorKey: "datetime",
        header: "Date & Time",
        cell: ({ row }) => {
            return new Date(row.getValue('datetime')).toLocaleString('en-US',
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                })
        }

    },
    {
        accessorKey: "gameId",
        header: "GameID",
    },
    {
        accessorKey: "opponent",
        header: "Opponent",
    },
    {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => {
            return <div className={`${row.getValue('result') === 'WIN' ? 'text-green-400 ' : row.getValue('result') === 'LOSE' ? 'text-red-500 ' : 'text-slate-400'} font-bold text-lg`}>{row.getValue('result')}</div>
        }
    },
    {
        accessorKey: "betamount",
        header: "Bet Amount",
        cell: ({ row }) => {
            if ((row.getValue('betamount') as number).toString().includes('-')){
                return <div className="flex justify-center items-center font-bold text-lg">
                    <Minus size={15} className="text-red-500 text-lg"/>
                    <p className="text-lg text-red-500">{(row.getValue('betamount') as number).toString().substring(1)}</p>
                </div>
            }else{
                return <div className="flex justify-center items-center font-bold text-lg">
                    <Plus size={15} className="text-green-500 text-lg"/>
                    <p className="text-lg text-green-500">{(row.getValue('betamount') as number).toString()}</p>
                </div>
            }
        }

    },
]

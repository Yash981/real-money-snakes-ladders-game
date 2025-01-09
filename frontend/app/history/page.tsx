import { getUserHistory } from "@/actions/user-history-route-action";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
const History = async () => {
    const data = await getUserHistory()
    if(!data.success){
        return null
    }
    return (
        <>
            <h1 className="text-center m-4 text-black font-bold mb-0 text-2xl underline">User History</h1>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data.message.userHistory} />
            </div>
        </>
    );
}

export default History;
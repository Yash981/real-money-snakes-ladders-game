
import { getUserHistory } from "@/actions/user-history-route-action";
import BackButton from "@/components/back-button";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
const History = async () => {
    const data = await getUserHistory()
    if(!data.success){
        return null
    }
    return (
        <>
        <div className="flex ml-16 mt-8 justify-between">
            <BackButton/>
            <h1 className="text-center text-black font-bold text-2xl underline absolute left-1/2 transform -translate-x-1/2">User History</h1>
        </div>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data.message.userHistory} />
            </div>
        </>
    );
}

export default History;
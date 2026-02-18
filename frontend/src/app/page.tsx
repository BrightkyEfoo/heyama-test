import { CreateObjectDialog } from "@/components/create-object-dialog";
import { ObjectsList } from "@/components/objects-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Liste des objets</h1>
        <CreateObjectDialog />
      </header>
      <main className="p-6">
        <ObjectsList />
      </main>
    </div>
  );
}

import { Header } from "@/components/header";
import { MessagesList } from "@/components/messages/messages-list";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <MessagesList />
      </main>
    </div>
  );
}

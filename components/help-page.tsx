"use client";
import React, { useState } from "react";
import CreateTicketForm from "./create-ticket-form";
import ManageTickets from "./manage-tickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"; // ensure exists or adjust

const HelpPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="w-full flex flex-col items-center py-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center">Help & Support</h1>
      <Tabs defaultValue="create" className="w-full max-w-6xl">
        <TabsList className="mx-auto flex items-stretch justify-center gap-0 rounded-xl overflow-hidden shadow border bg-background/70 backdrop-blur">
          <TabsTrigger value="create" className="text-base md:text-lg px-8 py-4 rounded-none data-[state=active]:font-semibold relative">
            Create New Ticket
            <span className="hidden md:inline text-muted-foreground text-xs ml-2">(Open a dispute)</span>
          </TabsTrigger>
          <div className="w-px bg-border self-stretch" />
          <TabsTrigger value="manage" className="text-base md:text-lg px-8 py-4 rounded-none data-[state=active]:font-semibold">
            Manage Existing Tickets
          </TabsTrigger>
        </TabsList>
        <div className="mt-10">
          <TabsContent value="create" className="focus-visible:outline-none">
            <CreateTicketForm onCreated={() => setRefreshKey((k) => k + 1)} />
          </TabsContent>
          <TabsContent value="manage" key={refreshKey} className="focus-visible:outline-none">
            <div className="mx-auto max-w-5xl">
              <ManageTickets />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HelpPage;

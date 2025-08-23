"use client";
import React, { useState } from "react";
import CreateTicketForm from "./create-ticket-form";
import ManageTickets from "./manage-tickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"; // ensure exists or adjust

const HelpPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Help & Support</h1>
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create New Ticket</TabsTrigger>
          <TabsTrigger value="manage">Manage Existing Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateTicketForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
        <TabsContent value="manage" key={refreshKey}>
          <ManageTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage;

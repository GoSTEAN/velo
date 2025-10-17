"use client";

import AddSplit from "@/components/modals/add-split";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { Loader2, Plus, Users } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { useSplitPayments } from "@/components/hooks/useSplitPayments"; // ADD

export default function PaymentSplit() {
  const {
    templates,
    isLoading,
    refetch,
    executeSplitPayment,
    toggleSplitPayment,
  } = useSplitPayments();

  const [addSplitModal, setAddSplitModal] = useState(false);

  const refetchTemplates = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleExecute = async (id: string) => {
    try {
      await executeSplitPayment(id);
      // Hook automatically refreshes templates after execution
    } catch (error) {
      console.error("Failed to execute:", error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSplitPayment(id);
      // Hook automatically refreshes templates after toggle
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  const handleShowSplitModal = () => {
    setAddSplitModal(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Split Payments</h1>
        <Button onClick={handleShowSplitModal}>
          <Plus className="h-4 w-4 mr-2" /> Create New Split
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center h-64">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg text-center mb-6">
            No split created yet. Create your first payment split to get
            started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{template.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain:</span>
                    <span>{template.chain.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span>{template.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span>{template.recipientCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Executions:</span>
                    <span>{template.executionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{template.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {template.canExecute && (
                    <Button onClick={() => handleExecute(template.id)}>
                      Execute
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleToggle(template.id)}
                  >
                    {template.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Create Split</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Add multiple recipients with their wallet addresses and
                  amounts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Save Template</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Create reusable template on the backend
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Execute Payments
                </h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Distribute funds to all recipients in one go
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {addSplitModal && (
        <AddSplit close={setAddSplitModal} onSuccess={refetchTemplates} />
      )}
    </div>
  );
}

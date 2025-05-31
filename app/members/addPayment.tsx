"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getAuthToken } from "@/components/token";
import { MenubarMenu } from "@radix-ui/react-menubar";

interface PaymentFormProps {
  memberId: string | null;
  memberName: string | null;
  open: boolean;
  handleClose: () => void;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export function AddPaymentForm({
  memberId,
  memberName,
  open,
  handleClose,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payment_type = formData.get("payment_type") as string;
    const amount = formData.get("amount") as string;
    const paid_at = formData.get("paid_at") as string;
    const paid_till = formData.get("paid_till") as string;
    const payment_id = formData.get("payment_id") as string;

    if (!payment_type || !amount || !paid_at || !paid_till) {
      setError("Please provide all required fields");
      setIsLoading(false);
      return;
    }

    const token = getAuthToken(false);
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/createPayments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            member_id: memberId,
            payment_type,
            payment_id,
            amount,
            paid_at,
            paid_till,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Failed to add payment. Please try again.");
        setIsLoading(false);
        return;
      }
      if (data) {
        handleClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Add Payment for {memberName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Mode*</Label>
                  <select
                    id="payment_type"
                    name="payment_type"
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Gpay">Gpay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_id">Payment Id (Optional)</Label>
                  <Input
                    id="payment_id"
                    name="payment_id"
                    type="text"
                    placeholder="Transaction Id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount*</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder=""
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="paid_at">Payment Date*</Label>
                    <Input id="paid_at" name="paid_at" type="date" required />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="paid_till">Membership Expiry Date*</Label>
                    <Input
                      id="paid_till"
                      name="paid_till"
                      type="date"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </div>
  );
}

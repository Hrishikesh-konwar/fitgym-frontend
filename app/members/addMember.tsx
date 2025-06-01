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

interface MemberFormProps {
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

export function AddMemberForm({ open, handleClose }: MemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email_id = formData.get("email") as string;
    const joined_at = formData.get("joined_at") as string;
    const phone = formData.get("phone") as string;

    if (!name || !email_id || !phone || !joined_at) {
      setError("Please provide all required fields");
      setIsLoading(false);
      return;
    }

    const token = getAuthToken(false);
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/members/createMembers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ name, email_id, phone, joined_at }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Failed to add member. Please try again.");
        setIsLoading(false);
        return;
      }
      if (data) {
        handleClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Error creating member:", err);
      setError("Something went wrong. Please try again.");
    } finally{
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
              <CardTitle className="text-2xl font-bold">Add Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Gym Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="number"
                    placeholder=""
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joined_at">Joining Date</Label>
                  <Input
                    id="joined_at"
                    name="joined_at"
                    type="date"
                    placeholder="Date of Joining"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Member
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </div>
  );
}

// app/members/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserPlus } from "lucide-react";
import { getAuthToken } from "@/components/token";
import MemberPaymentDrawer from "./payment";
import "react-modern-drawer/dist/index.css";

import { AddMemberForm } from "./addMember";

interface Member {
  id: string;
  name: string;
  email_id: string;
  phone: string;
  joined_at: string;
}

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(
    null
  );

  const [addMemberModal, setAddMemberModal] = useState(false);

  useEffect(() => {
    const token = getAuthToken(false);
    if (!token) return;

    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/members/getMembers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );

        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/gym.webp')" }}
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Member List
        </h2>
        <Button
          className="bg-white text-black hover:bg-white hover:text-black"
          onClick={() => setAddMemberModal(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4 mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground mt-2" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-black"
              />
            </div>
          </div>

          <div className="rounded-md border border-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Contact</TableHead>
                  <TableHead className="text-black">Email</TableHead>
                  <TableHead className="text-black">Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell
                      className="font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => {
                        setSelectedMemberId(member.id);
                        setSelectedMemberName(member.name);
                        setOpenDrawer(true);
                      }}
                    >
                      {member.name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1 text-muted-foreground text-black">
                        {member.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">{member.email_id}</div>
                    </TableCell>
                    <TableCell>
                      {moment(member.joined_at).format("DD-MM-YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MemberPaymentDrawer
        memberId={selectedMemberId}
        memberName={selectedMemberName}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />

      <AddMemberForm
        open={addMemberModal}
        handleClose={() => setAddMemberModal(false)}
      />
    </div>
  );
}

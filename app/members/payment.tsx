"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/components/token";
import Drawer from "react-modern-drawer";
import { AddPaymentForm } from "./addPayment";
import moment from "moment";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
interface MemberPaymentDrawerProps {
  memberId: string | null;
  memberName: string | null;
  open: boolean;
  onClose: () => void;
}

interface TimestampValue {
  value: number;
}

interface Payment {
  id: string;
  member_name: string;
  member_id: string;
  payment_type: string;
  amount: number;
  paid_at: TimestampValue;
  paid_till: TimestampValue;
  created_at: string;
}

export default function MemberPaymentDrawer({
  memberId,
  memberName,
  open,
  onClose,
}: MemberPaymentDrawerProps) {
  const [modal, setModal] = useState(false);
  
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken(false);
    if (!token || !memberId) return;

    const fetchMemberPayments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/getPayments?member_id=${memberId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            }
          }
        );
        const data = await res.json();
        setPaymentInfo(data);
      } catch (err) {
        console.error("Failed to fetch payment info:", err);
      }
    };

    fetchMemberPayments();
  }, [memberId]);

  const showModal = () => {
    onClose();
    setModal(true);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      direction="right"
      size="50%"
      className="p-4"
    >
      <div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-black bg-gray-200 px-2 py-1 shadow-sm"
        >
          ×
        </button>

        <div className="mt-12">
          <div className="flex items-center justify-between space-y-2 mb-2">
            <h2 className="text-3xl font-bold tracking-tight">Payment List</h2>
            <Button onClick={showModal}>Add Payment</Button>
          </div>
          {paymentInfo && paymentInfo.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 border-black">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Payment Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Paid Till</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paymentInfo.map((payment : Payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-4 py-3">{payment.payment_type}</td>
                      <td className="px-4 py-3">{payment.amount}</td>
                      <td className="px-4 py-3">
                      <td>{moment(payment.paid_at.value).format("DD-MMM-YYYY")}</td>
                      </td>
                      <td className="px-4 py-3">
                        {moment(payment.paid_till.value).format("DD-MMM-YYYY")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No payment information available.</p>
          )}
        </div>
      </div>

      <AddPaymentForm
        memberId = {memberId}
        memberName={memberName}
        open = {modal}
        handleClose = {()=>setModal(false)}
      />
    </Drawer>
  );
}

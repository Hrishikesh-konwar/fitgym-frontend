"use client";

import "react-modern-drawer/dist/index.css";
import "rsuite/dist/rsuite.min.css";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/components/token";
import { Users, TrendingUp } from "lucide-react";
import { DateRangePicker } from "rsuite";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function PaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [currentMonthAmount, setCurrentMonthAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const PAGE_SIZE = 20;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState<[Date, Date] | null>([
    startOfMonth,
    endOfMonth,
  ]);

  const [startDate, setStartDate] = useState(
    moment().startOf("months").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    moment().endOf("months").format("YYYY-MM-DD")
  );

  const handleChange = (value: [Date, Date] | null) => {
    setDateRange(value);
    if (value) {
      const [start, end] = value;
      setStartDate(moment(start).format("YYYY-MM-DD"));
      setEndDate(moment(end).format("YYYY-MM-DD"));
    }
  };

  useEffect(() => {
    const token = getAuthToken(false);
    if (!token) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/getPaymentsByGym?limit=${PAGE_SIZE}&offset=${offset}&startDate=${startDate}&endDate=${endDate}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const result = await res.json();
        setPaymentInfo(result.data || []);
        setHasMore(page * PAGE_SIZE < result.totalCount);

        setTotalAmount(result.totalAmount);
        setCurrentMonthAmount(result.currentMonthAmount);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [page, startDate, endDate]);

  const stats = [
    {
      title: "Revenue This Month",
      value: `Rs ${currentMonthAmount}`,
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: `Revenue ${moment(startDate, "YYYY-MM-DD").format(
        "DD MMM YY"
      )} to ${moment(endDate, "YYYY-MM-DD").format("DD MMM YY")}`,
      value: `Rs ${totalAmount}`,
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div
      className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/gym.webp')" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-white">Payment List</h2>
      </div>
      <DateRangePicker value={dateRange} onChange={handleChange} />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {paymentInfo && paymentInfo.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Date</th>
                <th className="px-4 py-3">Paid Till</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paymentInfo.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {payment.member_name}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {payment.id}
                  </td>
                  <td className="px-4 py-3">{payment.payment_type}</td>
                  <td className="px-4 py-3">{payment.amount}</td>
                  <td className="px-4 py-3">
                    {moment(payment.paid_at.value).format("DD-MMM-YYYY")}
                  </td>
                  <td className="px-4 py-3">
                    {moment(payment.paid_till.value).format("DD-MMM-YYYY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end items-center gap-4 px-4 py-3 bg-gray-50 border-t">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">Page {page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasMore || loading}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No payment information available.</p>
      )}
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/components/token";
import th from "date-fns/locale/th";
import moment from "moment";

export default function DashboardPage() {
  const [gymDetails, setGymDetails] = useState<string | null>(null);
  const [totalMembers, setTotalMenbers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const details = localStorage.getItem("gymDetails");
      if (details) {
        const parsed = JSON.parse(details);
        setGymDetails(parsed);
      }
    }

    const getDashboardDetails = async () => {
      const token = getAuthToken(false);
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/gyms/getDashboardDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      const data = await response.json();
      setTotalMenbers(data.memberCount);
      setRevenue(data.revenue);
      setUpcomingPayments(data.upcomingPayments);
      setActiveCount(data.totalActiveMembers);
    };

    getDashboardDetails();
  }, []);

  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      trend: "up",
    },
    {
      title: "Paid Members",
      value: activeCount,
      icon: Users,
      trend: "up",
    },
    {
      title: "Revenue This Month",
      value: `Rs ${revenue}`,
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div
      className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/gym.webp')" }}
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
        {/* <div className="flex items-center space-x-2">
          <Badge variant="outline">Live</Badge>
        </div> */}
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <h2 className="text-3xl font-bold tracking-tight text-center m-2">
            Membership Renew{" "}
          </h2>

          {upcomingPayments && upcomingPayments.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 mt-5 ml-5 mr-5 mb-5 border-black">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Payment Due</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {upcomingPayments.map(
                    (payment: {
                      name: string;
                      paid_till: { value: string };
                    }) => (
                      <tr
                        key={payment.name}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">{payment.name}</td>
                        <td className="px-4 py-3">
                          {moment(payment.paid_till.value).format(
                            "DD-MMM-YYYY"
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No pending payments.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

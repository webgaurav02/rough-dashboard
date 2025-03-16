"use client"

import { useEffect, useState } from "react"
import { Search, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./components/ThemeToggle"

function DashboardContent() {
  const [data, setData] = useState({ dashboardData: [], bookingDetails: [], totalSeats: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalImageUrl, setModalImageUrl] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/booking")
      const json = await res.json()
      setData(json)
    }
    fetchData()
    const intervalId = setInterval(fetchData, 5000)
    return () => clearInterval(intervalId)
  }, [])

  const filteredOrders = data.bookingDetails.filter((order) => {
    const query = searchQuery.toLowerCase()
    return (
      order.transactionId?.toString().toLowerCase().includes(query) ||
      order.paymentId?.toString().toLowerCase().includes(query) ||
      order.userId?.toString().toLowerCase().includes(query) ||
      order.bowl?.toString().toLowerCase().includes(query) ||
      order.numberOfSeats?.toString().toLowerCase().includes(query) ||
      order.status?.toString().toLowerCase().includes(query) ||
      order.totalAmount?.toString().toLowerCase().includes(query)
    )
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl)
  }

  const closeModal = () => {
    setModalImageUrl(null)
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ticket Dashboard</h1>
        <ThemeToggle />
      </div>
      <div className="mb-8 flex justify-center">
        <Card className="w-64 bg-green-500 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-gray-700 dark:text-gray-200">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">{data.totalSeats}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mb-6 flex justify-center">
        <div className="relative w-1/2 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <Input type="text" placeholder="Search booking orders..." value={searchQuery} onChange={handleSearchChange} className="pl-10" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Booking Orders</h2>
      <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Razorpay</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Bowl</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-center">Ticket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.transactionId}</TableCell>
                <TableCell>{order.paymentId || "-"}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>{order.bowl}</TableCell>
                <TableCell>{order.numberOfSeats}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                </TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell className="text-center">
                  {order.imageUrl && (
                    <Button variant="outline" size="sm" onClick={() => openModal(order.imageUrl)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!modalImageUrl} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket Image</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {modalImageUrl && <img src={modalImageUrl} alt="Ticket" className="max-h-[70vh]" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default function Dashboard() {
  return (
      <DashboardContent />
  )
}

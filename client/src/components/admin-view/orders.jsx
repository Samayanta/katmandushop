import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Loader2, Search } from "lucide-react";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  setFilters,
  setPagination,
  setSortConfig,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { exportToExcel } from "@/lib/utils";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const {
    orderList,
    orderDetails,
    isLoading,
    error,
    filters,
    pagination,
    sortConfig,
  } = useSelector((state) => state.adminOrder);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    return orderList.filter(order =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderList, searchTerm]);

  const handleFetchOrderDetails = (getId) => {
    dispatch(getOrderDetailsForAdmin(getId)).then(() => {
      setOpenDetailsDialog(true);
    });
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSortConfig({ field, direction }));
  };

  const handleExport = () => {
    const data = filteredOrders.map(order => ({
      'Order ID': order._id,
      'Customer': order.user?.name || 'N/A',
      'Date': new Date(order.orderDate).toLocaleString(),
      'Status': order.orderStatus,
      'Payment Status': order.paymentStatus,
      'Amount': order.totalAmount
    }));
    exportToExcel(data, 'orders-export');
  };

  useEffect(() => {
    dispatch(getAllOrdersForAdmin({ filters, pagination, sort: sortConfig }));
    const interval = setInterval(() => {
      dispatch(getAllOrdersForAdmin({ filters, pagination, sort: sortConfig }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, filters, pagination, sortConfig]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders Management</h2>
        <Button onClick={handleExport} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => handleFilterChange('paymentStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.start ? (
                    filters.dateRange.end ? (
                      <>
                        {format(filters.dateRange.start, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.end, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.start, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={{
                    from: filters.dateRange.start,
                    to: filters.dateRange.end,
                  }}
                  onSelect={(range) =>
                    handleFilterChange('dateRange', {
                      start: range?.from,
                      end: range?.to,
                    })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-normal">
              Total Orders: {pagination.totalItems}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('_id')}
                    >
                      Order ID
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('user.name')}
                    >
                      Customer Name
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('orderDate')}
                    >
                      Date
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('totalAmount')}
                    >
                      Amount
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((orderItem) => (
                      <TableRow
                        key={orderItem._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{orderItem._id}</TableCell>
                        <TableCell>{orderItem?.user?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{new Date(orderItem?.orderDate).toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(orderItem?.orderDate).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={orderItem?.orderStatus} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={orderItem?.paymentStatus} />
                        </TableCell>
                        <TableCell className="font-medium">रु{orderItem?.totalAmount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFetchOrderDetails(orderItem?._id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);
          if (!open) {
            dispatch(resetOrderDetails());
          }
        }}
      >
        {isLoading ? (
          <DialogContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </DialogContent>
        ) : error ? (
          <DialogContent>
            <div className="text-center text-red-500 p-4">{error}</div>
          </DialogContent>
        ) : orderDetails ? (
          <AdminOrderDetailsView orderDetails={orderDetails} />
        ) : null}
      </Dialog>
    </div>
  );
}

// Utility components for status badges
const OrderStatusBadge = ({ status }) => {
  const variants = {
    completed: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    pending: "bg-orange-500 hover:bg-orange-600",
    processing: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <Badge className={`${variants[status] || variants.pending} transition-colors`}>
      {status}
    </Badge>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const variants = {
    paid: "border-green-500 text-green-500",
    failed: "border-red-500 text-red-500",
    pending: "border-yellow-500 text-yellow-500",
  };

  return (
    <Badge variant="outline" className={variants[status] || variants.pending}>
      {status}
    </Badge>
  );
};

export default AdminOrdersView;

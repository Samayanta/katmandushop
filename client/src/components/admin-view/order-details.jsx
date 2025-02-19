import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useDispatch } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "select",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const defaultFilters = {
    status: 'all',
    paymentStatus: 'all',
    dateRange: {
      start: null,
      end: null
    }
  };

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    if (!status || status === "select") {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin({ filters: defaultFilters, pagination: { currentPage: 1, itemsPerPage: 10 }, sort: { field: 'orderDate', direction: 'desc' } }));
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      } else if (data?.error) {
        toast({
          title: data.error,
          variant: "destructive",
        });
      }
    }).catch((error) => {
      toast({
        title: error?.message || "Failed to update order status",
        variant: "destructive",
      });
    });
  }

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      rejected: "bg-red-500",
      paid: "bg-green-500",
      failed: "bg-red-500",
      default: "bg-gray-500"
    };
    return statusColors[status] || statusColors.default;
  };

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          Order placed on {new Date(orderDetails?.orderDate).toLocaleString()}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Order Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-medium truncate">{orderDetails?._id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Order Status</p>
            <Badge className={getStatusBadgeColor(orderDetails?.orderStatus)}>
              {orderDetails?.orderStatus}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">{orderDetails?.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <Badge className={getStatusBadgeColor(orderDetails?.paymentStatus)}>
              {orderDetails?.paymentStatus}
            </Badge>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Order Items</h3>
            <Badge variant="outline">
              Total Items: {orderDetails?.cartItems?.length || 0}
            </Badge>
          </div>
          <div className="space-y-3">
            {orderDetails?.cartItems?.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">
                        Qty: {item.quantity}
                      </Badge>
                      {item.selectedColor && (
                        <Badge variant="outline" className="capitalize">
                          Color: {item.selectedColor}
                        </Badge>
                      )}
                      {item.selectedSize && (
                        <Badge variant="outline" className="capitalize">
                          Size: {item.selectedSize}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        रु{item.price} each
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">रु{Number(item.price) * item.quantity}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="text-xl font-bold">रु{orderDetails?.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Details</h3>
            <div className="space-y-2 p-4 border rounded-lg">
              <p><span className="text-muted-foreground">Name:</span> {orderDetails?.user?.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {orderDetails?.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Shipping Address</h3>
            <div className="space-y-2 p-4 border rounded-lg">
              <p className="font-medium">{orderDetails?.addressInfo?.address}</p>
              <p>{orderDetails?.addressInfo?.city}</p>
              <p>{orderDetails?.addressInfo?.pincode}</p>
              <p><span className="text-muted-foreground">Phone:</span> {orderDetails?.addressInfo?.phone}</p>
              {orderDetails?.addressInfo?.notes && (
                <p><span className="text-muted-foreground">Notes:</span> {orderDetails?.addressInfo?.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Update */}
        {orderDetails && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Update Order Status</h3>
            <div className="grid gap-4">
              <CommonForm
                formControls={[
                  {
                    label: "Order Status",
                    name: "status",
                    componentType: "select",
                    options: [
                      { id: "select", label: "Select Status" },
                      { id: "pending", label: "Pending" },
                      { id: "processing", label: "Processing" },
                      { id: "completed", label: "Completed" },
                      { id: "rejected", label: "Rejected" },
                    ],
                  },
                ]}
                formData={formData}
                setFormData={setFormData}
                buttonText="Update Status"
                onSubmit={handleUpdateStatus}
              />
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;

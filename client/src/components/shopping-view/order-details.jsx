import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Package, Truck, Calendar, CreditCard } from "lucide-react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
      case "paid":
        return "bg-green-500";
      case "rejected":
      case "failed":
        return "bg-red-600";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-black";
    }
  };

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Order Summary Card */}
        <div className="bg-muted rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order #{orderDetails?._id}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(orderDetails?.orderDate).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">रु{orderDetails?.totalAmount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-3 bg-background p-3 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Order Status</p>
                <Badge className={getStatusBadgeColor(orderDetails?.orderStatus)}>
                  {orderDetails?.orderStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background p-3 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{orderDetails?.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background p-3 rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge className={getStatusBadgeColor(orderDetails?.paymentStatus)}>
                  {orderDetails?.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center justify-between">
            Order Items
            <Badge variant="outline" className="ml-2">
              {orderDetails?.cartItems?.length} items
            </Badge>
          </h3>
          <div className="space-y-3">
            {orderDetails?.cartItems?.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <Badge 
                        className="absolute -top-2 -right-2 bg-primary"
                        variant="secondary"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{item.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedColor && (
                        <Badge variant="outline" className="capitalize">
                          {item.selectedColor}
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
                  <p className="font-bold text-lg">रु{Number(item.price) * item.quantity}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Customer & Shipping Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Details</h3>
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Shipping Address</h3>
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{orderDetails?.addressInfo?.address}</p>
                <p>{orderDetails?.addressInfo?.city}</p>
                <p>{orderDetails?.addressInfo?.pincode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{orderDetails?.addressInfo?.phone}</p>
              </div>
              {orderDetails?.addressInfo?.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Notes</p>
                  <p className="font-medium">{orderDetails?.addressInfo?.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;


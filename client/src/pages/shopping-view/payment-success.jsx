import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUserCart, resetCart } from "@/store/shop/cart-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { capturePayment } from "@/store/shop/order-slice";
import { CheckCircle2 } from "lucide-react";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  
  // Get pidx, orderId and status from URL search params
  const searchParams = new URLSearchParams(location.search);
  const pidx = searchParams.get('pidx');
  const orderId = searchParams.get('purchase_order_id');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('status'));

  useEffect(() => {
    const processPayment = async () => {
      if (!pidx) {
        setError('Missing payment verification token');
        setIsProcessing(false);
        return;
      }

      try {
        // Clear cart first to avoid race conditions
        dispatch(resetCart());
          
        // Clear backend cart if user exists
        if (user?.id) {
          await dispatch(clearUserCart(user.id)).unwrap();
        }

        // Then verify payment
        const result = await dispatch(capturePayment({ pidx, orderId })).unwrap();
        
        if (result?.success) {
          // Refresh admin orders list
          dispatch(getAllOrdersForAdmin());
          setPaymentStatus('Completed');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        // Check if status in URL is "Completed" regardless of API error
        if (searchParams.get('status') === 'Completed') {
          // Payment completed successfully according to Khalti
          setPaymentStatus('Completed');
          setError(null);
        } else {
          setError('Payment verification failed. If amount was deducted, please contact support.');
          setPaymentStatus('Failed');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    if (pidx && orderId) {
      processPayment();
    }
  }, [dispatch, user, pidx, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center space-y-4">
          <CheckCircle2 
            className={`w-16 h-16 mx-auto ${
              paymentStatus === 'Completed' ? 'text-green-500' : 
              paymentStatus === 'Processing' ? 'text-yellow-500' : 'text-red-500'
            }`} 
          />
          <CardTitle className="text-3xl">
            {paymentStatus === 'Completed' ? 'Payment Successful!' :
             paymentStatus === 'Processing' ? 'Payment Processing' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            {paymentStatus === 'Completed' 
              ? "Thank you for your purchase. Your order has been confirmed and will be processed shortly."
              : paymentStatus === 'Processing'
              ? "Your payment is being processed. We'll update you once it's confirmed."
              : "There was an issue with your payment. Please try again or contact support."}
          </p>
          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : null}
          
          {isProcessing ? (
            <p className="text-gray-600">Processing your payment and finalizing order...</p>
          ) : (
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full" 
                onClick={() => navigate("/shop/account")}
                size="lg"
              >
                View Orders
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/shop/home")}
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;

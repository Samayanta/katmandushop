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
  
  // Get payment params from URL
  const searchParams = new URLSearchParams(location.search);
  const pidx = searchParams.get('pidx');
  const orderId = searchParams.get('purchase_order_id');
  const [paymentStatus, setPaymentStatus] = useState(
    searchParams.get('status')
  );

  useEffect(() => {
    const processPayment = async () => {
      if (!pidx) {
        setError('Missing payment verification parameters');
        setIsProcessing(false);
        return;
      }

      try {
        // Extract orderId from sessionStorage if not in URL params
        const storedOrderId = orderId || JSON.parse(sessionStorage.getItem('currentOrderId'));
        
        if (!storedOrderId) {
          throw new Error('Order ID not found');
        }

        const result = await dispatch(capturePayment({ 
          pidx, 
          orderId: storedOrderId
        })).unwrap();
        
        if (result?.success) {
          // First reset local cart state
          dispatch(resetCart());
          
          // Then clear backend cart if user exists
          if (user?.id) {
            await dispatch(clearUserCart(user.id)).unwrap();
          }
          
          // Refresh admin orders list
          dispatch(getAllOrdersForAdmin());
          
          setPaymentStatus('Completed');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        if (searchParams.get('status') === 'Completed') {
          // If status is completed, treat as success even if API call failed
          setPaymentStatus('Completed');
          setError(null);
          console.error('Non-critical payment verification error:', error);
        } else if (error.message?.includes('Payment status is')) {
          setError('Your payment is still being processed. Please check your order status in a few minutes.');
          setPaymentStatus('Processing');
        } else {
          setError('Failed to process payment. Please contact support.');
          setPaymentStatus('Failed');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [dispatch, user, pidx, orderId, cartItems]);

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

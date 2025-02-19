import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    // Find product in productList
    const product = productList.find(p => p._id === getCartItem.productId);
    
    if (!product) {
      toast({
        title: "Product not found",
        variant: "destructive",
      });
      return;
    }

    const newQuantity = typeOfAction === "plus" 
      ? getCartItem.quantity + 1 
      : getCartItem.quantity - 1;

    // Check stock availability
    if (typeOfAction === "plus" && newQuantity > product.totalStock) {
      toast({
        title: `Only ${product.totalStock} items available in stock`,
        variant: "destructive",
      });
      return;
    }

    // Don't allow quantity below 1
    if (newQuantity < 1) {
      return;
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem.productId,
        quantity: newQuantity,
        selectedColor: getCartItem.selectedColor || "default"
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item updated successfully",
        });
      } else if (data?.error) {
        toast({
          title: data.error?.message || "Failed to update cart",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      console.error('Cart update error:', error);
      toast({
        title: "Failed to update cart",
        variant: "destructive",
      });
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ 
        userId: user?.id, 
        productId: getCartItem.productId 
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item deleted successfully",
        });
      } else {
        toast({
          title: "Failed to delete item",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      console.error('Cart delete error:', error);
      toast({
        title: "Failed to delete item",
        variant: "destructive",
      });
    });
  }

  if (!cartItem) return null;

  return (
    <div className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg border">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-sm sm:text-base truncate">{cartItem?.title}</h3>
        {cartItem?.selectedColor !== "default" && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Color: {cartItem?.selectedColor}
          </p>
        )}
        {cartItem?.selectedSize !== "default" && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Size: {cartItem?.selectedSize}
          </p>
        )}
        <div className="flex items-center gap-1 sm:gap-2 mt-2">
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity <= 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold text-sm sm:text-base min-w-[20px] text-center">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold text-sm sm:text-base">
          रू {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toLocaleString('en-IN')}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
          size={18}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;

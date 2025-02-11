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
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity <= 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;

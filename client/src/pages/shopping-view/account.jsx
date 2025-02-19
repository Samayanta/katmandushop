import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { Card } from "@/components/ui/card";
import { MapPin, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.userName || 'User Name')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user?.userName}</h1>
              <p className="text-primary-foreground/80">{user?.email}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <Tabs defaultValue="orders" className="w-full">
            <div className="border-b">
              <TabsList className="h-16 w-full justify-start gap-4 bg-transparent pl-4">
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Addresses
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="orders" className="m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Your Orders</h2>
                    <Button variant="outline">
                      Filter Orders
                    </Button>
                  </div>
                  <ShoppingOrders />
                </div>
              </TabsContent>

              <TabsContent value="address" className="m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Saved Addresses</h2>
                  </div>
                  <Address />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default ShoppingAccount;

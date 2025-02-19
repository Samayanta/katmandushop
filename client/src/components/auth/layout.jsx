import { Outlet } from "react-router-dom";
import logo from "../../assets/katmandu-shop-high-resolution-logo-transparent.png";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex flex-col items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-8 text-center">
          <h1 className="flex text-8xl jsutify-center font-extrabold tracking-tight text-white">
            Welcome to
          </h1>
          <div className="flex justify-center w-full">
            <img
              src={logo}
              alt="Katmandu Shop Logo"
              className="w-100 h-auto object-contain"
            />
          </div>
          <p className="text-xl text-gray-400 mt-4">
            Your one-stop destination for quality products
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex flex-col items-center justify-center pt-8 pb-4 bg-black">
          <h1 className="text-4xl font-extrabold text-black mb-4">

          </h1>
          <img
            src={logo}
            alt="Katmandu Shop Logo"
            className="w-40 h-auto object-contain"
          />
        </div>
        <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Menu from "@/components/Menu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex w-full h-full">
        <div className="flex grow bg-slate-50" />
        <div className="flex w-full h-full xl:max-w-screen-2xl">
          <Menu />
          {children}
        </div>
        <div className="grow flex" />
      </div>
      <ToastContainer />
    </>
  );
}

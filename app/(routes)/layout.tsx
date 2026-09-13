import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMetadata } from "@/lib/api/metadata";

export default async function RootLayout({ children }: Readonly<{children: ReactNode}>) {

  const metadata = await getMetadata()

  return (
    <div>
      <Header />
        {children}
      <Footer makes={metadata.makes} />
    </div>
  );
}

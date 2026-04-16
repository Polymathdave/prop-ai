import Link from "next/link"
import Image from "next/image"


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return  <div className="grid min-h-svh lg:grid-cols-2">
  <div className="flex flex-col gap-4 p-6 md:p-10">
    <div className="flex justify-center gap-2 md:justify-start">
      <Link href="/" className="flex items-center gap-2 font-medium">
       <Image
                        src="/logo-light.png"
                        alt="logo"
                        width={90}
                        height={25}
                      />
      </Link>
    </div>
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xs">
        {children}
      </div>
    </div>
  </div>
  <div className="bg-muted relative hidden lg:block">
    {/* <Image
      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop"
      alt="Modern residential property interior"
      fill
      className="object-cover dark:brightness-[0.2] dark:grayscale"
    /> */}
  </div>
</div>;
}
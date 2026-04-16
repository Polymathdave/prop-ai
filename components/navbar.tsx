"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    async function checkAuth() {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session?.data?.user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-0 h-auto font-bold text-xl text-foreground hover:bg-transparent"
            >
              🏠 Prop AI
            </Link>
          </div>

          {/* Auth buttons */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Button variant="default" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="secondary" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

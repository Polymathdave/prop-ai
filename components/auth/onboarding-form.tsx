"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"user" | "landlord" | "agent">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (e: React.FormEvent) => {
    e.preventDefault();

    // If user selected "user" role, update and redirect immediately
    if (role === "user") {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user/update-role", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "user" }),
        });

        if (!response.ok) {
          setError("Failed to update account type. Please try again.");
          setIsLoading(false);
          return;
        }

        toast.success("Welcome to Prop AI!");
        router.push("/");
        router.refresh();
      } catch (err) {
        console.error("Error updating role:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    } else {
      // For landlord or agent, proceed to details step
      setStep("details");
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phone") as string;

    // Basic phone validation
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setError("Please enter a valid phone number");
      setIsLoading(false);
      return;
    }

    try {
      // Update user role
      const roleResponse = await fetch("/api/user/update-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!roleResponse.ok) {
        setError("Failed to update account type. Please try again.");
        setIsLoading(false);
        return;
      }

      // Create user profile with phone number
      const profileResponse = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!profileResponse.ok) {
        setError("Failed to save profile details. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Profile setup complete!");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (step === "details") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleDetailsSubmit}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Contact Information</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We need your phone number to help property seekers reach you
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              required
            />
          </Field>
          

          {error && <FieldError className="text-center">{error}</FieldError>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("role")}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Setting up..." : "Complete Setup"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleRoleSelection}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome to Prop AI!</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Let&apos;s get your account set up
          </p>
        </div>
        <FieldSet>
          <FieldLabel htmlFor="account-type">
            Choose your account type to continue
          </FieldLabel>
          <RadioGroup
            defaultValue="user"
            onValueChange={(value) => setRole(value as typeof role)}
          >
            <FieldLabel htmlFor="user">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Regular User</FieldTitle>
                  <FieldDescription>
                    Set up alerts for properties that match your criteria.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="user" id="user" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="landlord">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Landlord</FieldTitle>
                  <FieldDescription>
                    List your properties for rent or sale.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="landlord" id="landlord" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="agent">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Real Estate Agent</FieldTitle>
                  <FieldDescription>
                    List multiple properties on behalf of clients.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="agent" id="agent" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>

        <Field>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading
              ? "Setting up..."
              : role === "user"
              ? "Continue to Dashboard"
              : "Continue"}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

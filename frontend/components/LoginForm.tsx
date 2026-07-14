"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const DEMO_EMAIL = "demo@demo.com"
const DEMO_PASSWORD = "siamSiam1@"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setStatus(null)

    const apiBase = process.env.NEXT_PUBLIC_API
    if (!apiBase) {
      setStatus("NEXT_PUBLIC_API is not configured")
      return
    }

    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      if (!res.ok) {
        setStatus("Login failed")
        return
      }

      const data = await res.json()
      if (data?.token) {
        // Persist the JWT however your app manages auth (e.g. cookie / context).
        localStorage.setItem("token", data.token)
      }

      setStatus("Logged in")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Network error")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleLogin(email, password)
  }

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    void handleLogin(DEMO_EMAIL, DEMO_PASSWORD)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-3 py-2"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-primary-foreground"
          >
            Login
          </button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full rounded-md border px-3 py-2"
        >
          Demo Login
        </button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </CardFooter>
    </Card>
  )
}

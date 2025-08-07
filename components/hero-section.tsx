import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Connect with
            <span className="text-primary block sm:inline sm:ml-3">Professional Drivers</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find verified, experienced drivers for your daily commute or monthly needs. Safe, reliable, and affordable
            transportation solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/find-driver">
              <Button size="lg" className="w-full sm:w-auto">
                Find a Driver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/become-driver">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Become a Driver
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Verified Drivers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

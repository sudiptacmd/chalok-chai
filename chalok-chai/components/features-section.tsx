import { Card, CardContent } from "@/components/ui/card"
import { Shield, MapPin, CreditCard, MessageCircle, Calendar, Star } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified Drivers",
    description: "All drivers are background checked with verified licenses and documents",
  },
  {
    icon: MapPin,
    title: "Location Based",
    description: "Find drivers in your area with real-time location tracking",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and secure payment processing with multiple payment options",
  },
  {
    icon: MessageCircle,
    title: "In-App Chat",
    description: "Communicate directly with drivers through our secure messaging system",
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Book drivers for daily trips or monthly arrangements",
  },
  {
    icon: Star,
    title: "Rating System",
    description: "Rate and review drivers to help maintain quality service",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose ChalokChai?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide a safe, reliable, and convenient platform to connect car owners with professional drivers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 bg-background/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

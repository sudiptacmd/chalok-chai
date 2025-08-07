import { Card, CardContent } from "@/components/ui/card"
import { Search, UserCheck, Car, Star } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search Drivers",
    description: "Browse and filter drivers based on location, experience, and preferences",
  },
  {
    icon: UserCheck,
    title: "Choose & Book",
    description: "Select your preferred driver and send a booking request",
  },
  {
    icon: Car,
    title: "Get Driving",
    description: "Meet your driver and enjoy safe, professional transportation",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share your experience to help other users make informed decisions",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with ChalokChai is simple and straightforward
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 bg-muted/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

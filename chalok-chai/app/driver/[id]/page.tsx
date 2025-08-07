import { DriverProfilePage } from "@/components/driver-profile-page"

export default function DriverProfile({ params }: { params: { id: string } }) {
  return <DriverProfilePage driverId={params.id} />
}

import { DriverProfilePage } from "@/components/driver-profile-page"

export default async function DriverProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DriverProfilePage driverId={id} />
}

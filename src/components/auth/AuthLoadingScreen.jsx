import Spinner from "../ui/Spinner";

export default function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] gap-3">
      <Spinner size="md" />
      <p className="text-sm text-gray-500 font-medium">Checking session…</p>
    </div>
  );
}

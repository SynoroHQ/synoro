import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6">
      <Link className="underline" href="/dashboard">
        Go to Dashboard
      </Link>
    </div>
  );
}

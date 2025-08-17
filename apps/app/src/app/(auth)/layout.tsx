export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative container flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left side - Branding */}
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white lg:flex">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3Z" />
              <path d="M9 6v12a3 3 0 1 1-3-3h12a3 3 0 1 1-3 3V6a3 3 0 1 1 3 3Z" />
            </svg>
            Synoro - Личный кабинет
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Организуйте свою жизнь с помощью умного планирования и
                аналитики.&rdquo;
              </p>
              <footer className="text-sm">Ваш персональный помощник</footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import CalendarioMensalRealTime from '../CalendarioMensalRealTime';
import { ThemeSelector } from '../components/ThemeSelector';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-foreground hidden sm:inline">
                Sistema de Vendas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <CalendarioMensalRealTime isActive={true} />
      </div>
    </main>
  );
}

import CalendarioMensalRealTime from '@/CalendarioMensalRealTime';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <CalendarioMensalRealTime isActive={true} />
    </main>
  );
}

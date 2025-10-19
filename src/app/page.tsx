import VoiceAgent from "./components/VoiceAgent";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            GPT Realtime Voice Agent
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Experience natural voice conversations with AI
          </p>
        </div>
        <VoiceAgent />
      </div>
    </main>
  );
}

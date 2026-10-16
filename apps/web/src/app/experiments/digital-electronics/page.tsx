'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DigitalLabWorkbench } from './components/digital-lab-workbench';

function DigitalElectronicsLabContent() {
  const searchParams = useSearchParams();
  const expParam = searchParams.get('exp') || undefined;
  return <DigitalLabWorkbench initialExpId={expParam} />;
}

export default function DigitalElectronicsLabPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] flex items-center justify-center font-mono text-xs text-zinc-500">
          Loading Digital Electronics Workbench...
        </div>
      }
    >
      <DigitalElectronicsLabContent />
    </Suspense>
  );
}

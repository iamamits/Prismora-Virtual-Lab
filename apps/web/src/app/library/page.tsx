import React from 'react';
import Link from 'next/link';
import { Library, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@prismora/ui';

export default function LibraryPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
          <Library className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Prismora Library</h1>
        <p className="text-xs text-zinc-500">
          Discover, save, and share version-controlled experiment configurations and classroom assignment templates.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href="/experiments/projectile-motion">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
              <span>Open Projectile Motion Experiment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="w-full text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Explore Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
